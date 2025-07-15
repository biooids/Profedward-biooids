// src/utils/document.parser.ts

import fs from "fs";
// We import from the main entry point of the official library.
import * as pdfjs from "pdfjs-dist";

/**
 * Parses the text from a PDF file using the official pdf.js library
 * and converts it into a Tiptap-compatible JSON object.
 * @param filePath The local path to the PDF file.
 * @returns A Promise that resolves with the Tiptap JSON object.
 */
export async function parsePdfToTiptapJson(filePath: string): Promise<any> {
  try {
    const data = new Uint8Array(fs.readFileSync(filePath));

    // The getDocument method works reliably with the official package version.
    const doc = await pdfjs.getDocument({
      data,
      // This setting is crucial for Node.js environments to avoid font/DOM errors.
      disableFontFace: true,
    }).promise;

    const numPages = doc.numPages;
    let fullText = "";

    // Loop through each page of the PDF to extract text.
    for (let i = 1; i <= numPages; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();

      // Reconstruct paragraphs by joining text items.
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n"; // Add a newline after each page's content
    }

    // Split the full extracted text by newlines to create Tiptap paragraphs.
    const contentNodes = fullText
      .split("\n")
      .filter((line) => line.trim() !== "") // Remove empty lines
      .map((line) => ({
        type: "paragraph",
        content: [{ type: "text", text: line.trim() }],
      }));

    // If no text was found, return a single empty paragraph to ensure valid Tiptap JSON.
    if (contentNodes.length === 0) {
      return { type: "doc", content: [{ type: "paragraph" }] };
    }

    // Return the final Tiptap-compatible JSON object.
    return {
      type: "doc",
      content: contentNodes,
    };
  } catch (error) {
    console.error(
      "[DocumentParser] Failed to parse PDF with official pdf.js:",
      error
    );
    return null;
  }
}
