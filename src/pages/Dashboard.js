// src/pages/Dashboard.js
import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { fmtCurrency, getMonthKey, isOverdue } from "../utils/helpers";
import { STAGES } from "../utils/constants";

const COLORS = ["#c4715a", "#c9a84c", "#7a9e87", "#8b7db5", "#5a9ec4", "#c45a8b"];

export default function Dashboard({ events }) {
  const { studioProfile } = useAuth();

  const stats = useMemo(() => {
    const total = events.length;
    const active = events.filter((e) => e.stage < 7).length;
    const completed = events.filter((e) => e.stage === 7).length;
    const overdue = events.filter(isOverdue).length;
    const totalRevenue = events.reduce((s, e) => s + (e.amountTotal || 0), 0);
    const collected = events.reduce((s, e) => s + (e.amountPaid || 0), 0);
    const pending = totalRevenue - collected;

    // Monthly revenue
    const monthMap = {};
    events.forEach((e) => {
      const mk = getMonthKey(e.date);
      if (!mk) return;
      if (!monthMap[mk]) monthMap[mk] = { month: mk, revenue: 0, bookings: 0 };
      monthMap[mk].revenue += e.amountTotal || 0;
      monthMap[mk].bookings += 1;
    });
    const monthly = Object.values(monthMap).slice(-6);

    // By event type
    const typeMap = {};
    events.forEach((e) => {
      typeMap[e.type] = (typeMap[e.type] || 0) + 1;
    });
    const byType = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

    // Stage distribution
    const stageMap = {};
    events.forEach((e) => {
      const s = STAGES[e.stage]?.name || "Unknown";
      stageMap[s] = (stageMap[s] || 0) + 1;
    });

    return { total, active, completed, overdue, totalRevenue, collected, pending, monthly, byType };
  }, [events]);

  return (
    <div style={s.page}>
      <h2 style={s.heading}>Good day, {studioProfile?.ownerName?.split(" ")[0]} 👋</h2>
      <p style={s.sub}>{studioProfile?.studioName} · Overview</p>

      {/* KPI Cards */}
      <div style={s.kpiGrid}>
        <KPI label="Total Bookings" value={stats.total} icon="📋" />
        <KPI label="Active Events" value={stats.active} icon="⚡" color="#c9a84c" />
        <KPI label="Overdue" value={stats.overdue} icon="⚠️" color={stats.overdue ? "#c4715a" : "#7a9e87"} />
        <KPI label="Completed" value={stats.completed} icon="✅" color="#7a9e87" />
        <KPI label="Total Revenue" value={fmtCurrency(stats.totalRevenue)} icon="💰" color="#7a9e87" />
        <KPI label="Collected" value={fmtCurrency(stats.collected)} icon="✓" color="#7a9e87" />
        <KPI label="Pending Payment" value={fmtCurrency(stats.pending)} icon="⏳" color={stats.pending ? "#c4715a" : "#7a9e87"} />
      </div>

      <div style={s.chartsRow}>
        {/* Monthly Revenue */}
        <div style={s.chartCard}>
          <h3 style={s.chartTitle}>Monthly Revenue (₹)</h3>
          {stats.monthly.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.monthly}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => fmtCurrency(v)} />
                <Bar dataKey="revenue" fill="#c4715a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Event Type Pie */}
        <div style={s.chartCard}>
          <h3 style={s.chartTitle}>Bookings by Type</h3>
          {stats.byType.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stats.byType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {stats.byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Upcoming + Overdue */}
      <div style={s.chartsRow}>
        <div style={s.chartCard}>
          <h3 style={s.chartTitle}>⚠️ Needs Attention</h3>
          {events.filter(isOverdue).length === 0
            ? <p style={{ color: "#7a9e87", fontSize: 13 }}>All events are on track 🎉</p>
            : events.filter(isOverdue).map((e) => (
              <div key={e.id} style={s.attentionRow}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{e.client}</div>
                  <div style={{ fontSize: 12, color: "#8a7e75" }}>{STAGES[e.stage]?.name}</div>
                </div>
                <div style={{ color: "#c4715a", fontSize: 12, fontWeight: 600 }}>OVERDUE</div>
              </div>
            ))}
        </div>

        <div style={s.chartCard}>
          <h3 style={s.chartTitle}>💰 Pending Payments</h3>
          {events.filter((e) => (e.amountTotal || 0) > (e.amountPaid || 0)).length === 0
            ? <p style={{ color: "#7a9e87", fontSize: 13 }}>No pending payments 🎉</p>
            : events.filter((e) => (e.amountTotal || 0) > (e.amountPaid || 0)).slice(0, 5).map((e) => (
              <div key={e.id} style={s.attentionRow}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{e.client}</div>
                  <div style={{ fontSize: 12, color: "#8a7e75" }}>{e.type}</div>
                </div>
                <div style={{ color: "#c4715a", fontSize: 13, fontWeight: 600 }}>
                  {fmtCurrency((e.amountTotal || 0) - (e.amountPaid || 0))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, icon, color = "#1a1410" }) {
  return (
    <div style={s.kpiCard}>
      <div style={s.kpiIcon}>{icon}</div>
      <div style={{ ...s.kpiValue, color }}>{value}</div>
      <div style={s.kpiLabel}>{label}</div>
    </div>
  );
}

function Empty() {
  return <p style={{ color: "#8a7e75", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No data yet</p>;
}

const s = {
  page: { padding: "28px 32px", maxWidth: 1100 },
  heading: { fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, margin: 0 },
  sub: { fontSize: 13, color: "#8a7e75", marginBottom: 24 },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 24 },
  kpiCard: { background: "#fff", border: "1px solid #e5ddd5", borderRadius: 12, padding: "16px 14px", textAlign: "center" },
  kpiIcon: { fontSize: 22, marginBottom: 6 },
  kpiValue: { fontSize: 20, fontWeight: 700, marginBottom: 2 },
  kpiLabel: { fontSize: 11, color: "#8a7e75", fontWeight: 500 },
  chartsRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 },
  chartCard: { background: "#fff", border: "1px solid #e5ddd5", borderRadius: 12, padding: "18px 20px" },
  chartTitle: { fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, marginBottom: 14 },
  attentionRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0e8e0" },
};
