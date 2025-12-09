import express from 'express'
import {faker} from '@faker-js/faker'

const app = express() 
app.use(express.json()) 
const PORT = 3000

app.get('/hello-world', (req, res) => {
    res.send('HELLO Microbloggers')
})

app.listen(PORT, () => {
    console.log('Webserver is running', PORT)
})


//Definition
interface Post {
id : number
text : string
}

// Random Posts
function createRandomPosts (): Post {
    return {
        id : faker.number.int({min:100, max:9999}), //IDs
        text : faker.lorem.sentences(), // text
    };
}

const posts : Post [] = faker.helpers.multiple(createRandomPosts,{
    count: 20
})

app.get('/posts', (req, res) => {
    res.send (posts);
})

app.get('/getpost', (req, res) => {
    res.send(posts);
})



 

