const { test, describe, after, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const assert = require("assert");
const Blog = require("../models/blog");
const helper = require("./test_helper");
const { log } = require("console");

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(helper.dummyBlogs);
});

test("Blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("Unique identifier property of blog posts is named id", async () => {
  const blogs = (await api.get("/api/blogs")).body;
  blogs.forEach((blog) => {
    assert.strictEqual(undefined, blog._id, "Blog should not have _id");
    assert.ok(blog.id, "Blog should have id");
  });
});

test("A blog has been creacted successfully.", async () => {
  const blog = {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  };
  await api.post('/api/blogs')
    .send(blog)
    .expect(201)
    .expect("Content-Type", /application\/json/)

  const blogsLength = (await api.get('/api/blogs')).body.length
  
  assert.strictEqual(blogsLength, helper.dummyBlogs.length+1)
});

test("Verifiy if the like property .", async () => {
  const blog = {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/"
  };
  const response = await api
    .post('/api/blogs')
    .send(blog)
    .expect(201)
    .expect("Content-Type", /application\/json/)
  
  assert.strictEqual(response.body.likes, 0)
});

test('Post without a title or url fails with status code 400', async () => {
    const blogs = [
        {//without a title
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
        },
      {//without an url
        title: "React patterns",
        author: "Michael Chan",
        likes: 7,
      },
    ];
    for(const blog of blogs){
        await api.post('/api/blogs').send(blog)
        .expect(400)
        .expect('Content-Type', /application\/json/)
    }

    const blogsAfterPost = await helper.blogsInDB()
    assert.strictEqual(blogsAfterPost.length, helper.dummyBlogs.length)
})

describe("deletion of a post", () =>{
    test.only('succeeds with status code 204 if id is valid', async () => {
        const blogToDeleted = await helper.firstPostInBlog()
        
        await api.delete(`/api/blogs/${blogToDeleted.id}`)
            .expect(204)

        const blogsAfterDeletion = await helper.blogsInDB()
        
        const ids = blogsAfterDeletion.map(blog => blog.id)
        assert(!ids.includes(blogToDeleted.id))

        assert.strictEqual(blogsAfterDeletion.length, helper.dummyBlogs.length - 1)
    })
})

describe.only("updating posts", () => {
    test("updating post's likes", async() => {
        const postBeforeUpdate = await helper.firstPostInBlog()
        const updatedLikes = 500
        const response = await api
            .put(`/api/blogs/${postBeforeUpdate.id}`)
            .send({likes: updatedLikes})    
            .expect(200)
            .expect("Content-Type", /application\/json/)
        
        const updatedPost = response.body

        assert.strictEqual(updatedPost.likes, updatedLikes);// make sure that likes is updated
        // test if the rest properties are still the same
        assert.strictEqual(updatedPost.title, postBeforeUpdate.title);
        assert.strictEqual(updatedPost.author, postBeforeUpdate.author);
        assert.strictEqual(updatedPost.url, postBeforeUpdate.url);
        assert.strictEqual(updatedPost.id, postBeforeUpdate.id);
        
    })
})

after(() => {
  mongoose.connection.close();
});
