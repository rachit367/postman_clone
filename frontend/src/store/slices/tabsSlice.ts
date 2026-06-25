import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";

import { blankRow, defaultScripts, defaultSettings } from "@/lib/defaults";
import {
  ApiRequest,
  AuthType,
  BodyMode,
  HttpMethod,
  KeyValue,
  RequestScripts,
  RequestSettings,
  RunError,
  RunResponse,
} from "@/types";

export interface DraftRequest {
  name: string;
  method: HttpMethod;
  url: string;
  query_params: KeyValue[];
  headers: KeyValue[];
  body_mode: BodyMode;
  body_raw: string;
  body_raw_type: string;
  body_form: KeyValue[];
  auth_type: AuthType;
  auth_data: Record<string, string>;
  scripts: RequestScripts;
  settings: RequestSettings;
}

export interface Tab {
  id: string;
  requestId: number | null;
  collectionId: number | null;
  activeSubTab: string;
  draft: DraftRequest;
  dirty: boolean;
  sending: boolean;
  response: RunResponse | null;
  error: RunError["error"] | null;
}

interface TabsState {
  tabs: Tab[];
  activeTabId: string | null;
  showHome: boolean;
}

function newDraft(): DraftRequest {
  return {
    name: "New Request",
    method: "GET",
    url: "",
    query_params: [blankRow()],
    headers: [blankRow()],
    body_mode: "none",
    body_raw: "",
    body_raw_type: "json",
    body_form: [blankRow()],
    auth_type: "none",
    auth_data: {},
    scripts: defaultScripts(),
    settings: defaultSettings(),
  };
}

function newTab(): Tab {
  return {
    id: nanoid(),
    requestId: null,
    collectionId: null,
    activeSubTab: "params",
    draft: newDraft(),
    dirty: false,
    sending: false,
    response: null,
    error: null,
  };
}

const firstTab = newTab();

const initialState: TabsState = {
  tabs: [firstTab],
  activeTabId: firstTab.id,
  showHome: true,
};

function findActive(state: TabsState): Tab | undefined {
  return state.tabs.find((t) => t.id === state.activeTabId);
}

function ensureTrailingRow(rows: KeyValue[]): KeyValue[] {
  const last = rows[rows.length - 1];
  if (!last || last.key || last.value) {
    return [...rows, blankRow()];
  }
  return rows;
}

const tabsSlice = createSlice({
  name: "tabs",
  initialState,
  reducers: {
    openNewTab(state) {
      const tab = newTab();
      state.tabs.push(tab);
      state.activeTabId = tab.id;
      state.showHome = false;
    },
    openRequestInTab(state, action: PayloadAction<ApiRequest>) {
      const request = action.payload;
      const existing = state.tabs.find((t) => t.requestId === request.id);
      if (existing) {
        state.activeTabId = existing.id;
        state.showHome = false;
        return;
      }
      const tab = newTab();
      tab.requestId = request.id;
      tab.collectionId = request.collection_id;
      tab.draft = {
        name: request.name,
        method: request.method,
        url: request.url,
        query_params: ensureTrailingRow(request.query_params ?? []),
        headers: ensureTrailingRow(request.headers ?? []),
        body_mode: request.body_mode,
        body_raw: request.body_raw ?? "",
        body_raw_type: request.body_raw_type ?? "json",
        body_form: ensureTrailingRow(request.body_form ?? []),
        auth_type: request.auth_type,
        auth_data: request.auth_data ?? {},
        scripts: request.scripts ?? defaultScripts(),
        settings: request.settings ?? defaultSettings(),
      };
      state.tabs.push(tab);
      state.activeTabId = tab.id;
      state.showHome = false;
    },
    openHistoryInTab(state, action: PayloadAction<DraftRequest>) {
      const tab = newTab();
      tab.draft = action.payload;
      state.tabs.push(tab);
      state.activeTabId = tab.id;
      state.showHome = false;
    },
    closeTab(state, action: PayloadAction<string>) {
      const index = state.tabs.findIndex((t) => t.id === action.payload);
      if (index === -1) {
        return;
      }
      state.tabs.splice(index, 1);
      if (state.tabs.length === 0) {
        const tab = newTab();
        state.tabs.push(tab);
        state.activeTabId = tab.id;
      } else if (state.activeTabId === action.payload) {
        state.activeTabId = state.tabs[Math.max(0, index - 1)].id;
      }
    },
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTabId = action.payload;
      state.showHome = false;
    },
    setShowHome(state, action: PayloadAction<boolean>) {
      state.showHome = action.payload;
    },
    setActiveSubTab(state, action: PayloadAction<string>) {
      const tab = findActive(state);
      if (tab) {
        tab.activeSubTab = action.payload;
      }
    },
    updateDraft(state, action: PayloadAction<Partial<DraftRequest>>) {
      const tab = findActive(state);
      if (tab) {
        tab.draft = { ...tab.draft, ...action.payload };
        tab.dirty = true;
      }
    },
    setRunning(state, action: PayloadAction<boolean>) {
      const tab = findActive(state);
      if (tab) {
        tab.sending = action.payload;
      }
    },
    setResponse(state, action: PayloadAction<RunResponse>) {
      const tab = findActive(state);
      if (tab) {
        tab.response = action.payload;
        tab.error = null;
        tab.sending = false;
      }
    },
    setRunError(state, action: PayloadAction<RunError["error"]>) {
      const tab = findActive(state);
      if (tab) {
        tab.error = action.payload;
        tab.response = null;
        tab.sending = false;
      }
    },
    markSaved(
      state,
      action: PayloadAction<{ requestId: number; collectionId: number }>
    ) {
      const tab = findActive(state);
      if (tab) {
        tab.requestId = action.payload.requestId;
        tab.collectionId = action.payload.collectionId;
        tab.dirty = false;
      }
    },
  },
});

export const {
  openNewTab,
  openRequestInTab,
  openHistoryInTab,
  closeTab,
  setActiveTab,
  setShowHome,
  setActiveSubTab,
  updateDraft,
  setRunning,
  setResponse,
  setRunError,
  markSaved,
} = tabsSlice.actions;

export default tabsSlice.reducer;
