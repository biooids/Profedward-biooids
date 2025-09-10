// src/services/indexing.service.ts

import prisma from "../db/prisma";
// FIX 1: Import the Prisma namespace for type usage.
import { Prisma } from "../../prisma/generated/prisma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document as LangChainDocument } from "@langchain/core/documents";
import { documentService } from "../features/document/document.service";
// FIX 2: Correct the import path for the shared config.
import { config } from "../config";

class IndexingService {
  private embeddings: GoogleGenerativeAIEmbeddings;
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor() {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: config.geminiApiKey,
      // Note: `modelName` is correct for the embedding model.
      modelName: "text-embedding-004",
    });

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
  }

  /**
   * Main public method to index a document.
   * This is what you'll call after a document is uploaded.
   * @param documentId The ID of the document to index.
   */
  public async indexDocument(documentId: string): Promise<void> {
    console.log(
      `[IndexingService] Starting indexing for document: ${documentId}`
    );

    // 1. Fetch the document's text content using the new method.
    const textContent = await documentService.getDocumentTextContent(
      documentId
    );
    if (!textContent || textContent.trim() === "") {
      console.log(
        `[IndexingService] Document ${documentId} has no content to index. Skipping.`
      );
      return;
    }

    // 2. Split the text into manageable chunks.
    const chunks = await this.textSplitter.splitText(textContent);
    console.log(
      `[IndexingService] Split document into ${chunks.length} chunks.`
    );

    // 3. Create LangChain Document objects with metadata.
    const langchainDocs = chunks.map(
      (chunk) =>
        new LangChainDocument({
          pageContent: chunk,
          metadata: { documentId: documentId },
        })
    );

    // 4. Initialize the vector store correctly.
    const vectorStore = new PrismaVectorStore(this.embeddings, {
      // FIX 3: Use the lowercase 'prisma' instance and uppercase 'Prisma' namespace.
      db: prisma,
      prisma: Prisma,
      tableName: "DocumentChunk",
      vectorColumnName: "embedding",
      columns: {
        id: PrismaVectorStore.IdColumn,
        content: PrismaVectorStore.ContentColumn,
      },
    });

    // 5. Add documents to the vector store. This now also requires the documentId for each chunk.
    await vectorStore.addModels(
      await prisma.documentChunk.createManyAndReturn({
        data: langchainDocs.map((doc) => ({
          content: doc.pageContent,
          documentId: documentId, // Ensure documentId is included here
        })),
      })
    );

    console.log(
      `[IndexingService] Successfully created and stored vectors for document: ${documentId}`
    );
  }
}

export const indexingService = new IndexingService();
