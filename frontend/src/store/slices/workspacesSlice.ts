import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { api } from "@/lib/api";
import { Workspace } from "@/types";

const STORAGE_KEY = "postman_clone_workspace_id";

interface WorkspacesState {
  items: Workspace[];
  selectedId: number | null;
}

const initialState: WorkspacesState = {
  items: [],
  selectedId: null,
};

function readStored(): number | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? Number(raw) : null;
}

function writeStored(id: number) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, String(id));
  }
}

export const fetchWorkspaces = createAsyncThunk("workspaces/fetch", async () => {
  return api.get<Workspace[]>("/workspaces");
});

export const createWorkspace = createAsyncThunk(
  "workspaces/create",
  async (name: string) => {
    return api.post<Workspace>("/workspaces", { name });
  }
);

export const renameWorkspace = createAsyncThunk(
  "workspaces/rename",
  async ({ id, name }: { id: number; name: string }) => {
    return api.patch<Workspace>(`/workspaces/${id}`, { name });
  }
);

export const deleteWorkspace = createAsyncThunk(
  "workspaces/delete",
  async (id: number) => {
    await api.del(`/workspaces/${id}`);
    return id;
  }
);

const workspacesSlice = createSlice({
  name: "workspaces",
  initialState,
  reducers: {
    selectWorkspace(state, action: PayloadAction<number>) {
      state.selectedId = action.payload;
      writeStored(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.items = action.payload;
        const stored = readStored();
        const validStored = stored && action.payload.some((w) => w.id === stored);
        state.selectedId = validStored ? stored : action.payload[0]?.id ?? null;
        if (state.selectedId) {
          writeStored(state.selectedId);
        }
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.selectedId = action.payload.id;
        writeStored(action.payload.id);
      })
      .addCase(renameWorkspace.fulfilled, (state, action) => {
        const index = state.items.findIndex((w) => w.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteWorkspace.fulfilled, (state, action) => {
        state.items = state.items.filter((w) => w.id !== action.payload);
        if (state.selectedId === action.payload) {
          state.selectedId = state.items[0]?.id ?? null;
          if (state.selectedId) {
            writeStored(state.selectedId);
          }
        }
      });
  },
});

export const { selectWorkspace } = workspacesSlice.actions;

export default workspacesSlice.reducer;
