import app from "../app.js";
import axios from "axios";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import request from "supertest";

vi.mock("axios");

describe("Verification Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /services/verification/verify", () => {
    describe("given that one or both of username and password are missing", () => {
      it("should return an error with status code 400", async () => {
        const response = await request(app)
          .post("/api/services/verification/verify")
          .send();

        expect(response.status).toBe(400);
        expect(response.body.error).toBe(true);
        expect(response.body.message).toContain(
          "provide both username and password"
        );
      });
    });

    describe("given that both username and password are valid", () => {
      it("should return the credential details with status code 200", async () => {
        const mockSuccessResponse = {
          status: 200,
          data: {
            message: "Credential verified!",
            error: false,
            data: {
              credential: {
                id: "123",
                username: "test-user",
                password: "test-password-123",
                worker: "worker-test",
                issuedAt: new Date().toISOString(),
              },
            },
          },
        };

        (axios.post as Mock).mockResolvedValue(mockSuccessResponse);

        const response = await request(app)
          .post("/api/services/verification/verify")
          .send({
            username: "test-user",
            password: "test-password-123",
          });

        expect(response.status).toBe(200);
        expect(response.body.error).toBe(false);
        expect(response.body.message).toContain("verified!");
        expect(response.body.data.credential.username).toBe("test-user");
        expect(response.body.data.credential.password).toBe(
          "test-password-123"
        );

        //assert it is calling the internal endpoint
        expect(axios.post).toHaveBeenCalledWith(
          process.env.ISSUANCE_SERVICE_URL,
          {
            username: "test-user",
            password: "test-password-123",
          }
        );
      });
    });

    describe("given that either username or password or both are invalid", () => {
      it("should forward a 404 status response from issuance-service back to the client", async () => {
        const mockErrorResponse = {
          isAxiosError: true,
          response: {
            status: 404,
            data: {
              message:
                "Invalid username or password. Requested credential not found.",
              error: true,
            },
          },
        };

        vi.mocked(axios.isAxiosError).mockReturnValue(true);
        (axios.post as Mock).mockRejectedValue(mockErrorResponse);

        const response = await request(app)
          .post("/api/services/verification/verify")
          .send({ username: "test-user", password: "test-password-123" });

        expect(response.status).toBe(404);
        expect(response.body.message).toContain("not found");
        expect(response.body.error).toBe(true);
      });
    });

    describe("given that an unknown error occurs", () => {
      it("should return a 500 status response", async () => {
        (axios.post as Mock).mockRejectedValue(
          new Error("Mock Network connection refused")
        );

        const response = await request(app)
          .post("/api/services/verification/verify")
          .send({ username: "test-user", password: "test-password-123" });

        expect(response.status).toBe(500);
        expect(response.body.message).toContain("Something went wrong");
      });
    });
  });
});
