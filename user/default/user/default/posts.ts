/* import { type Express, type Request, type Response } from "express";
import { postsTable } from "../db/schema";
import { db } from "../database";
import { and, eq } from "drizzle-orm";
import { sentimentQueue } from "../message-broker/index.ts";
import { fa } from "@faker-js/faker";

export const initializePostsAPI = (app: Express) => {
    app.get("/hello-world", (req: Request, res: Response) => {
        res.send("Hello World!");
    });

    app.get("/posts", async (req: Request, res: Response) => {
        const userId = req.user?.id;
        //
        if (!userId) {
            res.status(401).send({ error: "Unauthorized" });
        // if user is authenticated, fetch posts from database and filter out negative and dangerous posts that are not created by the user
        } else {
        // fetch all posts from database
        const allPosts = await db.select().from(postsTable);

        const  validPosts = allPosts.filter(post => {
            // if post is negative or dangerous, only show it to the user who created it
            if (post.sentiment === "negative" || post.sentiment === "dangerous") 
                return post.userId === userId;
                return true;
        });
        res.send(validPosts);
    };

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
        //
        const [newPost]  = await db.insert(postsTable).values({ content, userId }).returning();

        if (!newPost) {
            res.status(500).send({ error: "Failed to create post" });
            return;
        }
        
        // send post to message broker for sentiment analysis
        await sentimentQueue.add('analyze-sentiment', { postId: newPost.id })
        console.log(`Post ${newPost.id} created and sent to message broker for sentiment analysis`) 

        res.status(201).send(newPost);
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
})
} */