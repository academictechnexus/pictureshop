// src/components/FileChecklist.js
import React from "react";

const DEFAULT_ITEMS = [
  { id: "raw_import",    label: "RAW files imported to system" },
  { id: "backup_hdd1",   label: "Backup to HDD 1" },
  { id: "backup_hdd2",   label: "Backup to HDD 2 (or cloud)" },
  { id: "cull_done",     label: "Photo culling complete" },
  { id: "color_grade",   label: "Color grading done" },
  { id: "reels_export",  label: "Reels / highlights exported" },
  { id: "gallery_upload",label: "Gallery uploaded to sharing link" },
  { id: "selects_done",  label: "Client selections received" },
  { id: "edit_done",     label: "Final editing complete" },
  { id: "watermark",     label: "Watermarks removed from finals" },
  { id: "final_export",  label: "Final files exported & named" },
  { id: "final_upload",  label: "Final gallery uploaded & link sent" },
  { id: "invoice_sent",  label: "Invoice sent to client" },
  { id: "payment_recv",  label: "Full payment received" },
  { id: "archive",       label: "Project archived (6+ months backup)" },
];

export default function FileChecklist({ checklist = {}, onChange }) {
  const toggle = (id) => {
    onChange({ ...checklist, [id]: !checklist[id] });
  };

  const done = DEFAULT_ITEMS.filter((i) => checklist[i.id]).length;
  const pct = Math.round((done / DEFAULT_ITEMS.length) * 100);

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={s.title}>📁 File Checklist</span>
        <span style={s.progress}>{done}/{DEFAULT_ITEMS.length} · {pct}%</span>
      </div>
      <div style={s.bar}><div style={{ ...s.barFill, width: `${pct}%` }} /></div>
      <div style={s.list}>
        {DEFAULT_ITEMS.map((item) => (
          <label key={item.id} style={s.item}>
            <input type="checkbox" checked={!!checklist[item.id]} onChange={() => toggle(item.id)} style={{ accentColor: "#7a9e87" }} />
            <span style={{ ...s.label, ...(checklist[item.id] ? s.labelDone : {}) }}>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

const s = {
  wrap: { background: "#fff", border: "1px solid #e5ddd5", borderRadius: 10, padding: "14px 16px", marginTop: 20 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 600 },
  progress: { fontSize: 12, color: "#7a9e87", fontWeight: 600 },
  bar: { height: 4, background: "#e5ddd5", borderRadius: 2, overflow: "hidden", marginBottom: 12 },
  barFill: { height: "100%", background: "linear-gradient(90deg, #7a9e87, #c9a84c)", borderRadius: 2, transition: "width 0.3s" },
  list: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 },
  item: { display: "flex", alignItems: "center", gap: 7, padding: "5px 4px", cursor: "pointer", borderRadius: 5 },
  label: { fontSize: 12, color: "#1a1410" },
  labelDone: { color: "#8a7e75", textDecoration: "line-through" },
};
