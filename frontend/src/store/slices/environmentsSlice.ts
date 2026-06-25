import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api } from "@/lib/api";
import { Environment, EnvironmentVariable } from "@/types";

interface EnvironmentsState {
  items: Environment[];
  loading: boolean;
}

const initialState: EnvironmentsState = {
  items: [],
  loading: false,
};

type VariableInput = Omit<EnvironmentVariable, "id">;

export const fetchEnvironments = createAsyncThunk(
  "environments/fetch",
  async (workspaceId: number) => {
    return api.get<Environment[]>(`/environments?workspace_id=${workspaceId}`);
  }
);

export const createEnvironment = createAsyncThunk(
  "environments/create",
  async ({
    workspaceId,
    name,
    variables,
  }: {
    workspaceId: number;
    name: string;
    variables: VariableInput[];
  }) => {
    return api.post<Environment>("/environments", {
      workspace_id: workspaceId,
      name,
      variables,
    });
  }
);

export const updateEnvironment = createAsyncThunk(
  "environments/update",
  async ({
    id,
    name,
    variables,
  }: {
    id: number;
    name: string;
    variables: VariableInput[];
  }) => {
    return api.patch<Environment>(`/environments/${id}`, { name, variables });
  }
);

export const deleteEnvironment = createAsyncThunk(
  "environments/delete",
  async (id: number) => {
    await api.del(`/environments/${id}`);
    return id;
  }
);

export const activateEnvironment = createAsyncThunk(
  "environments/activate",
  async ({ id, workspaceId }: { id: number; workspaceId: number }) => {
    await api.post(`/environments/${id}/activate`);
    return api.get<Environment[]>(`/environments?workspace_id=${workspaceId}`);
  }
);

export const deactivateEnvironments = createAsyncThunk(
  "environments/deactivate",
  async (workspaceId: number) => {
    await api.post("/environments/deactivate");
    return api.get<Environment[]>(`/environments?workspace_id=${workspaceId}`);
  }
);

const environmentsSlice = createSlice({
  name: "environments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnvironments.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(createEnvironment.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateEnvironment.fulfilled, (state, action) => {
        const index = state.items.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteEnvironment.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e.id !== action.payload);
      })
      .addCase(activateEnvironment.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(deactivateEnvironments.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export default environmentsSlice.reducer;
