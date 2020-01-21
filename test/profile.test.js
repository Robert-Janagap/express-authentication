const chai = require("chai");
const request = require("supertest");
const http = require("chai-http");
const server = require("../server");
const Profile = require("../models/Profile");

chai.use(http);
const expect = chai.expect;

/**
 * TODO
 * User add profile
 * User get profile
 * User update profile
 * */

const root = "/api/v1/profile";
const users = require("./users.test");

describe("Initiating profile testing...", () => {
  const url = `${root}`;
  describe("User add profile", () => {
    it("Should create profile", done => {
      const body = {
        name: {
          firstName: "Juan",
          middleName: "Cordova",
          lastName: "Dela Cruz"
        },
        birthDate: Date.now()
      };
      request(server)
        .post(url)
        .set("Authorization", users.token)
        .set("Accept", "application/json")
        .send(body)
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body.message).to.be.equal("Successfully create profile");
          expect(res.body.success).to.be.equal(true);
          expect(res.body.errors).to.be.empty;
          done();
        })
        .catch(error => console.log(error));
    });

    it("Should get unauthorized response", done => {
      body = {};

      request(server)
        .post(url)
        .set("Accept", "application/json")
        .send(body)
        .then(res => {
          expect(res).to.have.status(401);
          expect(res.body.message).to.be.equal("No token, Unauthorized user");
          expect(res.body.success).to.be.equal(false);
          expect(res.body.errors).to.not.equal(0);
          done();
        })
        .catch(error => console.log(error));
    });

    it("Should fail creating profile, Bad request", done => {
      body = {};

      request(server)
        .post(url)
        .set("Authorization", users.token)
        .set("Accept", "application/json")
        .send(body)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.equal("Fail creating profile");
          expect(res.body.success).to.be.equal(false);
          expect(res.body.errors).to.not.equal(0);
          done();
        })
        .catch(error => console.log(error));
    });
  });

  describe("User update profile", () => {
    it("Should update profile", done => {
      const body = {
        name: {
          firstName: "Juan II",
          middleName: "Cordova",
          lastName: "Dela Cruz"
        },
        birthDate: Date.now()
      };

      request(server)
        .post(url)
        .set("Authorization", users.token)
        .set("Accept", "application/json")
        .send(body)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body.message).to.be.equal("Successfully update profile");
          expect(res.body.success).to.be.equal(true);
          expect(res.body.errors).to.be.equal(0);
          done();
        })
        .catch(error => console.log(error));
    });
  });

  describe("User get profile", () => {
    it("Should get profile", done => {
      request(server)
        .get(`${url}/to/test`)
        .set("Accept", "application/json")
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body.message).to.be.equal("Successfull get profile");
          expect(res.body.success).to.be.equal(true);
          expect(res.body.errors).to.be.equal(0);
          done();
        })
        .catch(error => console.log(error));
    });

    it("Should not found profile", done => {
      request(server)
        .get(`${url}/to/wrong`)
        .set("Accept", "application/json")
        .then(res => {
          expect(res).to.have.status(404);
          expect(res.body.message).to.be.equal("Profile not found");
          expect(res.body.success).to.be.equal(false);
          expect(res.body.errors).to.not.equal(0);
          done();
        })
        .catch(error => console.log(error));
    });
  });
});
