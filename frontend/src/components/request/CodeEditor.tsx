"use client";

import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

interface Props {
  value: string;
  onChange?: (value: string) => void;
  language?: "json" | "javascript" | "text";
  readOnly?: boolean;
  height?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = "json",
  readOnly = false,
  height = "100%",
}: Props) {
  const extensions = language === "json" ? [json()] : [];
  return (
    <CodeMirror
      value={value}
      height={height}
      theme={vscodeDark}
      extensions={extensions}
      readOnly={readOnly}
      onChange={(val) => onChange?.(val)}
      basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: !readOnly }}
    />
  );
}
