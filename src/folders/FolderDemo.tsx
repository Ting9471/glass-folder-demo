"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowCounterClockwiseIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import GlassFolder, { type FolderFile } from "../components/ui/glass-folder-cards";
import "./folder-demo.css";

const ARCHIVE_FILES: FolderFile[] = [
  { name: "Lookbook 2024", meta: "38 images", art: "dusk" },
  { name: "Invoices", meta: "12 PDFs" },
  { name: "Shoot - Lisbon", meta: "RAW · 2.1 GB", art: "ember" },
  { name: "Contract.pdf", meta: "PDF · 320 KB" },
];
const DARK_FILES: FolderFile[] = [
  { name: "Stills", meta: "64 images", art: "verdant" },
  { name: "Edit notes", meta: "TXT · 4 KB" },
  { name: "Grade v3", meta: "DRX · 18 MB", art: "aurora" },
];

type Modal = "rename" | "trash" | null;

export default function FolderDemo() {
  const deskRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [width, setWidth] = useState(340);
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [version, setVersion] = useState(0);
  const [archiveVersion, setArchiveVersion] = useState(0);
  const [archiveLabel, setArchiveLabel] = useState("Archives");
  const [archiveFiles, setArchiveFiles] = useState(ARCHIVE_FILES);
  const [rename, setRename] = useState("Archives");
  const [modal, setModal] = useState<Modal>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.title = "Glass Folder Cards | 动效复刻";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "磨砂玻璃文件夹交互动效演示。悬停翻折、点击展开、新文件落入与程序生成彩色纹理。");
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setDark(media.matches);
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const desk = deskRef.current;
    if (!desk) return;
    const measure = () => setWidth(Math.min(340, Math.max(160, desk.getBoundingClientRect().width - 40)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(desk);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (modal && dialog && !dialog.open) dialog.showModal();
    if (!modal && dialog?.open) {
      dialog.close();
      const frame = requestAnimationFrame(() => {
        deskRef.current?.querySelector<HTMLButtonElement>(".folder-demo-archive .gf-key")?.focus({ preventScroll: true });
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [modal]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3600);
    return () => window.clearTimeout(timer);
  }, [message]);

  function replay() {
    setModal(null);
    setArchiveLabel("Archives");
    setArchiveFiles(ARCHIVE_FILES);
    setArchiveVersion(0);
    setMessage("");
    setVersion((value) => value + 1);
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      const local = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
      setMessage(local ? "已复制演示页地址（本机预览地址）。" : "已复制分享链接，可以发给其他人直接体验。");
    } catch {
      setMessage("无法访问剪贴板，请从浏览器地址栏复制演示页地址。");
    }
  }

  function selectFile(file: FolderFile) {
    setMessage(`已选中 ${file.name}。这是示例卡片，不包含实际文件。`);
  }

  return (
    <main className="folder-demo" data-theme={dark ? "dark" : "light"}>
      <h1 className="folder-demo-sr-only">Glass Folder Cards 玻璃文件夹动效</h1>
      <div className="folder-demo-dots" aria-hidden="true" />
      <div className="folder-demo-tools" aria-label="演示控制">
        <button type="button" onClick={replay} title="重播入场并重置示例" aria-label="重播入场并重置示例">
          <ArrowCounterClockwiseIcon size={18} weight="regular" />
        </button>
        <button type="button" onClick={() => setDark((value) => !value)} title={dark ? "切换浅色背景" : "切换深色背景"} aria-label={dark ? "切换浅色背景" : "切换深色背景"}>
          {dark ? <SunIcon size={18} weight="regular" /> : <MoonIcon size={18} weight="regular" />}
        </button>
      </div>
      <div className="folder-demo-desk" ref={deskRef}>
        <div className="folder-demo-grid" key={version}>
          <GlassFolder width={width} label="My Files" art="aurora" seed={3} appearDelay={0} onFileSelect={selectFile} />
          <GlassFolder
            key={archiveVersion}
            className="folder-demo-archive"
            width={width}
            label={archiveLabel}
            art="none"
            action="more"
            labelPlacement="top-left"
            appearDelay={140}
            files={archiveFiles}
            onFileSelect={selectFile}
            menu={[
              { label: "Rename", onSelect: () => { setRename(archiveLabel); setModal("rename"); } },
              { label: "Share…", onSelect: () => { void share(); } },
              { label: "Move to Trash", danger: true, onSelect: () => setModal("trash") },
            ]}
          />
          <GlassFolder
            width={width}
            label="My Files"
            meta="Wed 19 Aug"
            tone="dark"
            art="ember"
            seed={11}
            action="none"
            labelPlacement="top-right"
            appearDelay={280}
            files={DARK_FILES}
            onFileSelect={selectFile}
          />
        </div>
        <p className="folder-demo-hint">
          <span className="folder-demo-hint-desktop">Hover to lean · Click to open · + to add</span>
          <span className="folder-demo-hint-touch">Tap to open · + to add</span>
        </p>
      </div>
      <div className="folder-demo-feedback" role="status" aria-live="polite" aria-atomic="true">
        {message ? <p key={message}>{message}</p> : null}
      </div>
      <dialog
        ref={dialogRef}
        className="folder-demo-dialog"
        aria-labelledby="folder-demo-dialog-title"
        onPointerDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        onCancel={() => setModal(null)}
        onClose={() => setModal(null)}
      >
        {modal === "rename" ? (
          <form onSubmit={(event) => { event.preventDefault(); if (!rename.trim()) return; setArchiveLabel(rename.trim()); setModal(null); }}>
            <h2 id="folder-demo-dialog-title">重命名文件夹</h2>
            <label htmlFor="folder-demo-name">名称</label>
            <input id="folder-demo-name" value={rename} onChange={(event) => setRename(event.target.value)} maxLength={48} required autoFocus />
            <div className="folder-demo-dialog-actions">
              <button type="button" onClick={() => setModal(null)}>取消</button>
              <button type="submit" className="folder-demo-primary" disabled={!rename.trim()}>保存</button>
            </div>
          </form>
        ) : modal === "trash" ? (
          <div>
            <h2 id="folder-demo-dialog-title">清空示例文件？</h2>
            <p>仅清空这个演示文件夹，不会删除电脑上的任何文件。右上角重播按钮可恢复示例。</p>
            <div className="folder-demo-dialog-actions">
              <button type="button" autoFocus onClick={() => setModal(null)}>取消</button>
              <button type="button" className="folder-demo-primary" onClick={() => { setArchiveFiles([]); setArchiveVersion((value) => value + 1); setModal(null); setMessage("示例文件已清空，重播可恢复。"); }}>清空</button>
            </div>
          </div>
        ) : null}
      </dialog>
    </main>
  );
}
