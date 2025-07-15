// src/lib/shelf/shelfTypes.ts

/**
 * Represents the structure of a single Shelf object
 * as returned by the backend API.
 */
export interface Shelf {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  // --- THIS IS THE FIX ---
  // This property will now be included from the API.
  _count: {
    documents: number;
  };
}

/**
 * The shape of the API response when fetching multiple shelves.
 */
export interface GetShelvesApiResponse {
  status: string;
  results: number;
  data: {
    shelves: Shelf[];
  };
}

/**
 * The shape of the API response when creating a single shelf.
 */
export interface CreateShelfApiResponse {
  status: string;
  message: string;
  data: {
    shelf: Shelf;
  };
}

/**
 * The shape of the API response when updating a single shelf.
 */
export type UpdateShelfApiResponse = CreateShelfApiResponse;

// DTOs (Data Transfer Objects) for making requests

export interface CreateShelfDto {
  name: string;
}

export interface UpdateShelfDto {
  name: string;
}
