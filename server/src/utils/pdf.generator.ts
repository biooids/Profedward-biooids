// src/utils/pdf.generator.ts

import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import puppeteer from "puppeteer";
import { JsonValue } from "@prisma/client/runtime/library";

/**
 * Converts Tiptap's JSON content into a PDF buffer.
 * @param content The JSON content from a Tiptap editor.
 * @returns A Promise that resolves with the PDF buffer.
 */
export async function generatePdfFromTiptapJson(
  content: JsonValue
): Promise<Buffer> {
  // 1. Generate HTML from the Tiptap JSON content.
  const html = generateHTML(content as any, [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
  ]);

  // 2. Add basic styling to make the PDF look like a proper document.
  const styledHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: sans-serif; padding: 2rem; }
          h1, h2, h3 { line-height: 1.2; }
          p { line-height: 1.5; }
          blockquote { border-left: 3px solid #ccc; padding-left: 1rem; margin-left: 0; }
          ul, ol { padding-left: 1.5rem; }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;

  // 3. Launch a headless browser instance with Puppeteer.
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // Important for running in server environments
  });
  const page = await browser.newPage();

  // 4. Set the page content and generate the PDF.
  await page.setContent(styledHtml, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

  // 5. Close the browser and return the buffer.
  await browser.close();

  // --- THIS IS THE FIX ---
  // Ensure the returned type is explicitly a Node.js Buffer,
  // as Puppeteer's return type can sometimes be inferred as a more generic Uint8Array.
  return Buffer.from(pdfBuffer);
}
