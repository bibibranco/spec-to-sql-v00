figma.ui.onmessage = async (msg) => {
  if (!msg || !msg.type) return;

  if (msg.type === "run-quick-command") {
    try {
      console.log("[run-quick-command] recebido:", msg);

      // executa o POST pro StackSpot
      const started = await startQuickCommand(msg.commandId, msg.payload);

      // devolve pra UI o resultado inicial (run id, status, etc.)
      figma.ui.postMessage({
        type: "quick-command-response",
        ok: true,
        data: started?.raw || null,
        runId: started?.id || null,
        status: started?.status || null,
      });

      figma.notify("Quick Command enviado!");
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("[run-quick-command] erro:", message);

      figma.ui.postMessage({
        type: "quick-command-response",
        ok: false,
        data: { error: message },
        status: 500,
      });

      figma.notify("Erro ao executar Quick Command");
    }
  }
};