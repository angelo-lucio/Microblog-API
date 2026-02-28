import { type Express, type Request, type Response } from "express";
import { postsTable } from "../db/schema";
import { db } from "../db/database.ts";
import { and, eq } from "drizzle-orm";
import { sentimentQueue } from "../message-broker/index.ts";
import authMiddleware from "../middleware/auth-middleware.ts";

export const initializeAPI = (app: Express) => {
  app.get("/hello-world", (req: Request, res: Response) => {
    res.send("Hello World!");
  });

  // apply auth middleware to all /posts routes
  app.use("/posts", authMiddleware);

  // GET all posts
  app.get("/posts", async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).send({ error: "Unauthorized" });
    }
    // fetch all posts from database
    const allPosts = await db.select().from(postsTable);

    const validPosts = allPosts.filter((post) => {
      // if post is negative or dangerous, only show it to the user who created it
      if (post.sentiment === "negative" || post.sentiment === "dangerous")
        return post.userId === userId;
      return true;
    });
    res.send(validPosts);
  });

  // POST create new post
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
    const [newPost] = await db
      .insert(postsTable)
      .values({ content, userId })
      .returning();

    if (!newPost) {
      res.status(500).send({ error: "Failed to create post" });
      return;
    }

    // send post to message broker for sentiment analysis
    await sentimentQueue.add("analyze-sentiment", { postId: newPost.id });
    console.log(
      `Post ${newPost.id} created and sent to message broker for sentiment analysis`,
    );

    res.status(201).send(newPost);
  });

  // GET single post by id
  app.get("/posts/:id", async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).send({ error: "Unauthorized" });
      return;
    }
    const id = Number(req.params.id);
    if (!id) {
      res.status(400).send({ error: "Invalid post id" });
      return;
    }
    const post = await db.select().from(postsTable).where(eq(postsTable.id, id)).limit(1);
    if (!post.length) {
      res.status(404).send({ error: "Post not found" });
      return;
    }
    const foundPost = post[0];
    if (!foundPost) {
      res.status(404).send({ error: "Post not found" });
      return;
        }
    res.send(foundPost);
  } );

  // PUT update post
  app.put("/posts/:id", async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).send({ error: "Unauthorized" });
      return;
    }

    const postId = Number(req.params.id);
    if (!postId) {
      res.status(400).send({ error: "Invalid post id" });
      return;
    }

    const { content } = req.body;
    if (!content) {
      res.status(400).send({ error: "Content is required" });
      return;
    }
    
    const updatedPost = await db
      .update(postsTable)
      .set({ 
        content: content,

        // resetting the sentiment triggering
        sentiment: "pending",
        correction: "",
      })
      .where(and(eq(postsTable.id, postId), eq(postsTable.userId, userId)))
      .returning(); // returning the updated post

    if (!updatedPost.length) {
      res.status(404).send({ error: "Post not found or unauthorized" });
      return;
    };

    // resending post to message broker for sentiment analysis in case content changed
    await sentimentQueue.add("analyze-sentiment", { content, postId });
    console.log(
      `Post ${ content } updated and sent to message broker for sentiment analysis`,
    );
    
    const validPosts = updatedPost.filter((post) => {

      // if post is negative or dangerous, only show it to the user who created it
      if (post.sentiment === "negative" || post.sentiment === "dangerous")
        return post.userId === userId;
      return true;
    });
  
    res.status(201).send({ ...updatedPost[0], validPosts });
  });

  // DELETE post
  app.delete("/posts/:id", async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).send({ error: "Unauthorized" });
      return;
    }
    const postId = Number(req.params.id);
    if (!postId) {
      res.status(400).send({ error: "Invalid post id" });
      return;
    }
    const deletedPost = await db
      .select()
      .from(postsTable)
      .where(and(eq(postsTable.id, postId), eq(postsTable.userId, userId)))
      .limit(1);
    if (!deletedPost.length) {
      res.status(404).send({ error: "Post not found or unauthorized" });
      return;
    }
    await db
      .delete(postsTable)
      .where(and(eq(postsTable.id, postId), eq(postsTable.userId, userId)));
    res.send({
      message: "Post deleted successfully",
      deletedPost: deletedPost[0],
    });
  });
};

