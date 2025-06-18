import { db } from '../config/dbConnection'
import { Contact } from '../models/Contacts.model'
export class IdentifyDao {

    async findAllContacts(email: string | null, phoneNumber: string | null, linkedId?: number | null): Promise<Contact[]> {
        const [rows] = await db.query(
            'SELECT * FROM contacts WHERE (phoneNumber = ? OR email = ?OR linkedId=?)',
            [phoneNumber, email, linkedId]
        );
        const result = (rows as Contact[]);
        return result;
    }
    async findContactById(id: number | null | undefined): Promise<Contact> {
        const [rows] = await db.query(
            'SELECT * FROM contacts WHERE  id=? AND linkPrecedence=?',
            [id, 'primary']
        );
        const result = (rows as Contact[])[0];
        return result;
    }

    async findExactContacts(email: string | null, phoneNumber: string | null): Promise<boolean> {
        const [rows] = await db.query(
            'SELECT * FROM contacts WHERE (phoneNumber = ? AND email = ?)',
            [phoneNumber, email]
        );
        if ((rows as Contact[]).length === 0) {
            return false;
        }
        return true;
    }
    async insertContact(contact: Partial<Contact>): Promise<number> {
        const [result] = await db.query(
            `INSERT INTO contacts (email, phoneNumber,linkedId, linkPrecedence, createdAt, updatedAt)
           VALUES (?, ?, ?,?, NOW(), NOW())`,
            [contact.email, contact.phoneNumber, contact.linkedId ?? null, contact.linkPrecedence ?? 'primary']
        );
        return (result as any).insertId;
    }
    async updateLinkToSecondary(contactId: number, primaryId: number): Promise<void> {
        await db.query(
            `UPDATE contacts
           SET linkPrecedence = 'secondary', linkedId = ?, updatedAt = NOW()
           WHERE id = ?`,
            [primaryId, contactId]
        );
    }

}