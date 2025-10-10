import app from "../app.js";
import request from "supertest";
import CredentialSchema from "../models/credential.model.js";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

vi.mock("../models/credential.model");

describe("Issuance Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /issue", () => {
    describe("given a new username", () => {
      it("should create and return a new credential with 201 status code", async () => {
        (CredentialSchema.findOne as Mock).mockResolvedValue(null);

        const savedCredential = {
          _id: "123",
          username: "test-user",
          password: "test-password-123",
          worker: "worker-test",
          createdAt: new Date().toISOString(),
        };

        (CredentialSchema.create as Mock).mockResolvedValue(savedCredential);

        const response = await request(app)
          .post("/api/services/issuance/issue")
          .send({
            username: "test-user",
          });

        expect(response.status).toBe(201);
        expect(response.body.error).toBe(false);
        expect(response.body.message).toBe("Credential generated");
        expect(response.body.data.credential.id).toBe(savedCredential._id);
        expect(response.body.data.credential.username).toBe("test-user");
        expect(response.body.data.credential.password).toBe(
          savedCredential.password
        );
        expect(response.body.data.credential.issuedBy).toContain(
          savedCredential.worker
        );
        expect(response.body.data.credential.issuedAt).toBe(
          savedCredential.createdAt
        );
      });
    });

    describe("given the username already exists", () => {
      it("should return the existing credential with 200 status code", async () => {
        const savedCredential = {
          _id: "123",
          username: "test-user",
          password: "test-password-123",
          worker: "worker-test",
          createdAt: new Date().toISOString(),
        };

        (CredentialSchema.findOne as Mock).mockResolvedValue(savedCredential);

        const response = await request(app)
          .post("/api/services/issuance/issue")
          .send({
            username: "test-user",
          });

        expect(response.status).toBe(200);
        expect(response.body.error).toBe(false);
        expect(response.body.message).toContain("already exists");
        expect(response.body.data.credential.id).toBe(savedCredential._id);
        expect(response.body.data.credential.username).toBe("test-user");
        expect(response.body.data.credential.password).toBe(
          savedCredential.password
        );
        expect(response.body.data.credential.issuedBy).toContain(
          savedCredential.worker
        );
        expect(response.body.data.credential.issuedAt).toBe(
          savedCredential.createdAt
        );
      });
    });

    describe("given an empty or missing username", () => {
      it("should return an error with 400 status code", async () => {
        const response = await request(app)
          .post("/api/services/issuance/issue")
          .send();

        expect(response.status).toBe(400);
        expect(response.body.error).toBe(true);
        expect(response.body.message).toContain("username");
      });
    });

    describe("given the database fails", () => {
      it("should return an error with 500 status code", async () => {
        (CredentialSchema.findOne as Mock).mockRejectedValue(
          new Error("Mock Database connection failed")
        );

        const response = await request(app)
          .post("/api/services/issuance/issue")
          .send({ username: "test-user" });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe(true);
        expect(response.body.message).toContain("Please try again.");
      });
    });
  });
});
