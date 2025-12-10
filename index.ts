import express, { text, type Request, type Response } from 'express' 

const app = express() 
const port = 3000 
 
app.get('/hello-world', (req: Request, res: Response) => { 
  res.send('Hello World!') 
}) 
 
app.listen(port, () => { 
  console.log(`Example app listening on port ${port}`) 
}) 

 let post = [ 
  { id: 1, text: 'I feel like I am a post' }, 
  { id: 2, text: 'Today is a good day' }, 
  { id: 3, text: 'I have a lot of post' }, 
  { id: 4, text: 'My post are the best' }, 
] 
app.get('/post', (req: Request, res: Response) => { 
  res.send(post) 
}) 

app.use(express.json()) 

app.post('/post', (req: Request, res: Response) => { 
  const lastPost = post [post.length - 1]
  const Id = lastPost == undefined ? 1 : lastPost?.id + 1
  const newPost = {id: Id, text: req.body}
  post.push(newPost)
  res.send(newPost) 
}) 

 
app.put('/post/:id', (req: Request, res: Response) => { 
  const id = parseInt(req.params.id ?? "0")
  const updatedPost = req.body 
  const existingPost = post.find((post) => post.id === id) 
  if (!existingPost) { 
    res.status(404).send('Post not found') 
    return 
  } 
  updatedPost.id = id 
  post = post.map((post) => (post.id === id ? updatedPost : post)) 
  res.send(updatedPost) 
}) 

app.delete('/post/:id', (req: Request, res: Response) => { 
  const id = parseInt(req.params.id ?? "0") 
  post = post.filter((post) => post.id !== id) 
  res.send(post) 
}) 

 
 
 
 

