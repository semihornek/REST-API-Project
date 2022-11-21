const { expect } = require("chai");
const jwt = require("jsonwebtoken");
const { stub } = require("sinon");

const authMiddleware = require("../middleware/is-auth");

describe("Auth middleware", () => {
  it("should throw an error if no authorization header exists", () => {
    const req = {
      get: (headerName) => null,
    };

    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw("Not authenticated");
  });

  it("should throw an error if the authorization header is only one string", () => {
    const req = {
      get: (headerName) => "xyz",
    };

    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it("should yield an id after decoding the token", () => {
    const req = {
      get: (headerName) => "Bearer xyz",
    };

    stub(jwt, "verify");
    jwt.verify.returns({ userId: "abc" });
    authMiddleware(req, {}, () => {});

    expect(req).to.have.property("userId");
    expect(req).to.have.property("userId", "abc");
    expect(jwt.verify.called).to.be.true;

    jwt.verify.restore();
  });

  it("should throw an error if the token cannot be verified", () => {
    const req = {
      get: (headerName) => "Bearer xyz",
    };

    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });
});
