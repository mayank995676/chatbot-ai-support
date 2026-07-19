export async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    // Use dynamic require to prevent ESM/CommonJS bundler mismatch in Next.js Turbopack
    const pdf = require("pdf-parse");
    const data = await pdf(buffer);
    return data.text || "";
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to extract text from PDF document.");
  }
}
