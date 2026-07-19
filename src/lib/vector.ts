export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
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
}

export function chunkText(text: string, chunkSize: number = 800, chunkOverlap: number = 150): string[] {
  const cleanText = text.replace(/\r\n/g, "\n").replace(/\s+/g, " ");
  const chunks: string[] = [];
  
  if (cleanText.length <= chunkSize) {
    return [cleanText.trim()];
  }
  
  let startIndex = 0;
  while (startIndex < cleanText.length) {
    let endIndex = startIndex + chunkSize;
    
    if (endIndex < cleanText.length) {
      const lastSpace = cleanText.lastIndexOf(" ", endIndex);
      if (lastSpace > startIndex + (chunkSize * 0.75)) {
        endIndex = lastSpace;
      }
    }
    
    const chunk = cleanText.substring(startIndex, endIndex).trim();
    if (chunk) {
      chunks.push(chunk);
    }
    
    startIndex = endIndex - chunkOverlap;
    if (startIndex >= cleanText.length || endIndex >= cleanText.length) {
      break;
    }
  }
  
  return chunks.filter(c => c.length > 10);
}

// Local TF-IDF Relevance Search for RAG (Requires 0 Embedding Keys!)
export function searchChunksTfIdf(query: string, chunks: Array<{ content: string }>): string {
  const queryTokens = query.toLowerCase().match(/\b\w+\b/g) || [];
  if (queryTokens.length === 0 || chunks.length === 0) return "";

  // 1. Compute Document Frequencies (DF)
  const docFreqs: Record<string, number> = {};
  const chunkTokensList = chunks.map((chunk) => {
    const tokens = chunk.content.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueTokens = new Set(tokens);
    uniqueTokens.forEach((token) => {
      docFreqs[token] = (docFreqs[token] || 0) + 1;
    });
    return tokens;
  });

  const N = chunks.length;

  // 2. Score each chunk based on TF-IDF
  const ranked = chunks.map((chunk, idx) => {
    const tokens = chunkTokensList[idx];
    const tf: Record<string, number> = {};
    tokens.forEach((token) => {
      tf[token] = (tf[token] || 0) + 1;
    });

    let score = 0;
    queryTokens.forEach((token) => {
      if (tf[token]) {
        // Standard TF-IDF weighting formula
        const idf = Math.log((N + 1) / ((docFreqs[token] || 0) + 0.5));
        const tfVal = tf[token] / tokens.length;
        score += tfVal * idf;
      }
    });

    return { content: chunk.content, score };
  });

  // 3. Filter out irrelevant noise, sort and take top 5 chunks
  const topMatches = ranked
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (topMatches.length === 0) return "";

  return topMatches
    .map((match, i) => `[Document Chunk ${i + 1}]\n${match.content}`)
    .join("\n\n");
}
