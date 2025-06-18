import express, { Router } from "express";
import { IdentifyController } from "../controller/identify.Controller";


export default class DirectoryRoute {

    private _router: Router;
    private identifyController: IdentifyController = new IdentifyController();
    public get router(): Router {
        return this._router;
    }
    constructor() {
        this._router = express.Router();
    }


    public async setUpRoutes(): Promise<void> {
        this._router.post("/identify", this.identifyController.identifyUser);
    }
}