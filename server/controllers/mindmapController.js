const Document = require('../models/Document');
const { ai } = require('../utils/ai');

const generateMindmap = async (req, res) => {
  try {
    const { documentId } = req.body;

    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    if (!ai) return res.status(500).json({ message: "AI not configured" });

    const prompt = `
      Create a mindmap representing the core concepts and hierarchy from the following text.
      Return the output strictly as Mermaid.js syntax for a graph (graph TD or graph LR). 
      Ensure valid syntax. Do not wrap in markdown code blocks, just return the raw syntax string.

      Text:
      ${doc.text.substring(0, 15000)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let mermaidSyntax = response.text.trim();
    if (mermaidSyntax.startsWith('\`\`\`mermaid')) {
        mermaidSyntax = mermaidSyntax.replace('\`\`\`mermaid', '').replace('\`\`\`', '').trim();
    } else if (mermaidSyntax.startsWith('\`\`\`')) {
        mermaidSyntax = mermaidSyntax.replace('\`\`\`', '').replace('\`\`\`', '').trim();
    }

    res.json({ mermaid: mermaidSyntax });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating mindmap' });
  }
};

module.exports = {
  generateMindmap
};
