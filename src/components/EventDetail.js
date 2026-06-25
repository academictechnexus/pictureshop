// src/components/EventDetail.js
import React, { useState } from "react";
import { STAGES, STAFF_ROLES } from "../utils/constants";
import { MESSAGES } from "../utils/messages";
import { fmtDate, fmtCurrency, daysInStage, isOverdue } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";
import MessageModal from "./MessageModal";
import toast from "react-hot-toast";

export default function EventDetail({ event, onUpdate, onAdvance, onDelete, onLog, onInvoice, onReviewMsg }) {
  const { studioProfile } = useAuth();
  const [msgModal, setMsgModal] = useState(null); // { type, title, text }
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);

  if (!event) return (
    <div style={s.empty}>
      <div style={s.emptyIcon}>💍</div>
      <p>Select an event to view its workflow</p>
    </div>
  );

  const od = isOverdue(event);
  const pct = Math.round((event.stage / (STAGES.length - 1)) * 100);
  const amountDue = (event.amountTotal || 0) - (event.amountPaid || 0);
  const sName = studioProfile?.studioName;

  const showMsg = (type, title, textFn) => {
    setMsgModal({ type, title, text: textFn(event, sName) });
  };

  const markSent = async (label) => {
    await onLog(event, `Message sent: ${label}`);
    toast.success("Logged as sent ✓");
  };

  const handleFollowUp = () => {
    const count = (event.followupCount || 0) + 1;
    if (count > 3) { toast.error("3 follow-ups already sent"); return; }
    const types = [null, "followup1", "followup2", "followup3"];
    const msgs = [null, MESSAGES.followup1, MESSAGES.followup2, MESSAGES.followup3];
    onUpdate(event.id, { followupCount: count });
    onLog(event, `Follow-up ${count} message generated`);
    setMsgModal({ type: types[count], title: `Follow-up ${count} of 3`, text: msgs[count](event, sName) });
  };

  const handleAutoSelect = async () => {
    await onLog(event, "Auto-selected photos (no client response after 3 follow-ups)");
    await onAdvance(event);
    toast.success("Proceeding with professional selection");
  };

  const startEdit = () => {
    setForm({ ...event });
    setEditing(true);
  };

  const saveEdit = async () => {
    await onUpdate(event.id, {
      client: form.client, date: form.date, type: form.type,
      phone: form.phone, email: form.email, venue: form.venue,
      amountTotal: Number(form.amountTotal) || 0,
      amountPaid: Number(form.amountPaid) || 0,
      galleryLink: form.galleryLink || "",
      finalLink: form.finalLink || "",
      notes: form.notes || "",
      staff: form.staff || [],
    });
    setEditing(false);
    toast.success("Event updated");
  };

  const toggleStaff = (name) => {
    const current = form.staff || [];
    setForm((f) => ({ ...f, staff: current.includes(name) ? current.filter((x) => x !== name) : [...current, name] }));
  };

  if (editing && form) return (
    <div style={s.page}>
      <div style={s.detailHeader}>
        <h2 style={s.detailTitle}>Edit Event</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={s.btnOutline} onClick={() => setEditing(false)}>Cancel</button>
          <button style={s.btnPrimary} onClick={saveEdit}>Save Changes</button>
        </div>
      </div>
      <div style={s.editGrid}>
        <Field label="Client Name" value={form.client} onChange={(v) => setForm((f) => ({ ...f, client: v }))} />
        <Field label="Event Date" type="date" value={form.date} onChange={(v) => setForm((f) => ({ ...f, date: v }))} />
        <Field label="Event Type" value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v }))} />
        <Field label="Phone / WhatsApp" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
        <Field label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
        <Field label="Venue" value={form.venue} onChange={(v) => setForm((f) => ({ ...f, venue: v }))} />
        <Field label="Total Package (₹)" type="number" value={form.amountTotal} onChange={(v) => setForm((f) => ({ ...f, amountTotal: v }))} />
        <Field label="Amount Paid (₹)" type="number" value={form.amountPaid} onChange={(v) => setForm((f) => ({ ...f, amountPaid: v }))} />
        <Field label="Gallery Link" value={form.galleryLink} onChange={(v) => setForm((f) => ({ ...f, galleryLink: v }))} span />
        <Field label="Final Delivery Link" value={form.finalLink} onChange={(v) => setForm((f) => ({ ...f, finalLink: v }))} span />
        <Field label="Internal Notes" value={form.notes} onChange={(v) => setForm((f) => ({ ...f, notes: v }))} textarea span />
      </div>
      <div style={{ marginTop: 20 }}>
        <label style={s.fLabel}>Assigned Staff</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
          {(studioProfile?.staff || []).map((name) => (
            <button key={name} onClick={() => toggleStaff(name)}
              style={{ ...s.staffChip, ...(form.staff?.includes(name) ? s.staffChipActive : {}) }}>
              {name}
            </button>
          ))}
          {(studioProfile?.staff || []).length === 0 && <p style={{ fontSize: 12, color: "#8a7e75" }}>Add staff in Settings first</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.detailHeader}>
        <div>
          <h2 style={s.detailTitle}>{event.client}</h2>
          <div style={s.metaRow}>
            <span>📅 {fmtDate(event.date)}</span>
            <span>🎬 {event.type}</span>
            {event.venue && <span>📍 {event.venue}</span>}
            {event.phone && <span>📱 {event.phone}</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={s.btnOutline} onClick={startEdit}>✏️ Edit</button>
          {onInvoice && <button style={{ ...s.btnOutline, color: "#c9a84c" }} onClick={() => onInvoice(event)}>🧾 Invoice</button>}
          {onReviewMsg && event.stage >= 6 && <button style={{ ...s.btnOutline, color: "#7a9e87" }} onClick={() => onReviewMsg(event)}>⭐ Review Request</button>}
          <button style={{ ...s.btnOutline, color: "#c4715a" }} onClick={() => { if (window.confirm("Delete this event?")) onDelete(event.id); }}>🗑</button>
        </div>
      </div>

      {/* Progress */}
      <div style={s.progressWrap}>
        <div style={s.progressLabel}><span>Progress</span><span style={{ fontWeight: 600 }}>{pct}%</span></div>
        <div style={s.progressBar}><div style={{ ...s.progressFill, width: `${pct}%` }} /></div>
      </div>

      {/* Info Cards */}
      <div style={s.infoGrid}>
        <InfoCard label="Package Value" value={fmtCurrency(event.amountTotal)} />
        <InfoCard label="Paid" value={fmtCurrency(event.amountPaid)} color="#7a9e87" />
        <InfoCard label="Due" value={fmtCurrency(amountDue)} color={amountDue > 0 ? "#c4715a" : "#7a9e87"} />
        <InfoCard label="Staff" value={(event.staff || []).join(", ") || "—"} />
      </div>

      {/* Gallery links */}
      {(event.galleryLink || event.finalLink) && (
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {event.galleryLink && <a href={event.galleryLink} target="_blank" rel="noopener noreferrer" style={s.linkBtn}>🔗 Gallery Link</a>}
          {event.finalLink && <a href={event.finalLink} target="_blank" rel="noopener noreferrer" style={{ ...s.linkBtn, background: "#e4efe7", color: "#2a6a3a" }}>📬 Final Link</a>}
        </div>
      )}

      {/* Workflow */}
      <h3 style={s.sectionTitle}>Workflow</h3>
      <div style={s.timeline}>
        {STAGES.map((stage, i) => {
          const done = i < event.stage;
          const active = i === event.stage;
          const dayCount = active ? daysInStage(event.stageEnteredAt) : 0;
          const stageOd = active && od;

          return (
            <div key={i} style={s.timelineRow}>
              <div style={s.dotWrap}>
                <div style={{ ...s.dot, ...(done ? s.dotDone : active ? s.dotActive : {}) }}>
                  {done ? "✓" : active ? "●" : ""}
                </div>
                {i < STAGES.length - 1 && <div style={{ ...s.line, ...(done ? s.lineDone : {}) }} />}
              </div>
              <div style={{ ...s.stepCard, ...(active ? s.stepCardActive : done ? s.stepCardDone : {}) }}>
                <div style={s.stepHead}>
                  <span style={s.stepName}>{stage.icon} {stage.name}</span>
                  {active && stage.slaDays && (
                    <span style={{ ...s.slaTag, ...(stageOd ? s.slaOd : {}) }}>
                      Day {dayCount} of {stage.slaDays}{stageOd ? " — OVERDUE" : ""}
                    </span>
                  )}
                  {done && <span style={s.doneTag}>✓ Done</span>}
                </div>
                <p style={s.stepDesc}>{stage.desc}</p>

                {active && (
                  <div style={s.stepActions}>
                    {/* Stage-specific actions */}
                    {i === 0 && (
                      <MsgBtn onClick={() => showMsg("bookingConfirm", "Booking Confirmation", MESSAGES.bookingConfirm)}>📤 Send Booking Confirmation</MsgBtn>
                    )}
                    {i === 3 && (
                      <MsgBtn onClick={() => showMsg("galleryLink", "Gallery Link Message", MESSAGES.galleryLink)}>🔗 Send Gallery Link</MsgBtn>
                    )}
                    {i === 4 && (
                      <>
                        <div style={{ fontSize: 12, color: "#8a7e75", marginBottom: 8 }}>Follow-ups sent: <b>{event.followupCount || 0}/3</b></div>
                        {(event.followupCount || 0) < 3
                          ? <MsgBtn onClick={handleFollowUp}>📨 Send Follow-up {(event.followupCount || 0) + 1}</MsgBtn>
                          : <button style={s.btnGold} onClick={handleAutoSelect}>⚡ Auto-Select & Continue</button>
                        }
                      </>
                    )}
                    {i === 6 && (
                      <MsgBtn onClick={() => showMsg("finalDelivery", "Final Delivery Message", MESSAGES.finalDelivery)}>📬 Send Final Delivery</MsgBtn>
                    )}
                    {i === 7 && amountDue > 0 && (
                      <MsgBtn onClick={() => showMsg("paymentReminder", "Payment Reminder", MESSAGES.paymentReminder)}>💳 Send Payment Reminder</MsgBtn>
                    )}

                    {i < STAGES.length - 1 && (
                      <button style={s.btnNext} onClick={() => onAdvance(event)}>→ Mark Done & Next</button>
                    )}
                    {i === STAGES.length - 1 && <span style={{ color: "#7a9e87", fontSize: 13, fontWeight: 600 }}>🎉 Project Complete!</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Log */}
      <h3 style={s.sectionTitle}>Activity Log</h3>
      <div style={s.logWrap}>
        {[...(event.log || [])].reverse().map((l, i) => (
          <div key={i} style={s.logRow}>
            <span style={s.logDot}>•</span>
            <span style={s.logTime}>{new Date(l.ts).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            <span>{l.msg}</span>
          </div>
        ))}
      </div>

      {msgModal && (
        <MessageModal
          event={event}
          title={msgModal.title}
          msgText={msgModal.text}
          onClose={() => setMsgModal(null)}
          onMarkSent={() => markSent(msgModal.title)}
        />
      )}
    </div>
  );
}

function MsgBtn({ children, onClick }) {
  return <button style={s.btnMsg} onClick={onClick}>{children}</button>;
}

function InfoCard({ label, value, color }) {
  return (
    <div style={s.infoCard}>
      <div style={s.infoLabel}>{label}</div>
      <div style={{ ...s.infoVal, color: color || "#1a1410" }}>{value}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", textarea, span }) {
  return (
    <div style={{ gridColumn: span ? "1 / -1" : undefined }}>
      <label style={s.fLabel}>{label}</label>
      {textarea
        ? <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} style={{ ...s.fInput, height: 70, resize: "vertical" }} />
        : <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} style={s.fInput} />}
    </div>
  );
}

const s = {
  page: { padding: "24px 28px", overflowY: "auto", flex: 1 },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#8a7e75", textAlign: "center" },
  emptyIcon: { fontSize: 52, marginBottom: 14, opacity: 0.3 },
  detailHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, paddingBottom: 18, borderBottom: "1px solid #e5ddd5" },
  detailTitle: { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, margin: "0 0 6px" },
  metaRow: { display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12, color: "#8a7e75" },
  progressWrap: { marginBottom: 20 },
  progressLabel: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#8a7e75", marginBottom: 6 },
  progressBar: { height: 6, background: "#e5ddd5", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #c4715a, #c9a84c)", borderRadius: 3, transition: "width 0.4s" },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 },
  infoCard: { background: "#fff", border: "1px solid #e5ddd5", borderRadius: 10, padding: "12px 14px" },
  infoLabel: { fontSize: 10, fontWeight: 600, color: "#8a7e75", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 },
  infoVal: { fontSize: 15, fontWeight: 700 },
  linkBtn: { padding: "7px 14px", background: "#fde9d4", color: "#a05a1a", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 500 },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, marginBottom: 14, marginTop: 4 },
  timeline: { marginBottom: 28 },
  timelineRow: { display: "flex", gap: 12, marginBottom: 4 },
  dotWrap: { display: "flex", flexDirection: "column", alignItems: "center", width: 28, flexShrink: 0, paddingTop: 16 },
  dot: { width: 18, height: 18, borderRadius: "50%", border: "2px solid #e5ddd5", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, zIndex: 1, flexShrink: 0 },
  dotDone: { background: "#7a9e87", borderColor: "#7a9e87", color: "#fff" },
  dotActive: { background: "#c4715a", borderColor: "#c4715a", color: "#fff", boxShadow: "0 0 0 4px rgba(196,113,90,0.2)" },
  line: { width: 2, flex: 1, background: "#e5ddd5", minHeight: 12 },
  lineDone: { background: "#7a9e87" },
  stepCard: { flex: 1, background: "#fff", border: "1px solid #e5ddd5", borderRadius: 10, padding: "14px 16px", marginBottom: 8 },
  stepCardActive: { borderColor: "#c4715a", boxShadow: "0 0 0 2px rgba(196,113,90,0.15)" },
  stepCardDone: { opacity: 0.6 },
  stepHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  stepName: { fontWeight: 600, fontSize: 14 },
  slaTag: { fontSize: 11, color: "#8a7e75", background: "#f5f0ea", padding: "2px 8px", borderRadius: 20 },
  slaOd: { color: "#c4715a", background: "#fde9e9", fontWeight: 600 },
  doneTag: { fontSize: 11, color: "#7a9e87", fontWeight: 600 },
  stepDesc: { fontSize: 12, color: "#8a7e75", marginBottom: 10 },
  stepActions: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" },
  btnMsg: { padding: "7px 14px", background: "#faf7f2", border: "1px solid #e5ddd5", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 500 },
  btnNext: { padding: "7px 14px", background: "#c4715a", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600 },
  btnGold: { padding: "7px 14px", background: "#c9a84c", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600 },
  btnPrimary: { padding: "8px 16px", background: "#c4715a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 },
  btnOutline: { padding: "8px 14px", background: "#fff", border: "1px solid #e5ddd5", borderRadius: 8, cursor: "pointer", fontSize: 13 },
  logWrap: { background: "#fff", border: "1px solid #e5ddd5", borderRadius: 10, padding: "12px 16px" },
  logRow: { display: "flex", gap: 10, fontSize: 12, color: "#8a7e75", paddingBottom: 6, marginBottom: 6, borderBottom: "1px solid #f5f0ea" },
  logDot: { color: "#c4715a", flexShrink: 0 },
  logTime: { fontWeight: 500, color: "#1a1410", flexShrink: 0 },
  editGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  fLabel: { display: "block", fontSize: 11, fontWeight: 600, color: "#8a7e75", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 },
  fInput: { width: "100%", padding: "9px 11px", border: "1px solid #e5ddd5", borderRadius: 7, fontSize: 13, background: "#faf7f2", outline: "none", boxSizing: "border-box" },
  staffChip: { padding: "5px 13px", borderRadius: 20, border: "1px solid #e5ddd5", background: "#fff", cursor: "pointer", fontSize: 12 },
  staffChipActive: { background: "#c4715a", color: "#fff", borderColor: "#c4715a" },
};
