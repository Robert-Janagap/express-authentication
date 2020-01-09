const chai = require("chai");
const request = require("supertest");
const http = require("chai-http");
const server = require("../server");
const config = require("config");
chai.use(http);
const expect = chai.expect;

// models
const User = require("../models/User");

// global variable
const root = "/api/v1/users";
let userToken = null;

/**
 * Todo
 * User sign up
 * User sign in
 * User update password
 * User add profile
 * User update profile
 * */

describe("Initiating testing...", () => {
  before(done => {
    User.find()
      .deleteMany()
      .then(res => {
        console.log("cleaning database...");
        done();
      })
      .catch(error => console.log(error.message));
  });

  describe("User Sign Up", () => {
    const url = `${root}/sign-up`;
    it("Should successfully sign up", done => {
      const body = {
        username: "test",
        email: "test@test.com",
        password: "password"
      };

      request(server)
        .post(url)
        .set("Accept", "application/json")
        .send(body)
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body.message).to.be.equal("Successfully sign up.");
          expect(res.body.success).to.be.equal(true);
          expect(res.body.user).to.be.an("object");
          // expect no errors
          expect(res.body.errors).to.be.empty;

          // expect new user saved in database
          expect(res.body.user._id).to.exist;
          expect(res.body.user.createdAt).to.exist;

          // expect password has been hashed
          expect(res.body.user.password).not.to.be.eql(body.password);

          // expect token
          expect(res.body.token).to.exist;
          done();
        })
        .catch(error => console.log(`Error: ${error}`));
    });

    it("Should fail sign up, Bad request", done => {
      const body = {};

      request(server)
        .post(url)
        .set("Accept", "application/json")
        .send(body)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.equal("Failed sign up.");
          expect(res.body.success).to.be.equal(false);
          expect(res.body.errors).to.not.equal(0);

          done();
        })
        .catch(error => console.log(`Error: ${error}`));
    });

    it("Should fail sign up, Conflict resource", done => {
      const body = {
        username: "test",
        email: "test@test.com",
        password: "password"
      };
      request(server)
        .post(url)
        .set("Accept", "application/json")
        .send(body)
        .then(res => {
          expect(res).to.have.status(409);
          expect(res.body.success).to.be.equal(false);
          expect(res.body.errors).to.not.equal(0);
          done();
        })
        .catch(error => console.log(`Error: ${error}`));
    });
  });

  describe("User Sign In", () => {
    const url = `${root}/sign-in`;

    it("Should sign in completed", done => {
      const body = {
        email: "test@test.com",
        password: "password"
      };

      request(server)
        .post(url)
        .set("Accept", "application/json")
        .send(body)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body.message).to.be.equal("Successfully sign in.");
          expect(res.body.success).to.be.equal(true);
          expect(res.body.user).to.be.an("object");
          // expect token exist
          expect(res.body.token).to.exist;
          // expect no errors
          expect(res.body.errors).to.be.empty;
          // save token
          userToken = res.body.token;
          done();
        })
        .catch(error => console.log(error.message));
    });

    it("Should sign in fail, Bad request", done => {
      const body = {};

      request(server)
        .post(url)
        .set("Accept", "application/json")
        .send(body)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.equal("Failed sign in");
          expect(res.body.success).to.be.equal(false);
          expect(res.body.errors).to.not.equal(0);
          done();
        })
        .catch(error => console.log(error));
    });

    it("Should sign in fail, Invalid credentials", done => {
      const body = {
        email: "wrongEmail@test.com",
        password: "wrongPassword"
      };

      request(server)
        .post(url)
        .set("Accept", "application/json")
        .send(body)
        .then(res => {
          expect(res).to.have.status(401);
          expect(res.body.errors).to.not.equal(0);
          expect(res.body.success).to.be.equal(false);
          done();
        })
        .catch(error => console.log(error));
    });
  });

  describe("User update password", () => {
    it("Should return 200", done => {
      const body = {
        username: "test",
        newPassword: "password"
      };
      request(server)
        .post(`${root}/change-password`)
        .set("Accept", "application/json")
        .set("Authorization", userToken)
        .send(body)
        .then(res => {
          expect(res.body).to.have.status(200);
          expect(res.body.message).to.be.equal("Successfully changed password");
          expect(res.body.user).to.be.an("object");
          // expect no errors
          expect(res.body.errors).to.be.empty;
          // expect password has been hashed
          expect(res.body.user.password).not.to.be.eql(body.newPassword);
        })
        .catch(error => console.log(error.message));
    });
  });

  describe("User add profile", () => {
    it("Should return 200", done => {
      const body = {
        username: "test",
        newPassword: "password"
      };
      request(server)
        .post(`${root}/change-password`)
        .set("Accept", "application/json")
        .set("Authorization", userToken)
        .send(body)
        .then(res => {
          expect(res.body).to.have.status(200);
          expect(res.body.message).to.be.equal("Successfully add profile");
          expect(res.body.user).to.be.an("object");
          // expect no errors
          expect(res.body.errors).to.be.empty;
        })
        .catch(error => console.log(error.message));
    });
  });

  after(_ => {
    console.log("All test completed, stoping server...");
    process.exit();
  });
});
