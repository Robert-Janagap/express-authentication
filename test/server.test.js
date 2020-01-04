const chai = require("chai");
const request = require("supertest");
const http = require("chai-http");
const server = require("../server");
const config = require("config");

const expect = chai.expect;

describe("Server", () => {
  it("Should exist", () => {
    expect(server).to.be.a("function");
  });
  it("Should have running port", async () => {
    expect(server.port).to.equal(config.get("PORT"));
  });
});
