// src/pages/Leads.js
import React, { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { fmtDate } from "../utils/helpers";
import { EVENT_TYPES } from "../utils/constants";
import toast from "react-hot-toast";

const STATUS = ["New", "Contacted", "Quoted", "Negotiating", "Won", "Lost"];
const STATUS_COLOR = {
  New: ["#e8f4fd","#1a6a8a"],
  Contacted: ["#fdf3d4","#8a7010"],
  Quoted: ["#fde9d4","#a05a1a"],
  Negotiating: ["#e8e0f8","#5a3a8a"],
  Won: ["#e4efe7","#2a6a3a"],
  Lost: ["#f5e8e8","#8a2a2a"],
};

export default function Leads({ onConvertToBooking }) {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", eventType: "Wedding", eventDate: "", venue: "", budget: "", source: "Instagram", notes: "", status: "New" });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "studios", user.uid, "leads"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => setLeads(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
  }, [user]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const addLead = async () => {
    if (!form.name) { toast.error("Name is required"); return; }
    await addDoc(collection(db, "studios", user.uid, "leads"), { ...form, createdAt: serverTimestamp(), log: [{ ts: new Date().toISOString(), msg: "Lead created" }] });
    setForm({ name: "", phone: "", email: "", eventType: "Wedding", eventDate: "", venue: "", budget: "", source: "Instagram", notes: "", status: "New" });
    setShowForm(false);
    toast.success("Lead added!");
  };

  const updateLead = async (id, data) => {
    await updateDoc(doc(db, "studios", user.uid, "leads", id), data);
  };

  const deleteLead = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    await deleteDoc(doc(db, "studios", user.uid, "leads", id));
    setSelected(null);
    toast.success("Lead deleted");
  };

  const convertToBooking = (lead) => {
    onConvertToBooking({ client: lead.name, phone: lead.phone, email: lead.email, type: lead.eventType, date: lead.eventDate, venue: lead.venue, notes: lead.notes });
    toast.success("Converted to booking! Fill in the details.");
  };

  const byStatus = STATUS.map((s) => ({ status: s, items: leads.filter((l) => l.status === s) }));

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h2 style={s.heading}>Leads & Enquiries</h2>
          <p style={s.sub}>{leads.length} total · {leads.filter((l) => l.status === "Won").length} converted</p>
        </div>
        <button style={s.btnPrimary} onClick={() => setShowForm((v) => !v)}>{showForm ? "✕ Cancel" : "＋ New Lead"}</button>
      </div>

      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>New Enquiry</h3>
          <div style={s.formGrid}>
            <F label="Name *" value={form.name} onChange={set("name")} />
            <F label="Phone" value={form.phone} onChange={set("phone")} />
            <F label="Email" value={form.email} onChange={set("email")} type="email" />
            <div>
              <label style={s.fLabel}>Event Type</label>
              <select style={s.fInput} value={form.eventType} onChange={set("eventType")}>
                {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <F label="Event Date" value={form.eventDate} onChange={set("eventDate")} type="date" />
            <F label="Venue / Location" value={form.venue} onChange={set("venue")} />
            <F label="Budget (₹)" value={form.budget} onChange={set("budget")} type="number" />
            <div>
              <label style={s.fLabel}>Source</label>
              <select style={s.fInput} value={form.source} onChange={set("source")}>
                {["Instagram","Facebook","WhatsApp","Referral","Google","Website","Walk-in","Other"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={s.fLabel}>Notes</label>
              <textarea style={{ ...s.fInput, height: 60, resize: "vertical" }} value={form.notes} onChange={set("notes")} />
            </div>
          </div>
          <button style={s.btnPrimary} onClick={addLead}>Save Lead</button>
        </div>
      )}

      {/* Kanban */}
      <div style={s.kanban}>
        {byStatus.map(({ status, items }) => {
          const [bg, color] = STATUS_COLOR[status];
          return (
            <div key={status} style={s.column}>
              <div style={{ ...s.colHeader, background: bg, color }}>
                {status} <span style={s.count}>{items.length}</span>
              </div>
              {items.map((lead) => (
                <div key={lead.id} style={{ ...s.leadCard, ...(selected?.id === lead.id ? s.leadCardActive : {}) }}
                  onClick={() => setSelected(selected?.id === lead.id ? null : lead)}>
                  <div style={s.leadName}>{lead.name}</div>
                  <div style={s.leadMeta}>{lead.eventType} · {fmtDate(lead.eventDate) || "Date TBD"}</div>
                  {lead.phone && <div style={s.leadMeta}>📱 {lead.phone}</div>}
                  {lead.budget && <div style={s.leadMeta}>💰 ₹{Number(lead.budget).toLocaleString("en-IN")}</div>}
                  <div style={s.sourcePill}>{lead.source}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div style={s.drawer}>
          <div style={s.drawerHeader}>
            <h3 style={s.drawerTitle}>{selected.name}</h3>
            <button style={s.closeBtn} onClick={() => setSelected(null)}>✕</button>
          </div>
          <div style={s.drawerBody}>
            <Row label="Event" value={`${selected.eventType} · ${fmtDate(selected.eventDate) || "TBD"}`} />
            <Row label="Phone" value={selected.phone} />
            <Row label="Email" value={selected.email} />
            <Row label="Venue" value={selected.venue} />
            <Row label="Budget" value={selected.budget ? `₹${Number(selected.budget).toLocaleString("en-IN")}` : "—"} />
            <Row label="Source" value={selected.source} />
            {selected.notes && <Row label="Notes" value={selected.notes} />}

            <div style={{ marginTop: 14 }}>
              <label style={s.fLabel}>Update Status</label>
              <select style={s.fInput} value={selected.status}
                onChange={(e) => { updateLead(selected.id, { status: e.target.value }); setSelected((l) => ({ ...l, status: e.target.value })); }}>
                {STATUS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div style={s.drawerActions}>
              {selected.phone && (
                <a href={`https://wa.me/${selected.phone.replace(/\D/g,"")}?text=Hi ${selected.name.split(" ")[0]}! This is regarding your ${selected.eventType} enquiry.`}
                  target="_blank" rel="noopener noreferrer" style={s.btnWa}>💬 WhatsApp</a>
              )}
              <button style={s.btnSage} onClick={() => convertToBooking(selected)}>🎉 Convert to Booking</button>
              <button style={s.btnDanger} onClick={() => deleteLead(selected.id)}>🗑 Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#8a7e75", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{label}</label>
      <input type={type} value={value || ""} onChange={onChange}
        style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5ddd5", borderRadius: 7, fontSize: 13, background: "#fff", boxSizing: "border-box", outline: "none" }} />
    </div>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: "#8a7e75", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
      <div style={{ fontSize: 13, color: "#1a1410", marginTop: 2 }}>{value}</div>
    </div>
  );
}

const s = {
  page: { padding: "24px 28px", flex: 1, overflow: "auto", position: "relative" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  heading: { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, margin: 0 },
  sub: { fontSize: 12, color: "#8a7e75", marginTop: 2 },
  btnPrimary: { padding: "9px 18px", background: "#c4715a", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  btnSage: { padding: "8px 14px", background: "#7a9e87", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" },
  btnWa: { padding: "8px 14px", background: "#25D366", color: "#fff", borderRadius: 7, fontSize: 12, fontWeight: 600, textDecoration: "none" },
  btnDanger: { padding: "8px 14px", background: "transparent", color: "#c4715a", border: "1px solid #c4715a", borderRadius: 7, fontSize: 12, cursor: "pointer" },
  formCard: { background: "#fff", border: "1px solid #e5ddd5", borderRadius: 12, padding: "20px 22px", marginBottom: 20 },
  formTitle: { fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, marginBottom: 14 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 },
  fLabel: { display: "block", fontSize: 10, fontWeight: 600, color: "#8a7e75", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 },
  fInput: { width: "100%", padding: "8px 10px", border: "1px solid #e5ddd5", borderRadius: 7, fontSize: 13, background: "#fff", boxSizing: "border-box", outline: "none" },
  kanban: { display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12 },
  column: { minWidth: 200, flex: "0 0 200px" },
  colHeader: { padding: "6px 12px", borderRadius: "8px 8px 0 0", fontSize: 12, fontWeight: 700, display: "flex", justifyContent: "space-between" },
  count: { background: "rgba(0,0,0,0.12)", borderRadius: 20, padding: "1px 7px", fontSize: 11 },
  leadCard: { background: "#fff", border: "1px solid #e5ddd5", borderRadius: "0 0 8px 8px", padding: "10px 12px", marginBottom: 6, cursor: "pointer", transition: "box-shadow 0.15s" },
  leadCardActive: { boxShadow: "0 0 0 2px #c4715a" },
  leadName: { fontWeight: 600, fontSize: 13, marginBottom: 3 },
  leadMeta: { fontSize: 11, color: "#8a7e75", marginBottom: 2 },
  sourcePill: { display: "inline-block", background: "#f5f0ea", color: "#8a7e75", borderRadius: 20, padding: "1px 8px", fontSize: 10, marginTop: 4 },
  drawer: { position: "fixed", right: 0, top: 56, bottom: 0, width: 320, background: "#fff", borderLeft: "1px solid #e5ddd5", zIndex: 50, overflowY: "auto", boxShadow: "-4px 0 20px rgba(0,0,0,0.08)" },
  drawerHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", borderBottom: "1px solid #e5ddd5" },
  drawerTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700 },
  closeBtn: { background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#8a7e75" },
  drawerBody: { padding: "16px 20px" },
  drawerActions: { display: "flex", flexDirection: "column", gap: 8, marginTop: 20 },
};
