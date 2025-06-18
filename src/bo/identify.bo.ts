
import { Contact } from "../models/Contacts.model";
import { IdentifyDao } from "../dao/identify.dao";

/**
 * Business logic class for identifying and linking contacts.
 * Handles deduplication and linking of contacts using email and/or phone number.
    */
export class IdentifyBO {
    // Singleton instance for consistent reuse
    private identifyDao: IdentifyDao;

    // Private constructor to enforce singleton pattern
    public static instance: IdentifyBO = new IdentifyBO();
    private constructor() {
        this.identifyDao = new IdentifyDao();
    }

    /**
     * Finds an existing contact or inserts a new one if none exist.
     * Ensures that only one primary contact exists and links others as secondary.
     *
     * @param email - The contact's email (can be null)
     * @param phoneNumber - The contact's phone number (can be null)
     * @returns A unified contact response with primary and secondary contact details
     */

    public async findContact(email: string | null, phoneNumber: string | null) {
        const contacts: Contact[] = await this.identifyDao.findAllContacts(email, phoneNumber);
        // 🚨 No matching contact found — insert a new primary contact
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
        // 🧩 Identify all primary contacts from the result
        let primaryContacts = contacts.filter(c => c.linkPrecedence === "primary");

        // 🔁 If multiple primary contacts, resolve one as secondary
        if (primaryContacts.length > 1) {
            // Pick the oldest as true primary
            primaryContacts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            const realPrimary = primaryContacts[0];
            const toDemote = primaryContacts.slice(1);
            // Update all other primaries to be secondaries linked to the real primary
            for (const contact of toDemote) {
                if (contact.linkPrecedence === "primary") {
                    await this.identifyDao.updateLinkToSecondary(contact.id, realPrimary.id);
                }
            }
            // Fetch updated list of contacts after demotion
            const updatedContacts = await this.identifyDao.findAllContacts(email, phoneNumber, realPrimary.id);

            return this.buildResponse(realPrimary, updatedContacts);
        }

        const primaryContact: Contact = contacts.find(c => c.linkPrecedence === "primary") || await this.identifyDao.findContactById(contacts[0].linkedId);
        const primaryId = primaryContact.linkedId ?? primaryContact.id;
        // 🧾 If exact match doesn't exist, insert a secondary contact
        const exactMatch = await this.identifyDao.findExactContacts(email, phoneNumber);
        if (!exactMatch) {
            await this.identifyDao.insertContact({ email, phoneNumber, linkPrecedence: 'secondary', linkedId: primaryId })
        }
        const updatedContacts = await this.identifyDao.findAllContacts(email, phoneNumber, primaryId);

        return this.buildResponse(primaryContact, updatedContacts)

    }

    /**
    * Builds a unified contact response object with:
    * - Primary contact ID
    * - All unique emails and phone numbers
    * - List of secondary contact IDs
    *
    * @param primary - The primary contact object
    * @param contacts - List of all associated contacts
    */
    private buildResponse(primary: Contact, contacts: Contact[]) {
        const primaryId = primary.linkedId ?? primary.id;

        // 📧 Collect unique emails
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

        // 📞 Collect unique phone numbers
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

        // 🧾 Collect IDs of secondary contacts

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