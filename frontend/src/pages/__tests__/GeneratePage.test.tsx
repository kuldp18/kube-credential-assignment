import GeneratePage from "../GeneratePage";
import { render, waitFor } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { BrowserRouter } from "react-router";
import apiClient from "../../api/client";

// Mock API
vi.mock("../../api/client");

describe("GeneratePage", () => {
  // Mock clipboard API
  const mockWriteText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteText.mockClear();

    // Reset clipboard mock before each test
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
      configurable: true,
    });
  });

  it("should render the initial form correctly on the page with a disabled button", () => {
    render(<GeneratePage />, { wrapper: BrowserRouter });

    expect(
      screen.getByRole("heading", { name: "Generate a new credential" })
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Generate" })).toBeDisabled();
  });

  it("should enable the Generate button only when the user starts typing a username", async () => {
    const user = userEvent.setup();
    render(<GeneratePage />, { wrapper: BrowserRouter });

    const usernameInput = screen.getByPlaceholderText("Username");
    const generateButton = screen.getByRole("button", { name: "Generate" });

    await user.type(usernameInput, "test-user");
    expect(generateButton).toBeEnabled();
  });

  it("should show a modal with credential details when a new generation is successful", async () => {
    const user = userEvent.setup();
    render(<GeneratePage />, { wrapper: BrowserRouter });

    const button = screen.getByRole("button", { name: "Generate" });

    const mockCredential = {
      username: "test-user",
      password: "test-password-123",
      issuedAt: new Date().toISOString(),
      issuedBy: "credential issued by worker-test",
    };

    (apiClient.post as Mock).mockResolvedValue({
      data: {
        message: "Credential generated",
        error: false,
        data: { credential: mockCredential },
      },
    });

    await user.type(screen.getByPlaceholderText("Username"), "test-user");
    await user.click(button);

    expect(button).toBeDisabled();

    // find modal
    expect(await screen.findByText("Credential generated")).toBeInTheDocument();
    expect(screen.getByText("test-user")).toBeInTheDocument();
    expect(screen.getByText("test-password-123")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Go to verification page" })
    ).toBeInTheDocument();
  });

  it("should show an alternate modal when a credential is already generated for a username", async () => {
    const user = userEvent.setup();
    render(<GeneratePage />, { wrapper: BrowserRouter });

    const button = screen.getByRole("button", { name: "Generate" });

    const mockCredential = {
      username: "test-user",
      password: "test-password-123",
      issuedAt: new Date().toISOString(),
      issuedBy: "credential issued by worker-test",
    };

    (apiClient.post as Mock).mockResolvedValue({
      data: {
        message: "Credential with username 'test-user' already exists",
        error: false,
        data: {
          credential: mockCredential,
        },
      },
    });

    await user.type(screen.getByPlaceholderText("Username"), "test-user");
    await user.click(button);

    expect(
      await screen.findByText(
        "Credential with username 'test-user' already exists"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Go to verification page" })
    ).toBeInTheDocument();
  });
  it("should copy the password to clipboard on click and display 'Copied!' text for 2 seconds", async () => {
    const user = userEvent.setup();
    render(<GeneratePage />, { wrapper: BrowserRouter });

    const mockCredential = {
      username: "test-user",
      password: "test-password-123",
      issuedAt: new Date().toISOString(),
      issuedBy: "credential issued by worker-test",
    };

    (apiClient.post as Mock).mockResolvedValue({
      data: {
        message: "Credential generated",
        error: false,
        data: {
          credential: mockCredential,
        },
      },
    });

    await user.type(screen.getByPlaceholderText("Username"), "test-user");
    await user.click(screen.getByRole("button", { name: "Generate" }));

    const passwordSpan = await screen.findByText("test-password-123");

    await user.click(passwordSpan);

    expect(await screen.findByText("Copied!")).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
      },
      { timeout: 2200 }
    );

    expect(screen.getByText("test-password-123")).toBeInTheDocument();
  });
});
