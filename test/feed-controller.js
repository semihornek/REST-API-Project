require("dotenv").config();

const { expect } = require("chai");
const { stub } = require("sinon");
const { default: mongoose } = require("mongoose");
const io = require("../socket");

const User = require("../models/user");
const Post = require("../models/post");
const FeedController = require("../controllers/feed");

const TESTING_DB_NAME = process.env.TESTING_DB_NAME;
const DB_USER = process.env.DB_USER;
const TESTING_MONGODB_URI = `mongodb+srv://${DB_USER}@cluster0.gkrbr.mongodb.net/${TESTING_DB_NAME}`;

describe("Feed Controller", () => {
  let user;
  // It runs once before all test cases started
  before(async () => {
    await mongoose.connect(TESTING_MONGODB_URI);

    // Clear the Post and User collection for a fresh start
    await Post.deleteMany({});
    await User.deleteMany({});

    // Create a test user
    user = new User({
      email: "semati@baskanlar.com",
      password: "baskanlar",
      name: "Semati",
      posts: [],
      _id: "5c0f66b979af55031b34728a",
    });
    await user.save();
  });

  it("should create a post and add this post to user's posts array", async () => {
    stub(io, "getIO");
    io.getIO.returns({ emit: () => {} });

    const req = {
      body: {
        title: "Usta",
        content: "Başkanlaaarr",
      },
      userId: "5c0f66b979af55031b34728a",
      file: {
        path: "abilerin_abisi",
      },
    };
    const res = {
      status: function () {
        return this;
      },
      json: function () {},
    };

    const updatedUser = await FeedController.createPost(req, res, () => {});
    expect(updatedUser).to.have.property("posts");
    expect(updatedUser.posts).to.have.length(1);

    io.getIO.restore();
  });

  // It runs once after all test cases finished
  after(async () => {
    await mongoose.disconnect();
  });
});
