const blog = require("../models/blog");

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

module.exports = { dummyBlogs, blogsInDB, firstPostInBlog };
