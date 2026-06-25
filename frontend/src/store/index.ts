import { configureStore } from "@reduxjs/toolkit";

import collectionsReducer from "./slices/collectionsSlice";
import environmentsReducer from "./slices/environmentsSlice";
import historyReducer from "./slices/historySlice";
import tabsReducer from "./slices/tabsSlice";
import uiReducer from "./slices/uiSlice";
import workspacesReducer from "./slices/workspacesSlice";

export const store = configureStore({
  reducer: {
    collections: collectionsReducer,
    environments: environmentsReducer,
    history: historyReducer,
    tabs: tabsReducer,
    ui: uiReducer,
    workspaces: workspacesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
