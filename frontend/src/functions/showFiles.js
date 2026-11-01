export const showFiles = (url, desc) => {
  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  if (desc) {
    const newWindow = window.open("", "_blank", "width=650,height=450,noopener,noreferrer");
    if (!newWindow) return;
    newWindow.document.title = "Note-Bridge | Note Preview";
    newWindow.document.body.style.margin = "0";
    newWindow.document.body.style.backgroundColor = "#1a1a24";
    newWindow.document.body.style.color = "#f1f1f1";

    const container = newWindow.document.createElement("div");
    container.style.cssText =
      "margin: 24px; line-height: 1.6; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; white-space: pre-wrap; word-break: break-word; font-size: 15px;";
    container.textContent = desc;
    newWindow.document.body.appendChild(container);
  }
};
