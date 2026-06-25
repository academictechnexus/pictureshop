// src/utils/constants.js

export const STAGES = [
  { id: 0, name: "Booked",             icon: "📅", desc: "Event confirmed & scheduled.",                    slaDays: null },
  { id: 1, name: "Event Completed",    icon: "🎉", desc: "Shoot done. Upload files.",                       slaDays: 3    },
  { id: 2, name: "Backup Created",     icon: "💾", desc: "All files backed up safely.",                     slaDays: 1    },
  { id: 3, name: "Gallery Link Sent",  icon: "🔗", desc: "Gallery link sent to client for review.",         slaDays: 2    },
  { id: 4, name: "Awaiting Selection", icon: "👀", desc: "Waiting for client to choose photos.",            slaDays: 7    },
  { id: 5, name: "Editing",            icon: "✏️",  desc: "Editing selected (or auto-selected) photos.",    slaDays: 5    },
  { id: 6, name: "Final Delivered",    icon: "📬", desc: "Final edited photos delivered to client.",        slaDays: 2    },
  { id: 7, name: "Payment Received",   icon: "💰", desc: "Payment collected. Project complete!",            slaDays: null },
];

export const EVENT_TYPES = [
  "Wedding", "Engagement", "Reception", "Pre-Wedding Shoot",
  "Birthday", "Baby Shower", "Corporate", "Other",
];

export const PAYMENT_STATUS = {
  UNPAID: "unpaid",
  PARTIAL: "partial",
  PAID: "paid",
};

export const STAFF_ROLES = ["Lead Photographer", "Second Photographer", "Videographer", "Editor", "Assistant"];
