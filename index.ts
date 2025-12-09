import express, { type Request, type Response } from 'express' 

const app = express() 
const port = 3000 
 
app.get('/hello-world', (req: Request, res: Response) => { 
  res.send('Hello World!') 
}) 
 
app.listen(port, () => { 
  console.log(`Example app listening on port ${port}`) 
}) 

 let posts = [ 
  { id: 1, content: 'I feel like I am a post' }, 
  { id: 2, content: 'Today is a good day' }, 
  { id: 3, content: 'I have a lot of posts' }, 
  { id: 4, content: 'My posts are the best' }, 
] 
app.get('/posts', (req: Request, res: Response) => { 
  res.send(posts) 
}) 

app.use(express.json()) 

app.post('/posts', (req: Request, res: Response) => { 
  const newPost = req.body 
  newPost.id = posts[posts.length - 1].id + 1 
  posts.push(newPost) 
  res.send(newPost) 
}) 
 
app.put('/posts/:id', (req: Request, res: Response) => { 
  const id = parseInt(req.params.id)
  const updatedPost = req.body 
  const existingPost = posts.find((post) => post.id === id) 
  if (!existingPost) { 
    res.status(404).send('Post not found') 
    return 
  } 
  updatedPost.id = id 
  posts = posts.map((post) => (post.id === id ? updatedPost : post)) 
  res.send(updatedPost) 
}) 

app.delete('/posts/:id', (req: Request, res: Response) => { 
  const id = parseInt(req.params.id) 
  posts = posts.filter((post) => post.id !== id) 
  res.send(posts) 
}) 

 
 
 
 

