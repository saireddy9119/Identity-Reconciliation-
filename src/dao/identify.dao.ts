import { db } from '../config/dbConnection'
import { Contact } from '../models/Contacts.model'

/**
 * Data Access Object (DAO) for interacting with the 'contacts' table.
 * Handles all DB operations related to finding, inserting, and updating contact records.
 */
export class IdentifyDao {


    /**
     * Finds all contacts matching the provided email, phone number, or linked ID.
     * Returns an array of Contact objects.
     *
     * @param email - The contact's email (can be null)
     * @param phoneNumber - The contact's phone number (can be null)
     * @param linkedId - Optional linked ID to filter contacts
     */


    async findAllContacts(email: string | null, phoneNumber: string | null, linkedId?: number | null): Promise<Contact[]> {
        const [rows] = await db.query(
            'SELECT * FROM contacts WHERE (phoneNumber = ? OR email = ?OR linkedId=?)',
            [phoneNumber, email, linkedId]
        );
        const result = (rows as Contact[]);
        return result;
    }

    /**
     * Finds a contact by its ID where the contact is marked as a 'primary' contact.
     *
     * @param id - The unique ID of the contact
     * @returns The corresponding Contact object (if found)
     */
    async findContactById(id: number | null | undefined): Promise<Contact> {
        const [rows] = await db.query(
            'SELECT * FROM contacts WHERE  id=? AND linkPrecedence=?',
            [id, 'primary']
        );
        const result = (rows as Contact[])[0];
        return result;
    }


    /**
     * Checks if a contact with the exact given email and phone number combination exists.
     *
     * @param email - The email to match
     * @param phoneNumber - The phone number to match
     * @returns Boolean indicating whether an exact match exists
     */
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

    /**
     * Inserts a new contact into the 'contacts' table.
     * If not specified, the contact is marked as 'primary' and not linked to any other.
     *
     * @param contact - Partial contact object to insert (must include at least email or phoneNumber)
     * @returns The ID of the newly inserted contact
     */
    async insertContact(contact: Partial<Contact>): Promise<number> {
        const [result] = await db.query(
            `INSERT INTO contacts (email, phoneNumber,linkedId, linkPrecedence, createdAt, updatedAt)
           VALUES (?, ?, ?,?, NOW(), NOW())`,
            [contact.email, contact.phoneNumber, contact.linkedId ?? null, contact.linkPrecedence ?? 'primary']
        );
        return (result as any).insertId;
    }

    /**
     * Updates a contact to be a 'secondary' and links it to a primary contact.
     *
     * @param contactId - The ID of the contact to update
     * @param primaryId - The ID of the primary contact to link to
     */
    async updateLinkToSecondary(contactId: number, primaryId: number): Promise<void> {
        await db.query(
            `UPDATE contacts
           SET linkPrecedence = 'secondary', linkedId = ?, updatedAt = NOW()
           WHERE id = ?`,
            [primaryId, contactId]
        );
    }

}