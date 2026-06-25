import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api } from "@/lib/api";
import { HistoryEntry } from "@/types";

interface HistoryState {
  items: HistoryEntry[];
}

const initialState: HistoryState = {
  items: [],
};

export const fetchHistory = createAsyncThunk(
  "history/fetch",
  async (workspaceId: number) => {
    return api.get<HistoryEntry[]>(`/history?workspace_id=${workspaceId}`);
  }
);

export const deleteHistoryEntry = createAsyncThunk(
  "history/delete",
  async (id: number) => {
    await api.del(`/history/${id}`);
    return id;
  }
);

export const clearHistory = createAsyncThunk("history/clear", async () => {
  await api.del("/history");
});

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(deleteHistoryEntry.fulfilled, (state, action) => {
        state.items = state.items.filter((h) => h.id !== action.payload);
      })
      .addCase(clearHistory.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export default historySlice.reducer;
