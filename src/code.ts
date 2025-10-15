type Credentials = { client_id: string; client_secret: string };
type TokenRecord = { access_token: string; expires_at: number }; // epoch ms

// ====== CONFIG – troque para os endpoints reais da StackSpot ======
const AUTH_URL = "https://auth.stackspot.com/oauth/token"; // exemplo/placeholder
// Exemplo: body esperado: { client_id, client_secret, grant_type: "client_credentials" }
// Resposta esperada: { access_token, expires_in }

// ====== STORAGE KEYS ======
const KS_CREDS = "stackspot.credentials";
const KS_TOKEN = "stackspot.token";

// ====== Mensagens UI <-> Main ======
type UIToMain =
  | { type: "submit-credentials"; client_id: string; client_secret: string }
  | { type: "reset-credentials" };

type MainToUI =
  | { type: "auth-needed" }
  | { type: "auth-success" }
  | { type: "auth-error"; message: string };

// Util: checa se token ainda está válido (considera margem de 30s)
function isTokenValid(t?: TokenRecord | null): boolean {
  if (!t?.access_token || !t?.expires_at) return false;
  const now = Date.now();
  return now + 30_000 < t.expires_at;
}

async function getStored<T>(key: string): Promise<T | null> {
  try {
    return (await figma.clientStorage.getAsync(key)) as T | null;
  } catch {
    return null;
  }
}

async function setStored<T>(key: string, value: T): Promise<void> {
  await figma.clientStorage.setAsync(key, value as any);
}

async function clearStored(key: string): Promise<void> {
  await figma.clientStorage.setAsync(key, null as any);
}

// Chama o endpoint de auth usando fetch do Figma (no main)
async function authenticate(creds: Credentials): Promise< TokenRecord > {
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      grant_type: "client_credentials"
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Auth failed (${res.status}). ${text}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  if (!data.access_token) {
    throw new Error("Auth response missing access_token.");
  }
  const expires_at = Date.now() + (Math.max(30, data.expires_in || 0) * 1000);
  return { access_token: data.access_token, expires_at };
}

function showUI() {
  if (!figma.ui) {
    figma.showUI(__html__, { width: 380, height: 300, themeColors: true });
  }
}

function postToUI(msg: MainToUI) {
  showUI();
  figma.ui.postMessage(msg);
}

// Fluxo ao abrir o plugin
async function init() {
  // 1) tenta token válido existente
  const token = await getStored<TokenRecord>(KS_TOKEN);
  if (isTokenValid(token)) {
    // já autenticado → segue o fluxo (pula UI)
    // Aqui você já pode chamar a próxima etapa (ex: consultar “tagueamento” + quick command)
    // Por agora, só fechamos o plugin ou mantenha-o aberto para o próximo passo.
    figma.notify("Autenticado (token válido). Pulando login.");
    // -> chame sua próxima função aqui, ex: await runQuickCommandFlow(token!.access_token);
    return;
  }

  // 2) tenta com credenciais armazenadas
  const creds = await getStored<Credentials>(KS_CREDS);
  if (creds?.client_id && creds?.client_secret) {
    try {
      const newToken = await authenticate(creds);
      await setStored(KS_TOKEN, newToken);
      figma.notify("Autenticado com credenciais salvas.");
      // -> próxima etapa
      return;
    } catch (err:any) {
      // credenciais salvas falharam → mostra UI para reenviar
      console.warn("Stored creds failed:", err?.message || err);
      showUI();
      postToUI({ type: "auth-needed" });
      return;
    }
  }

  // 3) sem credenciais → mostra UI
  showUI();
  postToUI({ type: "auth-needed" });
}

// Mensagens vindas da UI
figma.ui?.onmessage = async (msg: UIToMain) => {
  if (msg.type === "reset-credentials") {
    await clearStored(KS_CREDS);
    await clearStored(KS_TOKEN);
    postToUI({ type: "auth-needed" });
    figma.notify("Credenciais limpas.");
    return;
  }

  if (msg.type === "submit-credentials") {
    const { client_id, client_secret } = msg;
    try {
      // salva credenciais
      const creds: Credentials = { client_id, client_secret };
      await setStored(KS_CREDS, creds);

      // tenta autenticar
      const token = await authenticate(creds);
      await setStored(KS_TOKEN, token);

      postToUI({ type: "auth-success" });
      figma.notify("Autenticação OK.");
      // -> próxima etapa
    } catch (err: any) {
      postToUI({ type: "auth-error", message: err?.message || "Falha na autenticação." });
      figma.notify("Erro na autenticação.");
    }
  }
};

// Start
showUI(); // cria a UI imediatamente (mais responsivo)
init().catch((e) => {
  console.error(e);
  postToUI({ type: "auth-error", message: "Falha ao inicializar o plugin." });
});