// src/utils/helpers.js
import { format, differenceInDays, parseISO, isToday, isTomorrow, isPast } from "date-fns";

export const fmtDate = (dateStr) => {
  if (!dateStr) return "—";
  try { return format(parseISO(dateStr), "d MMM yyyy"); } catch { return dateStr; }
};

export const fmtDateShort = (dateStr) => {
  if (!dateStr) return "—";
  try { return format(parseISO(dateStr), "d MMM"); } catch { return dateStr; }
};

export const fmtCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);

export const daysInStage = (stageEnteredAt) => {
  if (!stageEnteredAt) return 0;
  try { return differenceInDays(new Date(), parseISO(stageEnteredAt)); } catch { return 0; }
};

export const isOverdue = (event) => {
  const { STAGES } = require("./constants");
  const stage = STAGES[event.stage];
  if (!stage || !stage.slaDays || event.stage === 7) return false;
  return daysInStage(event.stageEnteredAt) > stage.slaDays;
};

export const firstName = (name) => (name || "").split(" ")[0].split("&")[0].trim();

export const whatsappLink = (phone, message) => {
  const cleaned = (phone || "").replace(/\D/g, "");
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${encoded}`;
};

export const dateLabel = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return "Today";
    if (isTomorrow(d)) return "Tomorrow";
    if (isPast(d)) return "Past";
    return fmtDate(dateStr);
  } catch { return dateStr; }
};

export const getMonthKey = (dateStr) => {
  if (!dateStr) return "";
  try { return format(parseISO(dateStr), "MMM yyyy"); } catch { return ""; }
};
