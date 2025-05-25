const { test, describe, after, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const assert = require("assert");
const User = require("../models/user");
const { log } = require("console");

const api = supertest(app);

describe("Invalid users credentials", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test("username shorter than 3 characters fails with status 400", async () => {
    const response = await api
      .post(`/api/users/`)
      .send({
        username: "ad",
        name: "test name",
        password: "123456789",
      })
      .expect(400)
      .expect("Content-Type", /application\/json/);

    assert.match(response.body.error, /username.*at least 3 characters/i);
  });

  test("missing password fails with status 400", async () => {
    const response = await api
      .post("/api/users")
      .send({
        username: "vaildusername",
        name: "test name",
      })
      .expect(400)
      .expect("Content-Type", /application\/json/);

    assert.match(response.body.error, /password.*required/i);
  });

  test("password shorter than 3 characters fails with status 400", async () => {
    const response = await api
      .post("/api/users")
      .send({
        username: "vaildusername",
        name: "test name",
        password: "11",
      })
      .expect(400)
      .expect("Content-Type", /application\/json/);

    assert.match(response.body.error, /password.*at least 3 characters/i);
  });

  test("duplicate username fails with status 400", async () => {
    const user = {
      username: "existinguser",
      name: "User One",
      password: "securepassword",
    };

    await api.post("/api/users").send(user)
    const response = await api.post("/api/users")
        .send(user)
        .expect(400)
        .expect('Content-Type', /application\/json/)

        assert.match(response.body.error, /username.*unique/i)
  });
});

after(() => {
  mongoose.connection.close();
});
