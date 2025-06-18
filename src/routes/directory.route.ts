import express, { Router } from "express";
import { IdentifyController } from "../controller/identify.Controller";

/**
 * Defines application routes related to directory or identity features.
 */
export default class DirectoryRoute {

    // Router instance for defining API endpoints
    private _router: Router;
    // Controller instance to handle identify-related requests
    private identifyController: IdentifyController = new IdentifyController();
    // Getter to expose the router instance
    public get router(): Router {
        return this._router;
    }
    constructor() {
        this._router = express.Router();
    }


    public async setUpRoutes(): Promise<void> {
        /**
     * Registers all route endpoints handled by this class.
     * Currently supports:
     *  - POST /identify → used to identify or link user contacts
     */
        this._router.post("/identify", this.identifyController.identifyUser);
    }
}