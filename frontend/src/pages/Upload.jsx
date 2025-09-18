import React, { useCallback, useMemo, useState, useEffect } from "react";
import { FaMagic } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const UNCATEGORIZED = "Uncategorized";

const toObjectURL = async (file) => URL.createObjectURL(file);

const Upload = () => {
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const displayName = user?.firstName || "Anonymous";

  const [folders, setFolders] = useState([UNCATEGORIZED]);
  const [activeFolder, setActiveFolder] = useState(UNCATEGORIZED);
  const [docs, setDocs] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const [newFolder, setNewFolder] = useState("");
  const [renameFolderId, setRenameFolderId] = useState("");
  const [renameFolderNew, setRenameFolderNew] = useState("");

  const [previewDoc, setPreviewDoc] = useState(null);

  const navigate = useNavigate();
  const handleAiAppRedirect = () => navigate("/ai");
  const handleCreateNotes = () => navigate("/notes");

  useEffect(() => {
    if (!isLoaded) return;
    const fetchUploads = async () => {
      try {
        const qs = userId
          ? `?clerkUserId=${encodeURIComponent(userId)}`
          : `?userName=${encodeURIComponent(displayName)}`;
        const res = await fetch(`${API_BASE}/api/uploads${qs}`);
        if (!res.ok) return;
        const items = await res.json();
        const normalized = await Promise.all(
          items.map(async (it) => ({
            id: it._id,
            name: it.title,
            size: it.size || 0,
            folder: it.folder || UNCATEGORIZED,
            url: it.url || "",
            type: it.type || "",
          }))
        );
        setDocs(normalized);
        const unique = new Set([
          UNCATEGORIZED,
          ...normalized.map((d) => d.folder),
        ]);
        setFolders(Array.from(unique));
      } catch (e) {
        console.error("Fetch uploads error:", e);
      }
    };
    fetchUploads();
  }, [isLoaded, userId, displayName]);

  const sortedFolders = useMemo(() => {
    const rest = folders
      .filter((f) => f !== UNCATEGORIZED)
      .sort((a, b) => a.localeCompare(b));
    return [UNCATEGORIZED, ...rest];
  }, [folders]);

  const docsInActive = useMemo(
    () => docs.filter((d) => d.folder === activeFolder),
    [docs, activeFolder]
  );

  const countsByFolder = useMemo(() => {
    const map = new Map(sortedFolders.map((f) => [f, 0]));
    for (const d of docs) map.set(d.folder, (map.get(d.folder) || 0) + 1);
    return map;
  }, [docs, sortedFolders]);

  const ingestFiles = useCallback(
    async (fileList, targetFolder) => {
      const incoming = Array.from(fileList || []);
      if (!incoming.length) return;

      const newDocs = [];
      for (const f of incoming) {
        const url = await toObjectURL(f);
        const draft = {
          id: `${f.name}-${f.size}-${crypto.randomUUID()}`,
          name: f.name,
          size: f.size,
          folder: targetFolder || UNCATEGORIZED,
          url,
          type: f.type,
        };
        newDocs.push(draft);

        try {
          if (!isLoaded) continue;
          const payload = {
            userName: displayName,
            clerkUserId: userId || undefined,
            title: f.name,
            folder: draft.folder,
            size: f.size,
            type: f.type,
            url: "", // keep empty since object URLs are local; replace with CDN URL when available
            createdAtLocal: new Date().toLocaleString(),
          };
          const res = await fetch(`${API_BASE}/api/uploads`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const saved = await res.json();
            draft.id = saved._id;
            if (!folders.includes(draft.folder))
              setFolders((f) => [...f, draft.folder]);
          }
        } catch (e) {
          console.error("Persist upload metadata error:", e);
        }
      }
      setDocs((prev) => [...prev, ...newDocs]);
    },
    [API_BASE, displayName, userId, isLoaded, folders]
  );

  const onInput = (e) => ingestFiles(e.target.files, activeFolder);

  const onDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    await ingestFiles(e.dataTransfer?.files, activeFolder);
  };
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const createFolder = () => {
    const name = newFolder.trim();
    if (!name || name === UNCATEGORIZED) return;
    if (folders.some((f) => f.toLowerCase() === name.toLowerCase())) return;
    setFolders((f) => [...f, name]);
    setActiveFolder(name);
    setNewFolder("");
  };
  const startRename = (name) => {
    if (name === UNCATEGORIZED) return;
    setRenameFolderId(name);
    setRenameFolderNew(name);
  };
  const applyRename = () => {
    const from = renameFolderId;
    const to = renameFolderNew.trim();
    if (!from || !to || to === UNCATEGORIZED) return;
    if (folders.some((f) => f.toLowerCase() === to.toLowerCase())) return;
    setFolders((f) => f.map((x) => (x === from ? to : x)));
    setDocs((prev) =>
      prev.map((d) => (d.folder === from ? { ...d, folder: to } : d))
    );
    if (activeFolder === from) setActiveFolder(to);
    setRenameFolderId("");
    setRenameFolderNew("");
  };
  const cancelRename = () => {
    setRenameFolderId("");
    setRenameFolderNew("");
  };
  const deleteFolder = (name) => {
    if (name === UNCATEGORIZED) return;
    setFolders((f) => f.filter((x) => x !== name));
    setDocs((prev) =>
      prev.map((d) => (d.folder === name ? { ...d, folder: UNCATEGORIZED } : d))
    );
    if (activeFolder === name) setActiveFolder(UNCATEGORIZED);
  };
  const removeDoc = async (docOrId) => {
    const id =
      typeof docOrId === "string" ? docOrId : docOrId._id || docOrId.id;
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE}/api/uploads/${id}`, {
        method: "DELETE",
      });
      if (res.ok || res.status === 204) {
        setDocs((prev) => prev.filter((d) => (d._id || d.id) !== id));
        if (previewDoc && (previewDoc._id === id || previewDoc.id === id))
          setPreviewDoc(null);
      } else {
        const text = await res.text();
        console.error("Delete failed:", res.status, text);
        alert("Could not delete document.");
      }
    } catch (e) {
      console.error("Delete request error:", e);
      alert("Network error while deleting.");
    }
  };

  return (
    <div className="upload layout">
      <header className="upload-head">
        <div>
          <h1 className="h2">Documents</h1>
          <p className="sub small">
            Drag files or choose from device. Organize into folders; anything
            unassigned goes to “{UNCATEGORIZED}”.
          </p>
        </div>
        <div className="upload-actions">
          <button
            className="btn ghost"
            onClick={() => document.getElementById("file-input").click()}
          >
            Choose files
          </button>
          <button
            className="btn ghost"
            onClick={handleCreateNotes}
            title="Create topic notes"
          >
            + Create notes
          </button>
          <button
            className="btn primary"
            onClick={handleAiAppRedirect}
            title="Open LearnSphere AI"
          >
            <FaMagic style={{ marginRight: ".5rem" }} aria-hidden="true" />
            LearnSphere AI
          </button>
          <input
            id="file-input"
            type="file"
            multiple
            onChange={onInput}
            style={{ display: "none" }}
          />
        </div>
      </header>

      <div className="upload-body">
        <aside className="upload-side">
          <div className="about-card">
            <div className="side-head">
              <h3 className="t3">Folders</h3>
            </div>

            <div className="new-folder">
              <input
                className="input"
                placeholder="New folder"
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createFolder()}
              />
              <button className="btn ghost small" onClick={createFolder}>
                Add
              </button>
            </div>

            <ul className="folder-list">
              {sortedFolders.map((name) => {
                const selected = name === activeFolder;
                const count = countsByFolder.get(name) || 0;
                return (
                  <li
                    key={name}
                    className={`folder-tile ${selected ? "selected" : ""}`}
                  >
                    {renameFolderId === name ? (
                      <div className="rename-row">
                        <input
                          className="input"
                          value={renameFolderNew}
                          onChange={(e) => setRenameFolderNew(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") applyRename();
                            if (e.key === "Escape") cancelRename();
                          }}
                          autoFocus
                        />
                        <button
                          className="btn primary small"
                          onClick={applyRename}
                        >
                          Save
                        </button>
                        <button
                          className="btn ghost small"
                          onClick={cancelRename}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="folder-btn"
                        onClick={() => setActiveFolder(name)}
                      >
                        <span className="mono">{name}</span>
                        <span className="badge">{count}</span>
                      </button>
                    )}

                    {name !== UNCATEGORIZED && renameFolderId !== name && (
                      <div className="folder-actions">
                        <button
                          className="btn ghost small"
                          onClick={() => startRename(name)}
                        >
                          Rename
                        </button>
                        <button
                          className="btn ghost small"
                          onClick={() => deleteFolder(name)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div
            role="button"
            tabIndex={0}
            className={`dropzone compact ${dragOver ? "over" : ""}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                document.getElementById("file-input").click();
              }
            }}
            aria-label={`Upload to ${activeFolder}`}
          >
            <div className="dz-title">Upload to</div>
            <div className="dz-meta">
              <strong>{activeFolder}</strong>
            </div>
          </div>
        </aside>

        <main className="upload-main">
          <div className="about-card">
            <div className="main-head">
              <h3 className="t3">{activeFolder}</h3>
              <div className="muted small">{docsInActive.length} file(s)</div>
            </div>

            {docsInActive.length === 0 ? (
              <p className="p muted">No documents in this folder yet.</p>
            ) : (
              <ul className="doc-grid">
                {docsInActive.map((d) => (
                  <li key={d.id} className="doc-card">
                    <button
                      className="doc-body"
                      onClick={() => setPreviewDoc(d)}
                      title="Open preview"
                    >
                      <div className="doc-name mono">{d.name}</div>
                      <div className="doc-meta muted small">
                        {(d.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </button>
                    <div className="doc-actions">
                      <button
                        className="btn ghost small"
                        onClick={() => removeDoc(d._id || d.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>

        <aside
          className={`upload-preview ${previewDoc ? "open" : ""}`}
          aria-hidden={!previewDoc}
        >
          <div className="about-card preview-card">
            <div className="preview-head">
              <h4 className="t3">{previewDoc?.name || "Preview"}</h4>
              <button
                className="btn ghost small"
                onClick={() => setPreviewDoc(null)}
              >
                Close
              </button>
            </div>

            {!previewDoc ? (
              <p className="p muted">Select a document to preview.</p>
            ) : (
              <div className="iframe-wrap">
                <iframe
                  title={previewDoc.name}
                  src={previewDoc.url}
                  className="doc-iframe"
                />
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Upload;
