import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api } from "@/lib/api";
import { ApiRequest, Collection } from "@/types";

interface CollectionsState {
  items: Collection[];
  loading: boolean;
}

const initialState: CollectionsState = {
  items: [],
  loading: false,
};

export const fetchCollections = createAsyncThunk("collections/fetch", async () => {
  return api.get<Collection[]>("/collections");
});

export const createCollection = createAsyncThunk(
  "collections/create",
  async (name: string) => {
    return api.post<Collection>("/collections", { name });
  }
);

export const renameCollection = createAsyncThunk(
  "collections/rename",
  async ({ id, name }: { id: number; name: string }) => {
    return api.patch<Collection>(`/collections/${id}`, { name });
  }
);

export const deleteCollection = createAsyncThunk(
  "collections/delete",
  async (id: number) => {
    await api.del(`/collections/${id}`);
    return id;
  }
);

export const createFolder = createAsyncThunk(
  "collections/createFolder",
  async ({ collectionId, name }: { collectionId: number; name: string }) => {
    await api.post(`/collections/${collectionId}/folders`, { name });
    return api.get<Collection[]>("/collections");
  }
);

export const saveRequest = createAsyncThunk(
  "collections/saveRequest",
  async ({
    collectionId,
    request,
  }: {
    collectionId: number;
    request: Partial<ApiRequest>;
  }) => {
    const created = await api.post<ApiRequest>(
      `/collections/${collectionId}/requests`,
      request
    );
    const items = await api.get<Collection[]>("/collections");
    return { created, items };
  }
);

export const updateRequest = createAsyncThunk(
  "collections/updateRequest",
  async ({ id, request }: { id: number; request: Partial<ApiRequest> }) => {
    await api.patch<ApiRequest>(`/requests/${id}`, request);
    return api.get<Collection[]>("/collections");
  }
);

export const deleteRequest = createAsyncThunk(
  "collections/deleteRequest",
  async (id: number) => {
    await api.del(`/requests/${id}`);
    return api.get<Collection[]>("/collections");
  }
);

const collectionsSlice = createSlice({
  name: "collections",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(createCollection.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(renameCollection.fulfilled, (state, action) => {
        const index = state.items.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteCollection.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(saveRequest.fulfilled, (state, action) => {
        state.items = action.payload.items;
      })
      .addCase(updateRequest.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(deleteRequest.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export default collectionsSlice.reducer;
