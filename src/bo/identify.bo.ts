
import { Contact } from "../models/Contacts.model";
import { IdentifyDao } from "../dao/identify.dao";
export class IdentifyBO {
    private identifyDao: IdentifyDao;
    public static instance: IdentifyBO = new IdentifyBO();
    private constructor() {
        this.identifyDao = new IdentifyDao();
    }

    public async findContact(email: string | null, phoneNumber: string | null) {
        const contacts: Contact[] = await this.identifyDao.findAllContacts(email, phoneNumber);
        if (contacts.length === 0) {
            const id = await this.identifyDao.insertContact({ email, phoneNumber });
            return this.buildResponse({
                id,
                email,
                phoneNumber,
                linkedId: null,
                linkPrecedence: "primary",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                deletedAt: null,
            }, []);
        }
        let primaryContacts = contacts.filter(c => c.linkPrecedence === "primary");

        // 🔁 If multiple primary contacts, resolve one as secondary
        if (primaryContacts.length > 1) {
            // Pick the oldest as true primary
            primaryContacts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            const realPrimary = primaryContacts[0];
            const toDemote = primaryContacts.slice(1);
            for (const contact of toDemote) {
                if (contact.linkPrecedence === "primary") {
                    await this.identifyDao.updateLinkToSecondary(contact.id, realPrimary.id);
                }
            }
            const updatedContacts = await this.identifyDao.findAllContacts(email, phoneNumber, realPrimary.id);

            return this.buildResponse(realPrimary, updatedContacts);
        }

        const primaryContact: Contact = contacts.find(c => c.linkPrecedence === "primary") || await this.identifyDao.findContactById(contacts[0].linkedId);
        const primaryId = primaryContact.linkedId ?? primaryContact.id;
        const exactMatch = await this.identifyDao.findExactContacts(email, phoneNumber);
        if (!exactMatch) {
            await this.identifyDao.insertContact({ email, phoneNumber, linkPrecedence: 'secondary', linkedId: primaryId })
        }
        const updatedContacts = await this.identifyDao.findAllContacts(email, phoneNumber, primaryId);

        return this.buildResponse(primaryContact, updatedContacts)

    }
    private buildResponse(primary: Contact, contacts: Contact[]) {
        const primaryId = primary.linkedId ?? primary.id;

        const emails = [
            primary.email!,
            ...Array.from(
                new Set(
                    contacts
                        .filter(c => c.email && c.email !== primary.email)
                        .map(c => c.email!)
                )
            )
        ];

        const phoneNumbers = [
            primary.phoneNumber!,
            ...Array.from(
                new Set(
                    contacts
                        .filter(c => c.phoneNumber && c.phoneNumber !== primary.phoneNumber)
                        .map(c => c.phoneNumber!)
                )
            )
        ];

        const secondaryContactIds = Array.from(
            new Set(
                contacts
                    .filter(c => c.linkPrecedence === "secondary" && c.linkedId === primaryId)
                    .map(c => c.id!)
            )
        );

        return {
            contact: {
                primaryContactId: primaryId,
                emails,
                phoneNumbers,
                secondaryContactIds,
            }
        };
    }
}