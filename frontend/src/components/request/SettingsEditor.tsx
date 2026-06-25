"use client";

import { updateDraft } from "@/store/slices/tabsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RequestSettings } from "@/types";

import { StubBadge } from "../StubBadge";
import styles from "../workspace.module.css";

type BoolKey = {
  [K in keyof RequestSettings]: RequestSettings[K] extends boolean ? K : never;
}[keyof RequestSettings];

interface ToggleDef {
  key: BoolKey;
  label: string;
  desc: string;
  stub?: boolean;
}

const WIRED: ToggleDef[] = [
  {
    key: "ssl_verification",
    label: "Enable SSL certificate verification",
    desc: "Verify SSL certificates when sending a request.",
  },
  {
    key: "follow_redirects",
    label: "Automatically follow redirects",
    desc: "Follow HTTP 3xx responses as redirects.",
  },
  {
    key: "encode_url",
    label: "Encode URL automatically",
    desc: "Encode the URL's path, query parameters, and authentication fields.",
  },
];

const STUBS: ToggleDef[] = [
  { key: "follow_original_method", label: "Follow original HTTP Method", desc: "Redirect with the original HTTP method." },
  { key: "follow_authorization_header", label: "Follow Authorization header", desc: "Retain authorization header across hostnames." },
  { key: "remove_referer_on_redirect", label: "Remove referer header on redirect", desc: "Remove the referer header when a redirect happens." },
  { key: "strict_http_parser", label: "Enable strict HTTP parser", desc: "Restrict responses with invalid HTTP headers." },
  { key: "disable_cookie_jar", label: "Disable cookie jar", desc: "Prevent cookies from being stored in the cookie jar." },
  { key: "use_server_cipher_suite", label: "Use server cipher suite during handshake", desc: "Use the server's cipher suite order during handshake." },
];

export function SettingsEditor() {
  const dispatch = useAppDispatch();
  const tab = useAppSelector((s) => s.tabs.tabs.find((t) => t.id === s.tabs.activeTabId));

  if (!tab) {
    return null;
  }

  const settings = tab.draft.settings;
  const setSetting = (patch: Partial<RequestSettings>) =>
    dispatch(updateDraft({ settings: { ...settings, ...patch } }));

  const renderToggle = (def: ToggleDef) => (
    <div key={def.key} className={styles.settingsRow}>
      <div>
        <div className={styles.settingsLabel}>
          {def.label}
          {def.stub && <StubBadge />}
        </div>
        <div className={styles.settingsDesc}>{def.desc}</div>
      </div>
      <input
        type="checkbox"
        checked={settings[def.key]}
        disabled={def.stub}
        onChange={(e) => setSetting({ [def.key]: e.target.checked } as Partial<RequestSettings>)}
      />
    </div>
  );

  return (
    <div>
      <div className={styles.settingsRow}>
        <div>
          <div className={styles.settingsLabel}>HTTP version</div>
          <div className={styles.settingsDesc}>Select the HTTP version to use for sending the request.</div>
        </div>
        <select
          className={styles.envSelect}
          value={settings.http_version}
          onChange={(e) => setSetting({ http_version: e.target.value })}
        >
          <option value="auto">Auto</option>
          <option value="http2">HTTP/2</option>
        </select>
      </div>

      {WIRED.map(renderToggle)}

      <div className={styles.settingsRow}>
        <div>
          <div className={styles.settingsLabel}>Maximum number of redirects</div>
          <div className={styles.settingsDesc}>Set a cap on the maximum number of redirects to follow.</div>
        </div>
        <input
          type="number"
          className={styles.envSelect}
          style={{ minWidth: 80, width: 80 }}
          value={settings.max_redirects}
          onChange={(e) => setSetting({ max_redirects: Number(e.target.value) })}
        />
      </div>

      {STUBS.map((def) => renderToggle({ ...def, stub: true }))}
    </div>
  );
}
