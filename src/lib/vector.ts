export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
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

export function chunkText(text: string, chunkSize: number = 1000, chunkOverlap: number = 200): string[] {
  const cleanText = text.replace(/\r\n/g, "\n").replace(/\s+/g, " ");
  const chunks: string[] = [];
  
  if (cleanText.length <= chunkSize) {
    return [cleanText.trim()];
  }
  
  let startIndex = 0;
  while (startIndex < cleanText.length) {
    let endIndex = startIndex + chunkSize;
    
    // Try not to cut words in half
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
    // Safeguard to avoid infinite loop
    if (startIndex >= cleanText.length || endIndex >= cleanText.length) {
      break;
    }
  }
  
  return chunks.filter(c => c.length > 10);
}
