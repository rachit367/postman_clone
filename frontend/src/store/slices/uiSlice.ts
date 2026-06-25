import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";

export interface Toast {
  id: string;
  message: string;
  kind: "success" | "error" | "info";
}

export type ModalKind =
  | { type: "save-request" }
  | { type: "new-collection" }
  | { type: "environment-manager" }
  | { type: "workspace-create" }
  | { type: "workspace-rename"; id: number; name: string }
  | { type: "coming-soon"; title: string }
  | null;

interface UiState {
  toasts: Toast[];
  modal: ModalKind;
}

const initialState: UiState = {
  toasts: [],
  modal: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    pushToast: {
      reducer(state, action: PayloadAction<Toast>) {
        state.toasts.push(action.payload);
      },
      prepare(message: string, kind: Toast["kind"] = "info") {
        return { payload: { id: nanoid(), message, kind } };
      },
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    openModal(state, action: PayloadAction<ModalKind>) {
      state.modal = action.payload;
    },
    closeModal(state) {
      state.modal = null;
    },
  },
});

export const { pushToast, dismissToast, openModal, closeModal } = uiSlice.actions;

export default uiSlice.reducer;
