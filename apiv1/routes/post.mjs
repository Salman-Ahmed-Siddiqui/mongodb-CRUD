import express from 'express';
import { nanoid } from 'nanoid'
import { client } from '../../mongodb.mjs'

const db = client.db("cruddb");
const col = db.collection("posts");

let router = express.Router()

// not recommended at all - server should be stateless
let posts = [{
    id: nanoid(),
    title: "Salman Ahmed",
    text: "My name is Salman and I have done this assignment"
}]

// POST    /api/v1/post
router.post('/posts', async(req, res, next) => {

    if (!req.body.title ||
        !req.body.text
    ) {
        res.status(403);
        res.send(`required parameters missing, 
        example request body:
        {
            title: "abc post title",
            text: "some post text"
        } `);
        return;
    }

    const insertResponse = await col.insertOne({
        id: nanoid(),
        title: req.body.title,
        text: req.body.text,
    });
    console.log("insertResponse: ", insertResponse);
    res.send('post created');
})

// GET  one   POST   /api/v1/post/:postId
router.get('/post/:postId', (req, res, next) => {
    console.log('this is signup!', new Date());

    for (let i = 0; i < posts.length; i++) {
        if (posts[i].id === req.params.postId) {
            res.send(posts[i]);
            return;
        }
    }
    res.send('post not found with id ' + req.params.postId);
})

//GET  all   POSTS   /api/v1/posts/
router.get('/posts', async(req, res, next) => {
    const cursor = col.find({});
    let results = await cursor.toArray().reverse()
    console.log("results: ", results);
    res.send(results);
    res.send(posts);
})

// DELETE  /api/v1/post/:postId
router.delete('/post/:postId', (req, res, next) => {
    console.log('this is signup!', new Date());

    const postId = req.params.postId;

    // Find the post index in the posts array
    const postIndex = posts.findIndex(post => post.id === postId);

    // If the post with the given ID exists, remove it
    if (postIndex !== -1) {
        posts.splice(postIndex, 1);
        res.send('Post deleted');
    } else {
        res.status(404).send('Post not found');
    }
});

// EDIT post

// PUT /api/v1/post/:postId
router.put('/post/:postId', (req, res, next) => {

    const postId = req.params.postId;

    // Find the post index in the posts array
    const postIndex = posts.findIndex(post => post.id === postId);

    // If the post with the given ID exists, update it
    if (postIndex !== -1) {
        // Check if both title and text are provided in the request body
        if (!req.body.title || !req.body.text) {
            res.status(403).send('Title and text are required for updating a post');
            return;
        }

        // Update the post with the new data
        posts[postIndex].title = req.body.title;
        posts[postIndex].text = req.body.text;

        res.send('Post updated');
    } else {
        res.status(404).send('Post not found');
    }
});


export default router