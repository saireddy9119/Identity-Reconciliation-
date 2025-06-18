import dotenv from 'dotenv';
dotenv.config(); // Load env variables before anything else

import express, { Application } from "express";
import http from "http";
import DirectoryRoute from "./routes/directory.route";

class Server {
    private app: Application;

    constructor() {
        this.app = express();
        this.app.use(express.json()); // Parse JSON
        this.setupRoutes();           // <- route setup
    }

    private async setupRoutes(): Promise<void> {
        const directoryRoute = new DirectoryRoute();
        await directoryRoute.setUpRoutes(); // set up /identify route
        this.app.use("/api", directoryRoute.router); // mount at /api
    }

    public start(): void {
        if (!this.app) {
            process.exit(1);
        }
        http.createServer(this.app).listen(process.env.PORT, () => {
            console.log(`🚀 Server is running at http://localhost:${process.env.PORT}`);
        });
    }
}

const server = new Server();
server.start();
