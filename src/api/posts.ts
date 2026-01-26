import { type Express, type Request, type Response } from "express";
import { postsTable } from "../db/schema";
import { db } from "../database";
import { and, eq } from "drizzle-orm";

export const initializePostsAPI = (app: Express) => {
    app.get("/hello-world", (req: Request, res: Response) => {
        res.send("Hello World!");
    });

    app.get("/posts", async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).send({ error: "Unauthorized" });
            return;
        }
        const posts = await db.select().from(postsTable).where(eq(postsTable.userId, userId));
        res.send(posts);
    });

    app.post("/posts", async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).send({ error: "Unauthorized" });
            return;
        }
        const { content } = req.body;
        if (!content) {
            res.status(400).send({ error: "Content is required" });
            return;
        }
        const newPost = await db.insert(postsTable).values({ content, userId}).returning();
        res.send(newPost[0]);
    });

    app.put("/posts/:id", async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).send({ error: "Unauthorized" });
            return;
        }
        const uId = req.user?.id;
        if (!uId) {
            res.status(401).send({ error: "Unauthorized" });
            return;
        }
        const id = Number(req.params.id);
        if (id != req.body.id) {
            res.status(400).send({ error: "Invalid post id" });
            return;
        }
        const updatedPost = await db.update(postsTable).set({ content: req.body.content }).where(and(eq(postsTable.id, id), eq(postsTable.userId, uId)))
            .returning();
        if (!updatedPost.length) {
            res.status(404).send({ error: "Post not found or unauthorized" });
            return;
        }
        res.send(updatedPost[0]);
    });

    app.delete("/posts/:id", async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).send({ error: "Unauthorized" });
            return;
        }
        const uId = req.user?.id;
        if (!uId) {
            res.status(401).send({ error: "Unauthorized" });
            return;
        }
        const id = Number(req.params.id);
        if (!id) {
            res.status(400).send({ error: "Invalid post id" });
            return;
        }
        const deletedPost = await db.select().from(postsTable).where(and(eq(postsTable.id, id), eq(postsTable.userId, uId))).limit(1);
        if (!deletedPost.length) {
            res.status(404).send({ error: "Post not found or unauthorized" });
            return;
        }   
        await db.delete(postsTable).where(and(eq(postsTable.id, id), eq(postsTable.userId, uId)));
        res.send({ Feedback: "Post deleted successfully", deletedPost: deletedPost[0] });
    });
};