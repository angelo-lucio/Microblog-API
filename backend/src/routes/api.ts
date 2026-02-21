import { type Express, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { Ollama } from "ollama";
import { db } from "../db/database";
import { postsTable, usersTable } from "../db/schema";
import authMiddleware from "../middleware/auth-middleware";
import authRoutes from "../auth";
import { sentimentQueue } from "../message-broker/index.ts";

const ollamaClient = new Ollama({
  host: "http://ollama:11434",
});

/*
  STRICT + FAST hate speech checker
*/
async function checkHateSpeech(content: string): Promise<boolean> {
  const lower = content.toLowerCase();

  //Strong keyword filter (instant)
  const bannedWords = [
    "kill",
    "murder",
    "rape",
    "sex",
    "porn",
    "racist",
    "hate",
    "terror",
    "violence",
  ];

  for (const word of bannedWords) {
    if (lower.includes(word)) {
      return true;
    }
  }

  // 🟡 Secondary AI check (optional)
  try {
    const response = await ollamaClient.chat({
      model: "tinyllama",
      messages: [
        {
          role: "system",
          content:
            "You are a strict content moderator. Answer ONLY YES or NO. YES if harmful or inappropriate.",
        },
        { role: "user", content }
      ],
      options: {
        temperature: 0,
        num_predict: 5,
      },
    });

    const answer = response.message.content.trim().toUpperCase();
    return answer.startsWith("YES");
  } catch (error) {
    return false;
  }
}

export const initializeAPI = (app: Express) => {
  app.use("/auth", authRoutes);
  app.use(authMiddleware);

  // Test endpoint to verify server is running
  app.get("/hello-world", (req: Request, res: Response) => {
    res.send("Hello World!");
  });

  // GET all posts
  app.get("/posts", async (req: Request, res: Response) => {
  
  // Check if user is authenticated
     const userId = req.user?.id;
        if (!userId) {
            res.status(401).send({ error: "Unauthorized" });
            return;
    };

    const posts = await db
      .select({
        id: postsTable.id,
        content: postsTable.content,
        userId: postsTable.userId,
        username: usersTable.username,
        // Include sentiment in the response to allow frontend filtering
        sentiment: postsTable.sentiment,
      })
      .from(postsTable)
      .leftJoin(usersTable, eq(postsTable.userId, usersTable.id));

      // Filter out negative and dangerous posts that are not created by the user
      const validPosts = posts.filter(post => {
        if (post.sentiment === "negative" || post.sentiment === "dangerous") 
            return post.userId === req.user?.id;
            return true;
      });
    res.send(validPosts);
  });

  // POST new post
  app.post("/posts", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    const content = req.body.content;

    if (!content || content.length < 1) {
      return res.status(400).send({ error: "Content required" });
    }

    // AI moderation including message broker for async processing 
    const containsHate = await checkHateSpeech(content);
    
    // changed for logging and analysing sentiment of posts
    await sentimentQueue.add('check-sentiment', { content, userId: req.user.id })
    console.log(`Post content sent to message broker for sentiment analysis`);
    if (containsHate) {
      return res.status(400).send({
        error: "Post rejected: Hate or unallowed speech detected",
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

      if (!newPost) {
          res.status(500).send({ error: "Failed to create post" });
          return;
    };


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

    await db.delete(postsTable).where(eq(postsTable.id, id));

    res.send({ id });
  });
};