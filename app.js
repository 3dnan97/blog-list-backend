const config = require("./utils/config");
const express = require("express");
require('express-async-errors')
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const blogsRouter = require("./controllers/blog");
const usersRouter = require("./controllers/user");
const loginRouter = require("./controllers/login");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
logger.info("Connecting to", config.MONGODB_URI);
mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("Connected to MongoDB.");
  })
  .catch((error) => {
    logger.error("error connecting to MongoDB:", error.message);
  });

  morgan.token('body', (req) => {
    return req.body && Object.keys(req.body).length
        ? JSON.stringify(req.body) : ''
  })
app.use(morgan(':method :url :status :res[content-length] - :total-time ms :body'))
app.use(cors());
app.use(express.static("dist"));
app.use(express.json());

app.use(middleware.tokenExtractor);

app.use("/api/blogs", blogsRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
