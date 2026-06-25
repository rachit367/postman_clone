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

export const fetchCollections = createAsyncThunk(
  "collections/fetch",
  async (workspaceId: number) => {
    return api.get<Collection[]>(`/collections?workspace_id=${workspaceId}`);
  }
);

export const createCollection = createAsyncThunk(
  "collections/create",
  async ({ workspaceId, name }: { workspaceId: number; name: string }) => {
    return api.post<Collection>("/collections", { workspace_id: workspaceId, name });
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
  async ({
    collectionId,
    name,
    workspaceId,
  }: {
    collectionId: number;
    name: string;
    workspaceId: number;
  }) => {
    await api.post(`/collections/${collectionId}/folders`, { name });
    return api.get<Collection[]>(`/collections?workspace_id=${workspaceId}`);
  }
);

export const saveRequest = createAsyncThunk(
  "collections/saveRequest",
  async ({
    collectionId,
    request,
    workspaceId,
  }: {
    collectionId: number;
    request: Partial<ApiRequest>;
    workspaceId: number;
  }) => {
    const created = await api.post<ApiRequest>(
      `/collections/${collectionId}/requests`,
      request
    );
    const items = await api.get<Collection[]>(`/collections?workspace_id=${workspaceId}`);
    return { created, items };
  }
);

export const updateRequest = createAsyncThunk(
  "collections/updateRequest",
  async ({
    id,
    request,
    workspaceId,
  }: {
    id: number;
    request: Partial<ApiRequest>;
    workspaceId: number;
  }) => {
    await api.patch<ApiRequest>(`/requests/${id}`, request);
    return api.get<Collection[]>(`/collections?workspace_id=${workspaceId}`);
  }
);

export const deleteRequest = createAsyncThunk(
  "collections/deleteRequest",
  async ({ id, workspaceId }: { id: number; workspaceId: number }) => {
    await api.del(`/requests/${id}`);
    return api.get<Collection[]>(`/collections?workspace_id=${workspaceId}`);
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
