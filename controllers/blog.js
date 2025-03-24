const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.get("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id)  
    .populate("user", {username: 1, name: 1});

  if (blog) {
    response.json(blog);
  } else {
    response.status(404).end();
  }
});

blogsRouter.post("/", async (request, response) => {
  const { title, author, url, likes = 0, user } = request.body;

  if (!title) {
    return response.status(400).json({ error: "Title is required!" });
  }
  if (!url) {
    return response.status(400).json({ error: "URL is required!" });
  }
  const savedUser = await User.findById(user);
  const blog = new Blog({
    title,
    author:savedUser.name,
    url,
    likes,
    user: savedUser.id,
  });
  const savedBlog = await blog.save();
  savedUser.blogs = savedUser.blogs.concat(savedBlog._id);
  await savedUser.save();

  response.status(201).json(savedBlog);
});

blogsRouter.delete("/:id", async (request, response) => {
  const id = request.params.id;
  await Blog.findByIdAndDelete(id);
  response.status(204).end();
});

blogsRouter.put("/:id", async (request, response) => {
  const { likes } = request.body;

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { likes }, // Only updating the likes field
    { new: true, runValidators: true, context: "query" }
  );

  if (!updatedBlog) {
    return response.status(404).json({ error: "Blog not found" });
  }

  response.json(updatedBlog);
});

module.exports = blogsRouter;
