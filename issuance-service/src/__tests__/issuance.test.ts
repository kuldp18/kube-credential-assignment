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
      it("should create a new credential and return 201 status code", async () => {
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
        expect(response.body.data.credential.issuedBy).toBe(
          `credential issued by ${savedCredential.worker}`
        );
      });
    });
  });
});
