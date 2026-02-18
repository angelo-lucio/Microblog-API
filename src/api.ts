import { type Express, type Request, type Response } from "express";
import { db } from "./database";
import { postsTable, usersTable } from "./db/schema";
import { eq } from "drizzle-orm";
import authRoutes from "./auth";
import authMiddleware from "./auth-middleware";

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

        const newPost = await db
            .insert(postsTable)
            .values({
                content: req.body.content,
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
