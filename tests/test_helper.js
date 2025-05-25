const blog = require("../models/blog");
const User = require("../models/user");
const app = require("../app")
const supertest = require("supertest")
const api = supertest(app)


const dummyBlogs = [
  {
    title: "Learning Node.js",
    author: "Jane Doe",
    url: "https://example.com/learning-nodejs",
    likes: 100,
  },
  {
    title: "Mastering JavaScript",
    author: "John Smith",
    url: "https://example.com/mastering-javascript",
    likes: 200,
  },
  {
    title: "Intro to Express.js",
    author: "Alice Johnson",
    url: "https://example.com/intro-to-express",
    likes: 50,
  },
];

const blogsInDB = async () => {
  const blogs = await blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const firstPostInBlog = async () => (await blogsInDB())[0];

const createUserAndLogin = async () => {
  const username = "testuser"
  const name = "test user"
  const password = "password123"

  await api.post("/api/users").send({username, name, password})
  const login = await api.post("/api/login").send({username, password})
  
  const user = await User.findOne({username})
  
  return {
    token: login.body.token,
    userId: user._id.toString()
  }
}

module.exports = { dummyBlogs, blogsInDB, firstPostInBlog, createUserAndLogin };
