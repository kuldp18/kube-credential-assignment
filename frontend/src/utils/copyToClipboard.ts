export async function copyToClipboard(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for HTTP (IP ingress, etc.)
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed"; // prevent scrolling to bottom
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}
