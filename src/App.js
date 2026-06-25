// src/App.js — v2 with all 8 new features wired in
import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider, useTheme, themeStyles } from "./contexts/ThemeContext";
import { useEvents } from "./hooks/useEvents";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import CalendarView from "./pages/CalendarView";
import Settings from "./pages/Settings";
import Leads from "./pages/Leads";
import Sidebar from "./components/Sidebar";
import EventDetail from "./components/EventDetail";
import FileChecklist from "./components/FileChecklist";
import toast from "react-hot-toast";
import { exportToExcel } from "./utils/exportExcel";
import { generateInvoice } from "./utils/invoicePdf";
import { MESSAGES } from "./utils/messages";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <style>{themeStyles}</style>
        <Toaster position="bottom-right" toastOptions={{ style: { background: "#1a1410", color: "#faf7f2", fontSize: 13 } }} />
        <Inner />
      </AuthProvider>
    </ThemeProvider>
  );
}

function Inner() {
  const { user } = useAuth();
  if (!user) return <AuthPage />;
  return <Studio />;
}

function Studio() {
  const { events, loading, addEvent, updateEvent, deleteEvent, advanceStage, logAction } = useEvents();
  const [view, setView] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const { studioProfile } = useAuth();
  const { dark, toggle: toggleDark } = useTheme();

  // PWA install prompt
  const [installPrompt, setInstallPrompt] = useState(null);
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").catch(() => {});
    }
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then(() => setInstallPrompt(null));
  };

  const selectedEvent = events.find((e) => e.id === selectedId) || null;

  const handleAddEvent = async (form) => {
    await addEvent(form);
    toast.success(`Booked: ${form.client}`);
  };

  const handleDelete = async (id) => {
    await deleteEvent(id);
    setSelectedId(null);
    toast.success("Event deleted");
  };

  const handleAdvance = async (event) => {
    await advanceStage(event);
    // Auto-send review request message hint after final delivery
    if (event.stage === 6) {
      toast("📬 Final delivered! Don't forget to request a review.", { duration: 4000 });
    } else {
      toast.success("Stage updated ✓");
    }
  };

  const handleChecklistChange = async (checklist) => {
    if (!selectedEvent) return;
    await updateEvent(selectedEvent.id, { checklist });
  };

  const handleLeadConvert = (leadData) => {
    setView("events");
    // Pre-fill sidebar with lead data — pass via state
    window._convertLead = leadData;
    toast("Switch to Events tab and click + New Booking — fields pre-filled!", { duration: 5000 });
  };

  const handleExportExcel = () => {
    exportToExcel(events, studioProfile?.studioName);
    toast.success("Exporting Excel...");
  };

  const handleInvoice = async (event) => {
    await generateInvoice(event, studioProfile);
    toast.success("Invoice downloaded!");
  };

  const overdueCount = events.filter((e) => {
    const { isOverdue } = require("./utils/helpers");
    return isOverdue(e);
  }).length;

  const reviewMsg = (ev) => MESSAGES.reviewRequest
    ? MESSAGES.reviewRequest(ev, studioProfile?.studioName)
    : `Hi ${ev?.client?.split(" ")[0]}! Thank you for choosing us for your ${ev?.type}. We'd love to hear your feedback — could you spare a minute to leave us a Google review? 🙏 [Your Google Review Link]`;

  const NAV_ITEMS = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "events",    icon: "📋", label: "Events" },
    { id: "calendar",  icon: "🗓️",  label: "Calendar" },
    { id: "leads",     icon: "🔍", label: "Leads" },
    { id: "settings",  icon: "⚙️",  label: "Settings" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navBrand}>
          <span style={{ fontSize: 20 }}>📷</span>
          <span style={s.navTitle}>FramedForever</span>
          <span style={s.navStudio}>{studioProfile?.studioName}</span>
        </div>

        <div style={s.navLinks}>
          {NAV_ITEMS.map((item) => (
            <button key={item.id} style={{ ...s.navBtn, ...(view === item.id ? s.navBtnActive : {}) }}
              onClick={() => setView(item.id)}>
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        <div style={s.navRight}>
          {overdueCount > 0 && (
            <div style={s.overdueBadge} onClick={() => setView("events")}>
              ⚠ {overdueCount}
            </div>
          )}
          <button style={s.iconBtn} onClick={handleExportExcel} title="Export to Excel">📥</button>
          <button style={s.iconBtn} onClick={toggleDark} title="Toggle dark mode">{dark ? "☀️" : "🌙"}</button>
          {installPrompt && (
            <button style={{ ...s.iconBtn, background: "rgba(201,168,76,0.2)", color: "#c9a84c", borderRadius: 6, padding: "4px 10px", fontSize: 11 }}
              onClick={installApp}>📲 Install App</button>
          )}
        </div>
      </nav>

      {/* BODY */}
      <div style={s.body}>
        {loading && <div style={s.loading}>Loading...</div>}

        {!loading && view === "dashboard" && <Dashboard events={events} />}

        {!loading && view === "events" && (
          <div style={s.eventsLayout}>
            <Sidebar events={events} selectedId={selectedId} onSelect={setSelectedId} onAdd={handleAddEvent} />
            <div style={s.detailPanel}>
              <EventDetail
                event={selectedEvent}
                onUpdate={updateEvent}
                onAdvance={handleAdvance}
                onDelete={handleDelete}
                onLog={logAction}
                onInvoice={handleInvoice}
                onReviewMsg={(ev) => {
                  navigator.clipboard.writeText(reviewMsg(ev));
                  toast.success("Review request copied!");
                }}
              />
              {selectedEvent && (
                <div style={{ padding: "0 28px 28px" }}>
                  <FileChecklist
                    checklist={selectedEvent.checklist || {}}
                    onChange={handleChecklistChange}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && view === "calendar" && (
          <CalendarView events={events} onSelectEvent={(ev) => { setSelectedId(ev.id); setView("events"); }} />
        )}

        {!loading && view === "leads" && (
          <Leads onConvertToBooking={handleLeadConvert} />
        )}

        {!loading && view === "settings" && <Settings />}
      </div>
    </div>
  );
}

const s = {
  nav: { background: "var(--nav)", display: "flex", alignItems: "center", padding: "0 20px", height: 54, gap: 16, flexShrink: 0 },
  navBrand: { display: "flex", alignItems: "center", gap: 8, marginRight: 4 },
  navTitle: { fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: "#faf7f2", whiteSpace: "nowrap" },
  navStudio: { fontSize: 10, color: "#c9a84c", background: "rgba(201,168,76,0.15)", padding: "2px 8px", borderRadius: 20, fontWeight: 500 },
  navLinks: { display: "flex", gap: 2, flex: 1 },
  navBtn: { padding: "5px 12px", background: "transparent", border: "none", borderRadius: 7, color: "#a09080", cursor: "pointer", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" },
  navBtnActive: { background: "rgba(196,113,90,0.2)", color: "#c4715a" },
  navRight: { display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" },
  overdueBadge: { background: "#c4715a", color: "#fff", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer" },
  iconBtn: { background: "transparent", border: "none", cursor: "pointer", fontSize: 16, padding: "4px", borderRadius: 6, color: "#a09080" },
  body: { flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", background: "var(--bg)" },
  loading: { display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--muted)", fontSize: 14 },
  eventsLayout: { display: "flex", flex: 1, overflow: "hidden" },
  detailPanel: { flex: 1, overflow: "auto" },
};
