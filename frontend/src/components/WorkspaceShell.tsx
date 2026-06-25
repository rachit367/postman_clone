"use client";

import { useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { fetchCollections } from "@/store/slices/collectionsSlice";
import { fetchEnvironments } from "@/store/slices/environmentsSlice";
import { fetchHistory } from "@/store/slices/historySlice";
import { fetchWorkspaces } from "@/store/slices/workspacesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { Modals } from "./Modals";
import { RequestBuilder } from "./request/RequestBuilder";
import { Sidebar } from "./sidebar/Sidebar";
import { TabBar } from "./request/TabBar";
import { Toasts } from "./Toasts";
import { TopBar } from "./TopBar";
import { WorkspaceHome } from "./WorkspaceHome";
import styles from "./workspace.module.css";

export function WorkspaceShell() {
  const dispatch = useAppDispatch();
  const showHome = useAppSelector((s) => s.tabs.showHome);
  const selectedId = useAppSelector((s) => s.workspaces.selectedId);

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  useEffect(() => {
    if (selectedId) {
      dispatch(fetchCollections(selectedId));
      dispatch(fetchEnvironments(selectedId));
      dispatch(fetchHistory(selectedId));
    }
  }, [dispatch, selectedId]);

  return (
    <div className={styles.shell}>
      <TopBar />
      <div className={styles.body}>
        <PanelGroup direction="horizontal">
          <Panel defaultSize={22} minSize={15} maxSize={40}>
            <Sidebar />
          </Panel>
          <PanelResizeHandle className={styles.resizeX} />
          <Panel>
            <div className={styles.main}>
              <TabBar />
              {showHome ? <WorkspaceHome /> : <RequestBuilder />}
            </div>
          </Panel>
        </PanelGroup>
      </div>
      <Modals />
      <Toasts />
    </div>
  );
}
