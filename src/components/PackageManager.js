// src/components/PackageManager.js
// Used in Settings page to define packages, and in booking form to pick one

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { fmtCurrency } from "../utils/helpers";
import toast from "react-hot-toast";

export default function PackageManager() {
  const { studioProfile, updateStudioProfile } = useAuth();
  const packages = studioProfile?.packages || [];
  const [form, setForm] = useState({ name: "", price: "", includes: "", description: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const addPackage = async () => {
    if (!form.name || !form.price) { toast.error("Name and price required"); return; }
    const pkg = { id: Date.now(), name: form.name, price: Number(form.price), includes: form.includes, description: form.description };
    await updateStudioProfile({ packages: [...packages, pkg] });
    setForm({ name: "", price: "", includes: "", description: "" });
    toast.success("Package added!");
  };

  const removePackage = async (id) => {
    await updateStudioProfile({ packages: packages.filter((p) => p.id !== id) });
  };

  return (
    <div>
      {/* Existing packages */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 18 }}>
        {packages.length === 0 && <p style={{ fontSize: 13, color: "#8a7e75" }}>No packages yet. Add one below.</p>}
        {packages.map((pkg) => (
          <div key={pkg.id} style={s.pkgCard}>
            <div style={s.pkgName}>{pkg.name}</div>
            <div style={s.pkgPrice}>{fmtCurrency(pkg.price)}</div>
            {pkg.includes && <div style={s.pkgIncludes}>✓ {pkg.includes.split(",").join("\n✓ ")}</div>}
            {pkg.description && <div style={s.pkgDesc}>{pkg.description}</div>}
            <button style={s.removeBtn} onClick={() => removePackage(pkg.id)}>✕ Remove</button>
          </div>
        ))}
      </div>

      {/* Add form */}
      <div style={s.addForm}>
        <h4 style={s.addTitle}>Add Package</h4>
        <div style={s.grid2}>
          <F label="Package Name" placeholder="e.g. Gold" value={form.name} onChange={set("name")} />
          <F label="Price (₹)" type="number" placeholder="50000" value={form.price} onChange={set("price")} />
          <F label="What's Included (comma separated)" placeholder="2 photographers, full day, drone, reels" value={form.includes} onChange={set("includes")} span />
          <F label="Short Description" placeholder="Best for large weddings" value={form.description} onChange={set("description")} span />
        </div>
        <button style={s.btn} onClick={addPackage}>＋ Add Package</button>
      </div>
    </div>
  );
}

function F({ label, type = "text", placeholder, value, onChange, span }) {
  return (
    <div style={{ gridColumn: span ? "1/-1" : undefined }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#8a7e75", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5ddd5", borderRadius: 7, fontSize: 13, background: "#faf7f2", boxSizing: "border-box", outline: "none" }} />
    </div>
  );
}

const s = {
  pkgCard: { background: "#faf7f2", border: "1px solid #e5ddd5", borderRadius: 10, padding: "14px 16px", position: "relative" },
  pkgName: { fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, marginBottom: 4 },
  pkgPrice: { fontSize: 20, fontWeight: 700, color: "#c4715a", marginBottom: 8 },
  pkgIncludes: { fontSize: 11, color: "#7a9e87", whiteSpace: "pre", lineHeight: 1.8, marginBottom: 6 },
  pkgDesc: { fontSize: 12, color: "#8a7e75", fontStyle: "italic" },
  removeBtn: { marginTop: 10, background: "none", border: "none", color: "#c4715a", fontSize: 11, cursor: "pointer", padding: 0 },
  addForm: { background: "#fff", border: "1px solid #e5ddd5", borderRadius: 10, padding: "16px 18px" },
  addTitle: { fontSize: 13, fontWeight: 600, marginBottom: 12 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 },
  btn: { padding: "8px 18px", background: "#c4715a", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" },
};
