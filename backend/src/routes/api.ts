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

/* =========================================
   ANALYZE CONTENT (Moderation + Sentiment)
========================================= */
async function analyzeContent(content: string): Promise<{
  isHate: boolean;
  sentiment: string;
}> {
  try {
    const response = await ollamaClient.chat({
      model: "llama3:latest",
      messages: [
        {
          role: "system",
          content: `
You are a strict moderation AI.

Classify the following text.

If it contains:
- violent threat
- hate speech
- racism
- sexual explicit content

Respond ONLY with the single word:

FLAG

Otherwise respond ONLY with:

OK
`
        },
        {
          role: "user",
          content
        }
      ],
      options: {
        temperature: 0,
        num_predict: 5
      }
    });

    const raw = response.message.content.trim().toUpperCase();
    console.log("AI RAW RESPONSE:", raw);

    const isHate = raw.includes("FLAG");

    // Separate simple sentiment classification
    const sentimentResponse = await ollamaClient.chat({
      model: "llama3:latest",
      messages: [
        {
          role: "system",
          content: `
Classify the sentiment of the text.

Respond ONLY with one word:
POSITIVE
NEUTRAL
NEGATIVE
`
        },
        { role: "user", content }
      ],
      options: {
        temperature: 0,
        num_predict: 5
      }
    });

    const sentimentRaw = sentimentResponse.message.content
      .trim()
      .toLowerCase();

    return {
      isHate,
      sentiment: sentimentRaw.includes("positive")
        ? "positive"
        : sentimentRaw.includes("negative")
        ? "negative"
        : "neutral"
    };

  } catch (error) {
    console.error("AI failure:", error);
    return {
      isHate: true,
      sentiment: "negative"
    };
  }
}
/* =========================================
   BACKGROUND MODERATION
========================================= */
async function backgroundModeration(postId: number) {
  try {
    const [post] = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, postId));

    if (!post) return;

    const analysis = await analyzeContent(post.content);

    if (analysis.isHate) {
      await db
        .update(postsTable)
        .set({
          content: "****",
          status: "flagged",
          sentiment: analysis.sentiment
        })
        .where(eq(postsTable.id, postId));

      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, post.userId));

      console.log(
        `🚨 ALERT: Hate speech detected | User: ${user?.username} | PostID: ${postId}`
      );
    } else {
      await db
        .update(postsTable)
        .set({
          status: "clean",
          sentiment: analysis.sentiment
        })
        .where(eq(postsTable.id, postId));
    }
  } catch (error) {
    console.error("Background moderation error:", error);
  }
}

/* =========================================
   API INITIALIZER
========================================= */
export const initializeAPI = (app: Express) => {
  app.use("/auth", authRoutes);
  app.use(authMiddleware);

  // GET POSTS
  app.get("/posts", async (_req: Request, res: Response) => {
    const posts = await db
      .select({
        id: postsTable.id,
        content: postsTable.content,
        userId: postsTable.userId,
        status: postsTable.status,
        sentiment: postsTable.sentiment,
        username: usersTable.username
      })
      .from(postsTable)
      .leftJoin(usersTable, eq(postsTable.userId, usersTable.id));

    res.send(posts);
  });

  // CREATE POST
  app.post("/posts", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    const content = req.body.content;

    if (!content || content.length < 1) {
      return res.status(400).send({ error: "Content required" });
    }

    const [createdPost] = await db
      .insert(postsTable)
      .values({
        content,
        userId: req.user.id,
        status: "pending",
        sentiment: "unknown"
      })
      .returning();

    if (!createdPost) {
      return res.status(500).send({ error: "Post creation failed" });
    }

    res.send(createdPost);

    setTimeout(() => {
      backgroundModeration(createdPost.id);
    }, 100);
  });

  // UPDATE POST
  app.put("/posts/:id", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    const id = Number(req.params.id);

    const [post] = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, id));

    if (!post) {
      return res.status(404).send("Post not found");
    }

    if (post.userId !== req.user.id) {
      return res.status(403).send({ error: "Forbidden" });
    }

    const [updatedPost] = await db
      .update(postsTable)
      .set({
        content: req.body.content,
        status: "pending",
        sentiment: "unknown"
      })
      .where(eq(postsTable.id, id))
      .returning();

    if (!updatedPost) {
      return res.status(500).send({ error: "Update failed" });
    }

    setTimeout(() => {
      backgroundModeration(id);
    }, 100);

    res.send(updatedPost);
  });

  // DELETE POST
  app.delete("/posts/:id", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    const id = Number(req.params.id);

    const [post] = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, id));

    if (!post) {
      return res.status(404).send("Post not found");
    }

    if (post.userId !== req.user.id) {
      return res.status(403).send({ error: "Forbidden" });
    }

    await db.delete(postsTable).where(eq(postsTable.id, id));

    res.send({ id });
  });
};