// src/pages/CalendarView.js
import React, { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval,
         isSameDay, parseISO, addMonths, subMonths } from "date-fns";
import { STAGES } from "../utils/constants";

const STAGE_COLORS = ["#8b7db5","#c9a84c","#5a9ec4","#c4715a","#e07060","#c4715a","#7a9e87","#1a1410"];

export default function CalendarView({ events, onSelectEvent }) {
  const [current, setCurrent] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(current);
    const end = endOfMonth(current);
    return eachDayOfInterval({ start, end });
  }, [current]);

  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      if (!ev.date) return;
      try {
        const key = format(parseISO(ev.date), "yyyy-MM-dd");
        if (!map[key]) map[key] = [];
        map[key].push(ev);
      } catch {}
    });
    return map;
  }, [events]);

  const startDow = days[0]?.getDay() || 0;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.navBtn} onClick={() => setCurrent(subMonths(current, 1))}>‹</button>
        <h2 style={s.monthLabel}>{format(current, "MMMM yyyy")}</h2>
        <button style={s.navBtn} onClick={() => setCurrent(addMonths(current, 1))}>›</button>
      </div>

      <div style={s.grid}>
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <div key={d} style={s.dowLabel}>{d}</div>
        ))}
        {Array(startDow).fill(null).map((_, i) => <div key={`e${i}`} />)}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay[key] || [];
          const isToday = isSameDay(day, new Date());
          return (
            <div key={key} style={{ ...s.day, ...(isToday ? s.today : {}) }}>
              <div style={{ ...s.dayNum, ...(isToday ? s.todayNum : {}) }}>{format(day, "d")}</div>
              {dayEvents.slice(0, 3).map((ev) => (
                <div key={ev.id} style={{ ...s.eventChip, background: STAGE_COLORS[ev.stage] }}
                  onClick={() => onSelectEvent(ev)} title={ev.client}>
                  {ev.client.split(" ")[0]}
                </div>
              ))}
              {dayEvents.length > 3 && <div style={s.more}>+{dayEvents.length - 3}</div>}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={s.legend}>
        {STAGES.map((st, i) => (
          <div key={i} style={s.legendItem}>
            <div style={{ ...s.legendDot, background: STAGE_COLORS[i] }} />
            <span>{st.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  page: { padding: "24px 32px" },
  header: { display: "flex", alignItems: "center", gap: 16, marginBottom: 20 },
  monthLabel: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, flex: 1, textAlign: "center" },
  navBtn: { background: "#fff", border: "1px solid #e5ddd5", borderRadius: 8, padding: "6px 16px", cursor: "pointer", fontSize: 18, color: "#1a1410" },
  grid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, background: "#e5ddd5", borderRadius: 12, overflow: "hidden" },
  dowLabel: { background: "#1a1410", color: "#c9a84c", textAlign: "center", padding: "8px 0", fontSize: 11, fontWeight: 700, letterSpacing: "0.5px" },
  day: { background: "#faf7f2", minHeight: 90, padding: "6px 8px" },
  today: { background: "#fff8f0", outline: "2px solid #c4715a" },
  dayNum: { fontSize: 12, fontWeight: 500, color: "#8a7e75", marginBottom: 4 },
  todayNum: { color: "#c4715a", fontWeight: 700 },
  eventChip: { fontSize: 10, color: "#fff", padding: "2px 5px", borderRadius: 3, marginBottom: 2, cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  more: { fontSize: 10, color: "#8a7e75", marginTop: 1 },
  legend: { display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16 },
  legendItem: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#8a7e75" },
  legendDot: { width: 10, height: 10, borderRadius: "50%" },
};
