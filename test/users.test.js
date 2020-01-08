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

describe("User routes testing", () => {
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
        email: "test@gmail.com",
        password: "password"
      };

      request(server)
        .post(url)
        .set("Accept", "application/json")
        .send(body)
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body.message).to.be.equal("Successfully sign up.");
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

    it("Should fail sign up", done => {
      const body = {};

      request(server)
        .post(`${url}`)
        .set("Accept", "application/json")
        .send(body)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.equal("Failed sign up.");
          expect(res.body.errors).to.not.equal(0);

          done();
        })
        .catch(error => console.log(`Error: ${error}`));
    });

    it("Should fail sign up, conflict resource", done => {
      const body = {
        username: "test",
        email: "test@gmail.com",
        password: "password"
      };
      request(server)
        .post(`${url}`)
        .set("Accept", "application/json")
        .send(body)
        .then(res => {
          expect(res).to.have.status(409);
          expect(res.body.errors).to.not.equal(0);
          done();
        })
        .catch(error => console.log(`Error: ${error}`));
    });
  });

  describe("User Sign In", () => {
    it("Should return 200", done => {
      const body = {
        username: "test",
        password: "password"
      };

      request(server)
        .post(`${root}/sign-in`)
        .set("Accept", "application/json")
        .send(body)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body.message).to.be.equal("Sign in completed");
          expect(res.body.user).to.be.an("object");
          // expect token exist
          expect(res.body.token).to.exist;
          // expect no errors
          expect(res.body.errors.length).to.be.empty;

          // save token
          userToken = res.body.token;
          done();
        })
        .catch(error => console.log(error.message));
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
