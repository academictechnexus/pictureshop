// src/pages/Settings.js
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { STAFF_ROLES } from "../utils/constants";
import PackageManager from "../components/PackageManager";
import toast from "react-hot-toast";

export default function Settings() {
  const { studioProfile, updateStudioProfile, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [form, setForm] = useState({
    studioName: studioProfile?.studioName || "",
    ownerName: studioProfile?.ownerName || "",
    phone: studioProfile?.phone || "",
    upiId: studioProfile?.upiId || "",
    googleReviewLink: studioProfile?.googleReviewLink || "",
    instagramHandle: studioProfile?.instagramHandle || "",
  });
  const [newStaff, setNewStaff] = useState({ name: "", role: STAFF_ROLES[0] });
  const staff = studioProfile?.staff || [];

  const saveProfile = async () => {
    await updateStudioProfile(form);
    toast.success("Profile saved!");
  };

  const addStaff = async () => {
    if (!newStaff.name) return;
    const entry = `${newStaff.name} (${newStaff.role})`;
    if (staff.includes(entry)) { toast.error("Already added"); return; }
    await updateStudioProfile({ staff: [...staff, entry] });
    setNewStaff({ name: "", role: STAFF_ROLES[0] });
    toast.success("Staff added");
  };

  const removeStaff = async (name) => {
    await updateStudioProfile({ staff: staff.filter((s) => s !== name) });
  };

  return (
    <div style={s.page}>
      <h2 style={s.heading}>Settings</h2>

      <Section title="Studio Profile">
        <div style={s.grid2}>
          <F label="Studio Name" value={form.studioName} onChange={(v) => setForm((f) => ({ ...f, studioName: v }))} />
          <F label="Owner Name" value={form.ownerName} onChange={(v) => setForm((f) => ({ ...f, ownerName: v }))} />
          <F label="Studio Phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
          <F label="UPI ID" value={form.upiId} onChange={(v) => setForm((f) => ({ ...f, upiId: v }))} />
          <F label="Google Review Link" value={form.googleReviewLink} onChange={(v) => setForm((f) => ({ ...f, googleReviewLink: v }))} />
          <F label="Instagram Handle" placeholder="@yourstudio" value={form.instagramHandle} onChange={(v) => setForm((f) => ({ ...f, instagramHandle: v }))} />
        </div>
        <button style={s.btnPrimary} onClick={saveProfile}>Save Profile</button>
      </Section>

      <Section title="Packages">
        <PackageManager />
      </Section>

      <Section title="Staff / Team">
        <div style={s.staffList}>
          {staff.length === 0 && <p style={s.muted}>No staff added yet</p>}
          {staff.map((name) => (
            <div key={name} style={s.staffRow}>
              <span>👤 {name}</span>
              <button style={s.removeBtn} onClick={() => removeStaff(name)}>✕</button>
            </div>
          ))}
        </div>
        <div style={s.addRow}>
          <input placeholder="Full name" value={newStaff.name}
            onChange={(e) => setNewStaff((f) => ({ ...f, name: e.target.value }))} style={s.input} />
          <select value={newStaff.role}
            onChange={(e) => setNewStaff((f) => ({ ...f, role: e.target.value }))} style={s.select}>
            {STAFF_ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
          <button style={s.btnSage} onClick={addStaff}>＋ Add</button>
        </div>
      </Section>

      <Section title="Appearance">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 13 }}>Dark Mode</span>
          <button onClick={toggle} style={{ ...s.btnPrimary, background: dark ? "#c9a84c" : "#1a1410", padding: "6px 16px" }}>
            {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </Section>

      <Section title="Account">
        <p style={s.muted}>Signed in as: <b>{studioProfile?.email}</b></p>
        <button style={{ ...s.btnPrimary, background: "#8a7e75", marginTop: 12 }} onClick={logout}>Sign Out</button>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 22px", marginBottom: 20 }}>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, marginBottom: 16, color: "var(--ink)" }}>{title}</h3>
      {children}
    </div>
  );
}

function F({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{label}</label>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "9px 11px", border: "1px solid var(--border)", borderRadius: 7, fontSize: 13, background: "var(--bg)", color: "var(--ink)", boxSizing: "border-box", outline: "none" }} />
    </div>
  );
}

const s = {
  page: { padding: "28px 32px", maxWidth: 760, overflowY: "auto" },
  heading: { fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, marginBottom: 24, color: "var(--ink)" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 },
  btnPrimary: { padding: "9px 20px", background: "#c4715a", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  btnSage: { padding: "9px 14px", background: "#7a9e87", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" },
  staffList: { marginBottom: 12 },
  staffRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "var(--bg)", borderRadius: 8, marginBottom: 6, fontSize: 13, color: "var(--ink)" },
  removeBtn: { background: "none", border: "none", cursor: "pointer", color: "#c4715a", fontSize: 14 },
  addRow: { display: "flex", gap: 8 },
  input: { flex: 1, padding: "9px 11px", border: "1px solid var(--border)", borderRadius: 7, fontSize: 13, background: "var(--bg)", color: "var(--ink)", outline: "none" },
  select: { padding: "9px 11px", border: "1px solid var(--border)", borderRadius: 7, fontSize: 13, background: "var(--bg)", color: "var(--ink)" },
  muted: { fontSize: 13, color: "var(--muted)" },
};
