

import { Request, Response } from 'express';
import { IdentifyBO } from '../bo/identify.bo';
import { IdentifyRequestBody } from '../models/Contacts.model'


export class IdentifyController {
    public static instance: IdentifyController = new IdentifyController();

    async identifyUser(req: Request<{}, {}, IdentifyRequestBody>, res: Response): Promise<void> {
        try {
            const { email, phoneNumber } = req.body;
            if (!email && !phoneNumber) {
                res.status(400).json({ success: false, message: "Missing email and phoneNumber" });
            }
            const contact = await IdentifyBO.instance.findContact(email, phoneNumber);
            res.status(200).json({ success: true, message: contact });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            res.status(500).json({ success: false, message: errorMessage });
        }
    }
}