

import { Request, Response } from 'express';
import { IdentifyBO } from '../bo/identify.bo';
import { IdentifyRequestBody } from '../models/Contacts.model'
/**
 * Controller responsible for handling user identification requests.
 */

export class IdentifyController {
    // Singleton instance to avoid redundant instantiations
    public static instance: IdentifyController = new IdentifyController();
    /**
     * Handles POST /identify requests.
     * Identifies the user by linking their email and/or phone number to a unified contact.
     *
     * @param req - Express request object with body containing email and/or phoneNumber
     * @param res - Express response object
     */

    async identifyUser(req: Request<{}, {}, IdentifyRequestBody>, res: Response): Promise<void> {
        try {
            const { email, phoneNumber } = req.body;
            // Validate input: either email or phone number must be provided
            if (!email && !phoneNumber) {
                res.status(400).json({ success: false, message: "Missing email and phoneNumber" });
            }
            // Call business logic to find or link contact
            const contact = await IdentifyBO.instance.findContact(email, phoneNumber);
            res.status(200).json({ success: true, message: contact });
        } catch (err) {
            // Catch and handle any unexpected errors
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            res.status(500).json({ success: false, message: errorMessage });
        }
    }

    async helloMessage(req: Request, res: Response): Promise<void> {
        console.log("Hello World")
        res.status(200).json({ success: true, message: "Hello from Identify Controller!" });
    }
}