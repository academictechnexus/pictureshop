// src/pages/AuthPage.js
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ email: "", password: "", studioName: "", ownerName: "" });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
        toast.success("Welcome back!");
      } else {
        if (!form.studioName || !form.ownerName) { toast.error("Please fill all fields"); setLoading(false); return; }
        await register(form.email, form.password, form.studioName, form.ownerName);
        toast.success("Studio created! Welcome 🎉");
      }
    } catch (err) {
      toast.error(err.message.replace("Firebase: ", "").replace(/ \(auth.*\)/, ""));
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>📷</div>
        <h1 style={styles.brand}>FramedForever</h1>
        <p style={styles.sub}>Wedding Studio Management</p>

        <div style={styles.tabs}>
          <button style={{ ...styles.tab, ...(mode === "login" ? styles.tabActive : {}) }} onClick={() => setMode("login")}>Sign In</button>
          <button style={{ ...styles.tab, ...(mode === "register" ? styles.tabActive : {}) }} onClick={() => setMode("register")}>New Studio</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === "register" && (
            <>
              <Field label="Studio Name" placeholder="e.g. Golden Frame Studio" value={form.studioName} onChange={set("studioName")} />
              <Field label="Your Name" placeholder="Owner / Photographer name" value={form.ownerName} onChange={set("ownerName")} />
            </>
          )}
          <Field label="Email" type="email" placeholder="you@studio.com" value={form.email} onChange={set("email")} />
          <Field label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} />
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Studio →"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, type = "text", placeholder, value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={styles.label}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        required style={styles.input} />
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #1a1410 0%, #2d2218 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  card: { background: "#faf7f2", borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 400, textAlign: "center" },
  logo: { fontSize: 44, marginBottom: 8 },
  brand: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#1a1410", margin: 0 },
  sub: { fontSize: 13, color: "#8a7e75", marginTop: 4, marginBottom: 28 },
  tabs: { display: "flex", background: "#f0e8e0", borderRadius: 8, padding: 3, marginBottom: 24 },
  tab: { flex: 1, padding: "8px 0", border: "none", borderRadius: 6, background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#8a7e75", transition: "all 0.2s" },
  tabActive: { background: "#fff", color: "#1a1410", fontWeight: 600, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" },
  form: { textAlign: "left" },
  label: { display: "block", fontSize: 11, fontWeight: 600, color: "#8a7e75", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #e5ddd5", borderRadius: 8, fontSize: 14, background: "#fff", color: "#1a1410", outline: "none", boxSizing: "border-box" },
  btn: { width: "100%", padding: "12px", background: "#c4715a", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 8 },
};
