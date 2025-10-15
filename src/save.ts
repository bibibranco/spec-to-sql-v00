// se veio JSON com token, monta o registro e salva
if (data && typeof data === "object" && data.access_token) {
  const expiresIn = Number(data.expires_in) || 3600; // fallback 1h
  const tokenRecord: TokenRecord = {
    access_token: String(data.access_token),
    expires_at: Date.now() + Math.max(30, expiresIn) * 1000,
  };
  await saveToken(tokenRecord);

  // por segurança, não mando o token inteiro pra UI
  figma.ui.postMessage({
    type: "auth-response",
    status: res.status,
    ok: res.ok,
    saved: true,
    tokenPreview: "•••" + tokenRecord.access_token.slice(-6), // só finalzinho
    expires_at: tokenRecord.expires_at,
  });
  figma.notify("Access token salvo.");
} else {
  // não veio JSON com token — devolve pra UI p/ debug
  figma.ui.postMessage({
    type: "auth-response",
    status: res.status,
    ok: res.ok,
    saved: false,
    data,
  });
  if (!res.ok) figma.notify(`Auth HTTP ${res.status}`);
}