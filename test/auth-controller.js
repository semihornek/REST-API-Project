require("dotenv").config();

const { expect } = require("chai");
const { stub } = require("sinon");
const { default: mongoose } = require("mongoose");

const User = require("../models/user");
const AuthController = require("../controllers/auth");

const TESTING_DB_NAME = process.env.TESTING_DB_NAME;
const DB_USER = process.env.DB_USER;
const TESTING_MONGODB_URI = `mongodb+srv://${DB_USER}@cluster0.gkrbr.mongodb.net/${TESTING_DB_NAME}`;

describe("Auth Controller", () => {
  let user;
  // It runs once before all test cases started
  before(async () => {
    await mongoose.connect(TESTING_MONGODB_URI);

    // Clear the User table for a fresh start
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

  it("should throw an error with code 500 if accessing the database fails", async () => {
    stub(User, "findOne");
    User.findOne.throws();

    const req = {
      body: {
        email: "kazimabi@baskanlar.com",
        password: "baskanlar",
      },
    };
    const result = await AuthController.login(req, {}, () => {});
    expect(result).to.be.an("error");
    expect(result).to.have.property("statusCode", 500);

    User.findOne.restore();
  });

  it("should send a response with a valid user status for an existing user", async () => {
    const req = { userId: user._id };
    const res = {
      statusCode: 500,
      userStatus: null,
      // to reach this keyword function should be declared with function keyword
      status: function (statusCode) {
        this.statusCode = statusCode;
        return this;
      },
      json: function (data) {
        this.userStatus = data.status;
      },
    };
    await AuthController.getUserStatus(req, res, () => {});
    expect(res.statusCode).to.be.equal(200);
    expect(res.userStatus).to.be.equal("I am new");
  });

  // It runs once after all test cases finished
  after(async () => {
    await mongoose.disconnect();
  });
});
