import "reflect-metadata";
import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import jwt, { JwtPayload } from "jsonwebtoken";
import { DataSource } from "typeorm";
import bcrypt from "bcryptjs";

import { User } from "./entity/User";
import { Event } from "./entity/Event";
import { authenticateToken, AuthenticatedRequest } from "./middleware/authenticationToken";
import dotenv from "dotenv";
dotenv.config();  // Loads variables from backend/.env

const app = express();

app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Use a consistent plain string secret for signing and verifying JWTs
const SECRET = process.env.JWT_SECRET || "fallback_secret";

// Data source initialization
const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [User, Event],
});


AppDataSource.initialize()
  .then(() => {
    console.log("Data Source initialized");

    const userRepo = AppDataSource.getRepository(User);
    const eventRepo = AppDataSource.getRepository(Event);

    // Hardcoded admin (for testing)
   const hardcodedUser = {
  username: process.env.ADMIN_USERNAME || "events.gymkhana",
  passwordHash: process.env.ADMIN_PASSWORD_HASH || "$2b$10$OiYMi5raT00B/IRNncF0ye.Fv00c2qtyjYGnEp8WbtPUVwtzNXqQ.",
};
    // Auth login endpoint
    app.post("/api/auth/login", async (req, res) => {
      const { username, password } = req.body;
      try {
        if (username !== hardcodedUser.username) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        const match = await bcrypt.compare(password, hardcodedUser.passwordHash);
        if (!match) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ username }, SECRET, {
          algorithm: "HS256",
          expiresIn: "1d",
        });
        res.json({ token });
      } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // Event creation endpoint with authentication
    app.post("/api/events", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
      try {
        if (!req.user || typeof req.user === "string" || !("username" in req.user)) {
          return res.status(401).json({ message: "Unauthorized: username missing" });
        }
        const username = (req.user as JwtPayload & { username: string }).username;

        const { hostingAuthority, venue, startTime, endTime, description, registrationForm } = req.body;

        // Validate dates
        const start = new Date(startTime);
        const end = new Date(endTime);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }

        // Find or create user
        let user = await userRepo.findOneBy({ username });
        if (!user) {
          user = userRepo.create({ username });
          await userRepo.save(user);
        }

        // Create event
        const event = eventRepo.create({
          hostingAuthority,
          venue,
          startTime,
          endTime,
          description,
          registrationForm,
          host: user,
        });

        await eventRepo.save(event);
        res.status(201).json(event);
      } catch (error) {
        console.error("Event creation error:", error);
        res.status(500).json({ message: "Failed to create event", error: error instanceof Error ? error.message : error });
      }
    });

    // Get all events
    app.get("/api/events", async (req: Request, res: Response) => {
      try {
        const events = await eventRepo.find({ relations: ["host"] });
        res.json(events);
      } catch (error) {
        console.error("Fetching events error: ", error);
        res.status(500).json({ message: "Failed to fetch events" });
      }
    });

    // Delete event endpoint with authentication and permission check
    app.delete("/api/events/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
      const eventId = parseInt(req.params.id, 10);
      try {
        const event = await eventRepo.findOne({
          where: { id: eventId },
          relations: ["host"],
        });
        if (!event) {
          return res.status(404).json({ message: "Event not found" });
        }

        if (!req.user || typeof req.user === "string" || !("username" in req.user)) {
          return res.status(401).json({ message: "Unauthorized: username missing" });
        }

        const username = (req.user as JwtPayload & { username: string }).username;
        if (event.host.username !== username && username !== "events.gymkhana") {
          return res.status(403).json({ message: "Forbidden" });
        }

        await eventRepo.delete(eventId);
        res.status(200).json({ message: "Event deleted successfully." });
      } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ message: "Internal server error." });
      }
    });

    app.listen(8080, () => {
      console.log("Backend running at http://localhost:8080");
    });
  })
  .catch((error) => {
    console.error("Data Source initialization error:", error);
  });
