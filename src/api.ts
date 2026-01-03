import express, { type Express, type Request, type Response } from "express";

export const initializeAPI = (app: Express) => {
    let posts = [
        { id: 1, content: "I feel like I am a post" },
        { id: 2, content: "Today is a good day" },
        { id: 3, content: "I have a lot of posts" },
        { id: 4, content: "My posts are the best" },
    ];

    app.get("/hello-world", (req: Request, res: Response) => {
        res.send("Hello World!");
    });

    app.get('/posts', (req: Request, res: Response) => {
        res.send(posts)
    })

    app.post("/posts", (req: Request, res: Response) => {
        const newPost = {
            id: posts.length + 1,
            content: req.body.content
        }
        
        // const newPost = req.body;
        // why changed? typescript safty error. this code wotkd but typescript is warning
        // newPost.id = posts[posts.length - 1].id + 1;

        posts.push(newPost);
        res.send(newPost);
    });

    app.put("/posts/:id", (req: Request, res: Response) => {
        const id = Number(req.params.id);
        // if the param is not a numnber it will throw an error but number will handle it as NaN
        // we can discuss how strict do we want
        //const id = parseInt(req.params.id);
        const updatedPost = req.body;
        const existingPost = posts.find((post) => post.id === id);
        if (!existingPost) {
            res.status(404).send("Post not found");
            return;
        }
        updatedPost.id = id;
        posts = posts.map((post) => (post.id === id ? updatedPost : post));
        res.send(updatedPost);
    });

    app.delete("/posts/:id", (req: Request, res: Response) => {
        const id = Number(req.params.id);
        // if the param is not a numnber it will throw an error but number will handle it as NaN
        // we can discuss how strict do we want
        //const id = parseInt(req.params.id);
        posts = posts.filter((post) => post.id !== id);
        res.send(posts);
    });
};
