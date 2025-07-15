// src/lib/document/documentApiSlice.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../api/baseQueryWithReauth";
import {
  Document,
  GetDocumentsApiResponse,
  UploadDocumentApiResponse,
} from "./documentTypes";

interface DocumentApiResponse {
  status: string;
  data: {
    document: Document;
  };
}

interface CreateEditableDocumentDto {
  name: string;
  content: any;
  shelfId?: string;
}

interface UpdateDocumentDto {
  name?: string;
  content?: any;
}

export const documentApiSlice = createApi({
  reducerPath: "documentApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Document"],
  endpoints: (builder) => ({
    createEditableDocument: builder.mutation<
      DocumentApiResponse,
      CreateEditableDocumentDto
    >({
      query: (newDocument) => ({
        url: "/documents/new",
        method: "POST",
        body: newDocument,
      }),
      invalidatesTags: (_result, _error, { shelfId }) =>
        shelfId ? [{ type: "Document", id: `LIST-${shelfId}` }] : [],
    }),

    getDocumentById: builder.query<Document, string>({
      query: (documentId) => `/documents/${documentId}`,
      transformResponse: (response: DocumentApiResponse) =>
        response.data.document,
      providesTags: (_result, _error, documentId) => [
        { type: "Document", id: documentId },
      ],
    }),
    getDocumentsInShelf: builder.query<Document[], string>({
      query: (shelfId) => `/documents/shelf/${shelfId}`,
      transformResponse: (response: GetDocumentsApiResponse) =>
        response.data.documents,
      providesTags: (result, _error, shelfId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Document" as const, id })),
              { type: "Document", id: `LIST-${shelfId}` },
            ]
          : [{ type: "Document", id: `LIST-${shelfId}` }],
    }),
    uploadDocument: builder.mutation<UploadDocumentApiResponse, FormData>({
      query: (formData) => ({
        url: "/documents/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (_result, _error, formData) => {
        const shelfId = formData.get("shelfId");
        return shelfId ? [{ type: "Document", id: `LIST-${shelfId}` }] : [];
      },
    }),

    updateDocument: builder.mutation<
      DocumentApiResponse,
      { documentId: string; data: UpdateDocumentDto }
    >({
      query: ({ documentId, data }) => ({
        url: `/documents/${documentId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { documentId }) => [
        { type: "Document", id: documentId },
      ],
    }),

    deleteDocument: builder.mutation<
      void,
      { documentId: string; shelfId?: string | null }
    >({
      query: ({ documentId }) => ({
        url: `/documents/${documentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { shelfId }) =>
        shelfId ? [{ type: "Document", id: `LIST-${shelfId}` }] : [],
    }),

    // This endpoint is correct. It fetches the PDF as a Blob.
    exportDocument: builder.mutation<Blob, string>({
      query: (documentId) => ({
        url: `/documents/${documentId}/export`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useCreateEditableDocumentMutation,
  useGetDocumentByIdQuery,
  useGetDocumentsInShelfQuery,
  useUploadDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useExportDocumentMutation, // Ensure this hook is exported
} = documentApiSlice;
