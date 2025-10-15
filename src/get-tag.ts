function collectTagueamentoText() {
    const page = figma.currentPage;
  
    // 1) acha os frames “tagueamento” e FAZ CAST para FrameNode[]
    const tagueamentoFrames = page.findAll((node: SceneNode) =>
      node.type === "FRAME" &&
      node.visible &&
      node.name.toLowerCase().includes("tagueamento")
    ) as FrameNode[];
  
    const results: Array<{
      frameId: string;
      frameName: string;
      textCount: number;
      texts: Array<{
        id: string;
        name: string;
        characters: string;
        x: number; y: number; width: number; height: number;
        fontName: FontName | PluginAPI['mixed'];
        fontSize: number | PluginAPI['mixed'];
      }>;
    }> = [];
  
    for (const frame of tagueamentoFrames) {
      // 2) agora frame é FrameNode ⇒ tem findAll
      const textNodes = (frame as FrameNode).findAll((n: SceneNode) =>
        n.type === "TEXT" && (n as TextNode).visible
      ) as TextNode[];
  
      const texts = textNodes.map((t: TextNode) => ({
        id: t.id,
        name: t.name,
        characters: t.characters,
        x: t.x,
        y: t.y,
        width: t.width,
        height: t.height,
        fontName: t.fontName,
        fontSize: t.fontSize,
      }));
  
      results.push({
        frameId: frame.id,
        frameName: frame.name,
        textCount: texts.length,
        texts,
      });
    }
  
    return results;
  }