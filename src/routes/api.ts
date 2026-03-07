import { type Express, type Request, type Response } from "express";
import { postsTable } from "../db/schema";
import { db } from "../db/database.ts";
import { and, eq } from "drizzle-orm";
import { sentimentQueue } from "../message-broker/index.ts";
import authMiddleware from "../middleware/auth-middleware.ts";
import { getPosts, invalidatePostsCache } from "../microservices/cache.ts";
import { logger } from "../microservices/logger.ts";


export const initializeAPI = (app: Express) => { 
  app.get("/hello-world", (req: Request, res: Response) => {
    res.send("Hello World!"); // Test route to check if API is working
  });

  // apply auth middleware to all /posts routes
  app.use("/posts", authMiddleware);


  // GET all posts
  app.get("/posts", async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).send({ error: "Unauthorized" }); // if user is not authenticated, return 401
    }
    // fetch all posts from database
    const allPosts = await getPosts(userId); // This will try to get posts from cache first, if not found it will fetch from database and cache it

    const validPosts = allPosts.filter((post) => {
      
      // if post is negative or dangerous, only show it to the user who created it
      if (post.sentiment  === "negative" || post.sentiment === "dangerous")
        return post.userId === userId;
      return true;
    });
    res.send(validPosts);
  });

  // POST create new post
  app.post("/posts", async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).send({ error: "Unauthorized" });  // if user is not authenticated, return 401
      return;
    }
    const { content } = req.body;
    if (!content) {
      res.status(400).send({ error: "Content is required" }); // if content is missing, return 400
      return;
    }
    const [newPost] = await db
      .insert(postsTable)
      .values({ content, userId })
      .returning(); // returning the newly created post

    if (!newPost) {
      res.status(500).send({ error: "Failed to create post" }); // if post creation failed, return 500
      return;
    }
    await invalidatePostsCache(); // Invalidate the posts cache after creating a new post to ensure cache consistency

    // send post to message broker for sentiment analysis
    await sentimentQueue.add("analyze-sentiment", { postId: newPost.id });
    logger.info(
      `Post ${newPost.id} created and sent to message broker for sentiment analysis`, 
    );
    res.status(201).send(newPost);
  });

  // GET single post by id
  app.get("/posts/:id", async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).send({ error: "Unauthorized" }); // if user is not authenticated, return 401
      return;
    }
    const id = Number(req.params.id);
    if (!id) {
      res.status(400).send({ error: "Invalid post id" }); // if post id is invalid, return 400
      return;
    }
    const post = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.id, id))
    .limit(1);
    if (!post.length) {
      res.status(404).send({ error: "Post not found" }); // if post not found in database, return 404
    };
    res.send(post[0]);
  });

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
    await invalidatePostsCache(); // Invalidate the posts cache after updating a post to ensure cache consistency

    // resending post to message broker for sentiment analysis in case content changed
    await sentimentQueue.add("analyze-sentiment", { content, postId });
    logger.info(
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
      .delete(postsTable)
      .where(and(eq(postsTable.id, postId), eq(postsTable.userId, userId)))
      .returning();  

    if (!deletedPost.length) {
      res.status(404).send({ error: "Post not found or unauthorized" });
      return;
    }
    await invalidatePostsCache(); // Invalidate the posts cache after deleting a post to ensure cache consistency

    res.send({ message: "Post deleted successfully", deletedPost: deletedPost [0] })
  })
}
