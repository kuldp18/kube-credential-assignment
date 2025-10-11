import { describe, it, expect, vi, beforeEach } from "vitest";
import { copyToClipboard } from "../copyToClipboard";

describe("copyToClipboard", () => {
  const mockWriteText = vi.fn().mockResolvedValue(undefined);
  const mockExecCommand = vi.fn().mockReturnValue(true);

  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteText.mockClear();
    mockExecCommand.mockClear();

    // Mock document.execCommand
    document.execCommand = mockExecCommand;
  });

  it("should use navigator.clipboard.writeText in secure context", async () => {
    // Setup secure context
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "isSecureContext", {
      value: true,
      writable: true,
      configurable: true,
    });

    await copyToClipboard("test-text");

    expect(mockWriteText).toHaveBeenCalledWith("test-text");
    expect(mockExecCommand).not.toHaveBeenCalled();
  });

  it("should use fallback method (execCommand) in non-secure context", async () => {
    // Setup non-secure context
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "isSecureContext", {
      value: false,
      writable: true,
      configurable: true,
    });

    await copyToClipboard("test-password-123");

    expect(mockExecCommand).toHaveBeenCalledWith("copy");
    expect(mockWriteText).not.toHaveBeenCalled();
  });

  it("should use fallback method when clipboard API is not available", async () => {
    // Setup: clipboard API not available but secure context
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "isSecureContext", {
      value: true,
      writable: true,
      configurable: true,
    });

    await copyToClipboard("fallback-text");

    expect(mockExecCommand).toHaveBeenCalledWith("copy");
    expect(mockWriteText).not.toHaveBeenCalled();
  });

  it("should create and remove textarea element for fallback", async () => {
    // Setup non-secure context
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "isSecureContext", {
      value: false,
      writable: true,
      configurable: true,
    });

    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");

    await copyToClipboard("test-text");

    expect(appendChildSpy).toHaveBeenCalledTimes(1);
    expect(removeChildSpy).toHaveBeenCalledTimes(1);

    const textarea = appendChildSpy.mock.calls[0][0] as HTMLTextAreaElement;
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea.value).toBe("test-text");
    expect(textarea.style.position).toBe("fixed");
  });
});
