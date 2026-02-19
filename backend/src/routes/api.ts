import { type Express, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { Ollama } from "ollama";
import { db } from "../db/database";
import { postsTable, usersTable } from "../db/schema";
import authMiddleware from "../middleware/auth-middleware";
import authRoutes from "../auth";

const ollamaClient = new Ollama({
  host: "http://ollama:11434",
});

export const initializeAPI = (app: Express) => {
    app.use(authMiddleware);
    app.use("/auth", authRoutes);
    // GET all posts
    app.get("/posts", async (req: Request, res: Response) => {
        const posts = await db
            .select({
                id: postsTable.id,
                content: postsTable.content,
                userId: postsTable.userId,
                username: usersTable.username,
            })
            .from(postsTable)
            .leftJoin(usersTable, eq(postsTable.userId, usersTable.id));

        res.send(posts);
    });

    // POST new post
    app.post("/posts", async (req: Request, res: Response) => {
        if (!req.user) {
            return res.status(401).send({ error: "Unauthorized" });
        }

        const content = req.body.content;

        //AI hate speech check
        const aiCheck = await ollamaClient.generate({
            model: "llama3.2:1b",
            prompt: `Is the following text hate speech? Answer only YES or NO:\n\n${content}`,
        });

        console.log(aiCheck.response);

        if (aiCheck.response.trim().toUpperCase().includes("YES")) {
            return res.status(400).send({
                error: "Post rejected: Hate speech detected",
            });
        }

        // Save if safe
        const newPost = await db
            .insert(postsTable)
            .values({
                content,
                userId: req.user.id,
            })
            .returning();

        res.send(newPost[0]);
    });

    // PUT update post
    app.put("/posts/:id", async (req: Request, res: Response) => {
        if (!req.user) {
            return res.status(401).send({ error: "Unauthorized" });
        }

        const id = Number(req.params.id);

        const existingPosts = await db
            .select()
            .from(postsTable)
            .where(eq(postsTable.id, id));

        if (existingPosts.length === 0) {
            return res.status(404).send("Post not found");
        }

        const post = existingPosts[0]!;

        if (post.userId !== req.user.id) {
            return res.status(403).send({ error: "Forbidden" });
        }

        const updatedPost = await db
            .update(postsTable)
            .set({ content: req.body.content })
            .where(eq(postsTable.id, id))
            .returning();

        res.send(updatedPost[0]);
    });

    // DELETE post
    app.delete("/posts/:id", async (req: Request, res: Response) => {
        if (!req.user) {
            return res.status(401).send({ error: "Unauthorized" });
        }

        const id = Number(req.params.id);

        const existingPosts = await db
            .select()
            .from(postsTable)
            .where(eq(postsTable.id, id));

        if (existingPosts.length === 0) {
            return res.status(404).send("Post not found");
        }

        const post = existingPosts[0]!;

        if (post.userId !== req.user.id) {
            return res.status(403).send({ error: "Forbidden" });
        }

        await db
            .delete(postsTable)
            .where(eq(postsTable.id, id));

        res.send({ id });
    });
};
