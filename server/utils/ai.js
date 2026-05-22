const { GoogleGenAI } = require('@google/genai');

let ai;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// Function to chunk text loosely by words
const chunkText = (text, maxWords = 400) => {
  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk = [];

  for (let word of words) {
    currentChunk.push(word);
    if (currentChunk.length >= maxWords) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [];
    }
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }
  return chunks;
};

// Generate summary via Gemini
const generateSummary = async (text) => {
  if (!ai) return { short: "AI Not Configured", detailed: "AI Not Configured", bulletPoints: [], keyConcepts: [] };
  
  try {
    const prompt = `
      You are an expert AI learning assistant. Your task is to perform a comprehensive analysis of the following document and extract key educational information to help a student learn.
      
      Carefully read the provided text and synthesize the information into a structured JSON format with EXACTLY the following keys:
      
      "short": A concise, 1-2 sentence high-level summary that captures the core essence and primary topic of the document.
      "detailed": A comprehensive, well-structured paragraph (4-6 sentences) summarizing the main arguments, critical findings, and overall narrative of the text. Do not just copy sentences; synthesize the meaning.
      "bulletPoints": An array of 5-8 strings, where each string is a crucial takeaway, important fact, or actionable insight from the text. Make them descriptive and informative.
      "keyConcepts": An array of 5-10 strings, where each string is a core concept, technical term, or key vocabulary word introduced in the text. Include a brief definition if apparent (e.g., "Photosynthesis: The process by which plants use sunlight...").

      Ensure the response is strictly valid JSON without any markdown formatting outside of the JSON structure.

      Document Text:
      ${text.substring(0, 30000)} // Ensure it's not too long for the prompt
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};

// Generate Embeddings
const generateEmbeddings = async (textChunks) => {
  if (!ai) return textChunks.map(() => [0,0,0]); // placeholder

  try {
    const embeddings = [];
    for (let chunk of textChunks) {
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: chunk,
      });
      embeddings.push(response.embeddings[0].values);
    }
    return embeddings;
  } catch (error) {
    console.error("AI Embedding Error:", error);
    throw error;
  }
};

const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

module.exports = {
  chunkText,
  generateSummary,
  generateEmbeddings,
  cosineSimilarity,
  ai
};
