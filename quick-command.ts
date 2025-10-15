const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    figma.ui.postMessage({
      type: "quick-command-response",
      ok: res.ok,
      data,
      status: res.status,
    });
    figma.notify(res.ok ? "Quick Command executado" : `Erro: ${res.status}`);
  } catch (e: any) {
    console.error("[main] quick-command error:", e);
    figma.ui.postMessage({
      type: "quick-command-response",
      ok: false,
      data: { error: String(e?.message || e) },
      status: 500,
    });
  }
}