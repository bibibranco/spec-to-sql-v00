function collectTagueamentoText() {
  const currentPage = figma.currentPage;

  const tagueamentoFrames = currentPage.findAll(node =>
    node.type === "FRAME" &&
    node.visible &&
    node.name.toLowerCase().includes("tagueamento")
  );

  const results: any[] = [];

  for (const frame of tagueamentoFrames) {
    // procura todos os TEXT dentro do frame
    const textNodes = frame.findAll(n => n.type === "TEXT" && n.visible);

    const texts = textNodes.map(t => {
      return {
        id: t.id,
        name: t.name,
        characters: t.characters,
        fontName: t.fontName,
        fontSize: t.fontSize,
        x: t.x,
        y: t.y,
        width: t.width,
        height: t.height,
      };
    });

    results.push({
      frameId: frame.id,
      frameName: frame.name,
      textCount: texts.length,
      texts,
    });
  }

  return results;
}