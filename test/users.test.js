const chai = require("chai");
const request = require("supertest");
const http = require("chai-http");
const server = require("../server");
const config = require("config");
chai.use(http);
const expect = chai.expect;

describe("User Sign Up", () => {
  it("Should return 201", done => {
    const newUser = {
      username: "test",
      email: "test@gmail.com",
      password: "password"
    };

    request(server)
      .post("/api/v1/users/sign-up")
      .send(newUser)
      .set("Accept", "application/json")
      .then(res => {
        expect(res).to.have.status(201);

        done();
      })
      .catch(error => console.log(error.message));
  });
});
