figma.ui.onmessage = async (msg) => {
    if (msg.type === "send-credentials") {
      const { client_id, client_secret } = msg;
  
      try {
        const res = await fetch("https://idm.stackspot.com/.../oauth/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body:
            `client_id=${encodeURIComponent(client_id)}&` +
            `client_secret=${encodeURIComponent(client_secret)}&` +
            `grant_type=client_credentials`,
        });
  
        // 🧩 o trecho que você mostrou entra aqui 👇
        const text = await res.text();
  
        let data: any = null;
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = { raw: text };
        }
  
        if (data && typeof data === "object" && data.access_token) {
          const expiresIn = Number(data.expires_in) || 3600;
          const tokenRecord: TokenRecord = {
            access_token: String(data.access_token),
            expires_at: Date.now() + Math.max(30, expiresIn) * 1000,
          };
  
          await saveToken(tokenRecord);
  
          figma.ui.postMessage({
            type: "auth-response",
            status: res.status,
            ok: res.ok,
            saved: true,
            tokenPreview: "•••" + tokenRecord.access_token.slice(-6),
            expires_at: tokenRecord.expires_at,
          });
          figma.notify("Access token salvo.");
        } else {
          figma.ui.postMessage({
            type: "auth-response",
            status: res.status,
            ok: res.ok,
            saved: false,
            data,
          });
          if (!res.ok) figma.notify(`Auth HTTP ${res.status}`);
        }
        // 🧩 fim do trecho
      } catch (e) {
        figma.ui.postMessage({
          type: "auth-error",
          message: String((e as any)?.message || e),
        });
        figma.notify("Erro ao autenticar");
      }
    }
  };