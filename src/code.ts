figma.showUI(__html__, { width: 360, height: 220 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === "send-credentials") {
    const { client_id, client_secret } = msg;
    try {
      const res = await fetch("https://auth.stackspot.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id,
          client_secret,
          grant_type: "client_credentials",
        }),
      });

      const data = await res.json();
      console.log("Response:", data);

      if (!res.ok) {
        figma.notify(`Auth failed: ${data.error || res.statusText}`);
        figma.ui.postMessage({ type: "auth-error", message: data.error || "Failed" });
        return;
      }

      figma.notify("Auth success!");
      figma.ui.postMessage({ type: "auth-success", data });
    } catch (err) {
      console.error("Error:", err);
      figma.notify("Request failed");
      figma.ui.postMessage({ type: "auth-error", message: String(err) });
    }
  }
};