import VerifyPage from "../VerifyPage";
import { describe, vi, beforeEach, it, expect, type Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import userEvent from "@testing-library/user-event";
import apiClient from "../../api/client";
import { AxiosError } from "axios";

vi.mock("../../api/client");

describe("VerifyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the initial form correctly on the page with a disabled button", () => {
    render(<VerifyPage />, { wrapper: BrowserRouter });

    expect(
      screen.getByRole("heading", { name: "Verify credential" })
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verify" })).toBeDisabled();
  });

  it("should enable the 'Verify' button only when both the username and password are provided", async () => {
    const user = userEvent.setup();
    render(<VerifyPage />, { wrapper: BrowserRouter });

    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");

    await user.type(usernameInput, "test-user");
    await user.type(passwordInput, "test-password-123");

    expect(screen.getByRole("button", { name: "Verify" })).toBeEnabled();
  });

  it("should show a success modal with credential details when the username and password combo is valid", async () => {
    const user = userEvent.setup();

    render(<VerifyPage />, { wrapper: BrowserRouter });

    const button = screen.getByRole("button", { name: "Verify" });

    const mockCredential = {
      id: "1234",
      username: "test-user",
      password: "test-password-123",
      issuedAt: new Date().toISOString(),
      worker: "worker-test",
    };

    (apiClient.post as Mock).mockResolvedValue({
      data: {
        message: "Credential verified!",
        error: false,
        data: { credential: mockCredential },
      },
    });

    await user.type(screen.getByPlaceholderText("Username"), "test-user");
    await user.type(
      screen.getByPlaceholderText("Password"),
      "test-password-123"
    );

    await user.click(button);
    expect(button).toBeDisabled();

    //  modal
    expect(await screen.findByText("Credential verified!")).toBeInTheDocument();
    expect(await screen.findByText("test-user")).toBeInTheDocument();
    expect(await screen.findByText("test-password-123")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Go to generation page" })
    ).toBeInTheDocument();
  });

  it("should show an error modal when the username and password combo is invalid", async () => {
    const user = userEvent.setup();
    render(<VerifyPage />, { wrapper: BrowserRouter });

    const button = screen.getByRole("button", { name: "Verify" });

    const mockError = new AxiosError(
      "Request failed with status code 404",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        data: {
          message:
            "Invalid username or password. Requested credential not found.",
          error: true,
        },
        status: 404,
        statusText: "Not Found",
        headers: {},
        config: {} as never,
      }
    );

    (apiClient.post as Mock).mockRejectedValue(mockError);

    await user.type(screen.getByPlaceholderText("Username"), "test-user");
    await user.type(
      screen.getByPlaceholderText("Password"),
      "test-password-123"
    );

    await user.click(button);
    expect(button).toBeDisabled();

    //modal
    expect(
      await screen.findByText(
        "Invalid username or password. Requested credential not found."
      )
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("button", { name: "Try Again" })
    ).toBeInTheDocument();
  });
});
