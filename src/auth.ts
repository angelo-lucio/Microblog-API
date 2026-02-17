import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "./database.ts";
import { usersTable } from "./db/schema.ts";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({
            error: "Username and password required",
        });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await db
        .insert(usersTable)
        .values({ username, password: passwordHash })
        .returning();

    res.send({ id: newUser[0]!.id, username: newUser[0]!.username });
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({
            error: "Username and password required",
        });
    }

    const existingUsers = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.username, username));

    if (existingUsers.length === 0) {
        return res.status(401).send({ error: "Invalid username or password." });
    }

    const existingUser = existingUsers[0]!;

    const passwordMatch = await bcrypt.compare(password, existingUser.password);

    if (!passwordMatch) {
        return res.status(401).send({ error: "Invalid username or password." });
    }

    const jwtSecret = process.env.JWT_SECRET || "supersecret123";

    const token = jwt.sign(
        { id: existingUser.id, username: existingUser.username },
        jwtSecret,
        { expiresIn: "1h" },
    );

    res.send(token);
});

export default router;
