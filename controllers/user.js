const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", async (req, res) => {
  const users = await User.find({}).populate("blogs", {
    url: 1,
    title: 1,
    author: 1,
    likes: 1
  });
  res.json(users);
});

usersRouter.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate("blogs", {url: 1, title: 1, author: 1, likes: 1})
  if (user) {
    res.json(user);
  } else {
    res.status(404).end();
  }
});
// I still have to do the tests for task 4.16
usersRouter.post("/", async (req, res) => {
  const { username, name, password } = req.body;
  
  if(!password) {
    return res
      .status(400)
      .json({ error: "Password is required."})
  }


  // Ensure the password length is at least 3
  if (password && password.length < 3) {
    return res
      .status(400)
      .json({ error: "Password must be at least 3 characters." });
  }
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  res.status(201).json(savedUser);
});

module.exports = usersRouter;
