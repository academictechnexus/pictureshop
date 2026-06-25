// src/components/Sidebar.js
import React, { useState } from "react";
import { STAGES, EVENT_TYPES } from "../utils/constants";
import { fmtDate, isOverdue } from "../utils/helpers";

const STAGE_BADGE = ["#e8e0d8","#fde9d4","#fdf3d4","#d4e8f0","#fde9e9","#fde9d4","#e4efe7","#1a1410"];
const STAGE_TEXT  = ["#6b5c50","#a05a1a","#8a7010","#1a6a8a","#a01a1a","#a05a1a","#2a6a3a","#faf7f2"];

export default function Sidebar({ events, selectedId, onSelect, onAdd }) {
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client: "", date: "", type: "Wedding", phone: "", email: "", venue: "", amountTotal: "", amountPaid: "" });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.client || !form.date) { alert("Client name and date are required"); return; }
    await onAdd(form);
    setForm({ client: "", date: "", type: "Wedding", phone: "", email: "", venue: "", amountTotal: "", amountPaid: "" });
    setShowForm(false);
  };

  const filtered = events.filter((ev) => {
    if (filter === "active") return ev.stage < 7;
    if (filter === "overdue") return isOverdue(ev);
    if (filter === "done") return ev.stage === 7;
    return true;
  });

  return (
    <aside style={s.aside}>
      {/* Top */}
      <div style={s.top}>
        <button style={s.addBtn} onClick={() => setShowForm((v) => !v)}>
          {showForm ? "✕ Cancel" : "＋ New Booking"}
        </button>
      </div>

      {/* Booking Form */}
      {showForm && (
        <div style={s.form}>
          <F label="Client Name *" placeholder="Priya & Arjun" value={form.client} onChange={set("client")} />
          <F label="Event Date *" type="date" value={form.date} onChange={set("date")} />
          <div style={s.fGroup}>
            <label style={s.fLabel}>Event Type</label>
            <select style={s.fInput} value={form.type} onChange={set("type")}>
              {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <F label="Phone / WhatsApp" placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")} />
          <F label="Email" type="email" value={form.email} onChange={set("email")} />
          <F label="Venue" value={form.venue} onChange={set("venue")} />
          <F label="Package Total (₹)" type="number" value={form.amountTotal} onChange={set("amountTotal")} />
          <F label="Advance Paid (₹)" type="number" value={form.amountPaid} onChange={set("amountPaid")} />
          <button style={s.submitBtn} onClick={submit}>Book Event</button>
        </div>
      )}

      {/* Filters */}
      <div style={s.filterBar}>
        {["all","active","overdue","done"].map((f) => (
          <button key={f} style={{ ...s.filterBtn, ...(filter === f ? s.filterActive : {}) }} onClick={() => setFilter(f)}>
            {f === "overdue" ? "⚠ Overdue" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={s.list}>
        {filtered.length === 0 && <div style={s.empty}>No events found</div>}
        {filtered.map((ev) => {
          const od = isOverdue(ev);
          return (
            <div key={ev.id} style={{ ...s.item, ...(selectedId === ev.id ? s.itemActive : {}) }} onClick={() => onSelect(ev.id)}>
              {od && <div style={s.odDot} />}
              <div style={s.itemName}>{ev.client}</div>
              <div style={s.itemMeta}>{fmtDate(ev.date)} · {ev.type}</div>
              <div style={{ ...s.badge, background: STAGE_BADGE[ev.stage], color: STAGE_TEXT[ev.stage] }}>
                {STAGES[ev.stage]?.icon} {STAGES[ev.stage]?.name}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function F({ label, type = "text", placeholder, value, onChange }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#8a7e75", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        style={{ width: "100%", padding: "7px 9px", border: "1px solid #e5ddd5", borderRadius: 6, fontSize: 12, background: "#fff", boxSizing: "border-box", outline: "none" }} />
    </div>
  );
}

const s = {
  aside: { width: 270, background: "#fff", borderRight: "1px solid #e5ddd5", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" },
  top: { padding: "14px 14px 10px" },
  addBtn: { width: "100%", padding: "10px", background: "#c4715a", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  form: { padding: "0 14px 14px", borderBottom: "1px solid #e5ddd5", background: "#faf7f2", maxHeight: 420, overflowY: "auto" },
  fGroup: { marginBottom: 10 },
  fLabel: { display: "block", fontSize: 10, fontWeight: 600, color: "#8a7e75", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 },
  fInput: { width: "100%", padding: "7px 9px", border: "1px solid #e5ddd5", borderRadius: 6, fontSize: 12, background: "#fff", boxSizing: "border-box" },
  submitBtn: { width: "100%", padding: 10, background: "#1a1410", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 4 },
  filterBar: { display: "flex", flexWrap: "wrap", gap: 4, padding: "10px 14px", borderBottom: "1px solid #e5ddd5" },
  filterBtn: { padding: "3px 10px", border: "1px solid #e5ddd5", borderRadius: 20, fontSize: 11, cursor: "pointer", background: "#fff", color: "#8a7e75" },
  filterActive: { background: "#1a1410", color: "#fff", borderColor: "#1a1410" },
  list: { flex: 1, overflowY: "auto" },
  item: { padding: "12px 14px", borderBottom: "1px solid #f5f0ea", cursor: "pointer", position: "relative" },
  itemActive: { background: "#fff5f2", borderLeft: "3px solid #c4715a" },
  itemName: { fontWeight: 600, fontSize: 13, marginBottom: 2 },
  itemMeta: { fontSize: 11, color: "#8a7e75", marginBottom: 5 },
  badge: { display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600 },
  odDot: { position: "absolute", top: 12, right: 12, width: 7, height: 7, borderRadius: "50%", background: "#c4715a" },
  empty: { padding: 20, textAlign: "center", fontSize: 12, color: "#8a7e75" },
};
