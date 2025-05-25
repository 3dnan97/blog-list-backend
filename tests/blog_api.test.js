const { test, describe, after, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const assert = require("assert");
const Blog = require("../models/blog");
const helper = require("./test_helper");
const { log } = require("console");
const updatedser = require("../models/user");
const blog = require("../models/blog");

const api = supertest(app);

test("Blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

describe("Tests that need authorizition", () => {
  let token = null;
  beforeEach(async () => {
    await updatedser.deleteMany({});
    await Blog.deleteMany({});

    const loginData = await helper.createUserAndLogin();
    token = loginData.token;
    userId = loginData.userId;

    const blogsWithUser = helper.dummyBlogs.map((blog) => ({
      ...blog,
      user: userId,
    }));

    const insertedBlogs = await Blog.insertMany(blogsWithUser);
  });

  test("Unique identifier property of blog posts is named id", async () => {
    const blogs = (await api.get("/api/blogs")).body;
    blogs.forEach((blog) => {
      assert.strictEqual(undefined, blog._id, "Blog should not have _id");
      assert.ok(blog.id, "Blog should have id");
    });
  });

  test("A blog has been created successfully.", async () => {
    const blog = {
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7,
    };
    await api
      .post("/api/blogs")
      .send(blog)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsLength = (await api.get("/api/blogs")).body.length;

    assert.strictEqual(blogsLength, helper.dummyBlogs.length + 1);
  });

  test("Verifiy if the like property .", async () => {
    const blog = {
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
    };
    const response = await api
      .post("/api/blogs")
      .send(blog)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(response.body.likes, 0);
  });

  test("Post without a title or url fails with status code 400", async () => {
    const blogs = [
      {
        //without a title
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
      },
      {
        //without an url
        title: "React patterns",
        author: "Michael Chan",
        likes: 7,
      },
    ];
    for (const blog of blogs) {
      await api
        .post("/api/blogs")
        .send(blog)
        .set("Authorization", `Bearer ${token}`)
        .expect(400)
        .expect("Content-Type", /application\/json/);
    }

    const blogsAfterPost = await helper.blogsInDB();
    assert.strictEqual(blogsAfterPost.length, helper.dummyBlogs.length);
  });

  describe("deletion of a post", () => {
    test("succeeds with status code 204 if id is valid", async () => {
      const blogToDeleted = await helper.firstPostInBlog();

      await api
        .delete(`/api/blogs/${blogToDeleted.id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204);

      const blogsAfterDeletion = await helper.blogsInDB();

      const ids = blogsAfterDeletion.map((blog) => blog.id);
      assert(!ids.includes(blogToDeleted.id));

      assert.strictEqual(
        blogsAfterDeletion.length,
        helper.dummyBlogs.length - 1
      );
    });
  });

  describe("updating posts", () => {
    test("updating post's likes", async () => {
      const postBeforeUpdate = await helper.firstPostInBlog();
      const updatedLikes = 500;
      const response = await api
        .put(`/api/blogs/${postBeforeUpdate.id}`)
        .send({ likes: updatedLikes })
        .set("Authorization", `Bearer ${token}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      const updatedPost = response.body;

      assert.strictEqual(updatedPost.likes, updatedLikes); // make sure that likes is updated
      // test if the rest properties are still the same
      assert.strictEqual(updatedPost.title, postBeforeUpdate.title);
      assert.strictEqual(updatedPost.author, postBeforeUpdate.author);
      assert.strictEqual(updatedPost.url, postBeforeUpdate.url);
      assert.strictEqual(updatedPost.id, postBeforeUpdate.id);
    });
  });

  test("Adding a blog fails with status code 401 if token is not provided", async () => {
    const blog = {
      title: "Unauthorized Blog",
      author: "Hacker",
      url: "http://unauthorized.blog",
      likes: 0,
    };

    await api
      .post("/api/blogs")
      .send(blog)
      .expect(401)
      .expect("Content-Type", /application\/json/);

    const blogsAfter = await helper.blogsInDB();
    assert.strictEqual(blogsAfter.length, helper.dummyBlogs.length);
  });
});

after(() => {
  mongoose.connection.close();
});
