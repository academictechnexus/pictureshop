// src/components/MessageModal.js
import React, { useState } from "react";
import { whatsappLink } from "../utils/helpers";
import toast from "react-hot-toast";

export default function MessageModal({ event, msgType, msgText, title, onClose, onMarkSent }) {
  const [edited, setEdited] = useState(msgText);

  const copyMsg = () => {
    navigator.clipboard.writeText(edited);
    toast.success("Copied to clipboard!");
  };

  const waLink = whatsappLink(event?.phone, edited);

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.header}>
          <h3 style={s.title}>{title}</h3>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>
        <p style={s.sub}>For: {event?.client} · {event?.type}</p>

        <textarea
          style={s.msgArea}
          value={edited}
          onChange={(e) => setEdited(e.target.value)}
          rows={12}
        />

        <div style={s.actions}>
          <button style={s.btnOutline} onClick={copyMsg}>📋 Copy</button>
          {event?.phone && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" style={s.btnWa}>
              <span>💬</span> Open in WhatsApp
            </a>
          )}
          <button style={s.btnPrimary} onClick={() => { onMarkSent(); onClose(); }}>
            ✓ Mark as Sent
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  modal: { background: "#fff", borderRadius: 14, padding: 28, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, margin: 0 },
  closeBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#8a7e75", lineHeight: 1 },
  sub: { fontSize: 12, color: "#8a7e75", marginBottom: 14 },
  msgArea: { width: "100%", padding: 14, border: "1px solid #e5ddd5", borderRadius: 8, fontSize: 13, lineHeight: 1.7, fontFamily: "'Inter', sans-serif", resize: "vertical", background: "#faf7f2", boxSizing: "border-box", outline: "none" },
  actions: { display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap", justifyContent: "flex-end" },
  btnOutline: { padding: "9px 16px", border: "1px solid #e5ddd5", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 },
  btnWa: { padding: "9px 16px", background: "#25D366", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 },
  btnPrimary: { padding: "9px 18px", background: "#c4715a", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" },
};
