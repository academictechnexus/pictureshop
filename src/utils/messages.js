// src/utils/messages.js
import { fmtDate, firstName } from "./helpers";

const studio = (studioName) => studioName || "FramedForever Studio";

export const MESSAGES = {
  bookingConfirm: (ev, sName) => `Hi ${firstName(ev.client)} 😊

Your booking is confirmed with ${studio(sName)}!

📅 Event: ${ev.type}
🗓 Date: ${fmtDate(ev.date)}
📍 Venue: ${ev.venue || "As discussed"}

We're excited to capture your special day! Please reach out if you have any questions.

Warm regards,
${studio(sName)}`,

  galleryLink: (ev, sName) => `Hi ${firstName(ev.client)} 😊

Your photos from your ${ev.type} on ${fmtDate(ev.date)} are ready for viewing!

Please find your gallery here:
👉 ${ev.galleryLink || "[Insert Gallery Link]"}

Kindly browse through and let us know your selected photos within 7 days. You can reply to this message or WhatsApp us directly.

Looking forward to your feedback! 🌸

Warm regards,
${studio(sName)}`,

  followup1: (ev, sName) => `Hi ${firstName(ev.client)} 🌸

Hope you're doing wonderfully! Just a gentle reminder that your photo gallery from your ${ev.type} on ${fmtDate(ev.date)} is ready and waiting for your selections.

👉 ${ev.galleryLink || "[Gallery Link]"}

We'd love to begin editing the photos you love most — please share your picks when you get a chance!

Thank you 🙏
${studio(sName)}`,

  followup2: (ev, sName) => `Hi ${firstName(ev.client)},

This is our second reminder regarding your photo selection for the ${ev.type} on ${fmtDate(ev.date)}.

We'd love to begin editing your photos soon and deliver them to you at the earliest! Could you please review and send your selections?

👉 ${ev.galleryLink || "[Gallery Link]"}

If you need any help accessing the gallery, feel free to reach out!

${studio(sName)}`,

  followup3: (ev, sName) => `Hi ${firstName(ev.client)},

We hope all is well! We've noticed we haven't received your photo selections yet — we completely understand how busy things can get after a ${ev.type}! 💐

As we'd like to deliver your final photos at the earliest, we will proceed with our professional selection if we don't hear back within 2 days.

👉 ${ev.galleryLink || "[Gallery Link]"}

Please do reach out if you'd like to make any specific requests!

${studio(sName)}`,

  finalDelivery: (ev, sName) => `Hi ${firstName(ev.client)} 🎉

Great news — your edited photos are ready!

Your final gallery from the ${ev.type} on ${fmtDate(ev.date)} has been delivered:
👉 ${ev.finalLink || "[Insert Final Gallery Link]"}

We hope you absolutely love every frame. It was a true pleasure capturing your special day! 📸

${ev.amountDue > 0 ? `Kindly process the pending payment of ₹${ev.amountDue?.toLocaleString("en-IN")} at your earliest convenience.\n\n` : ""}With love & light,
${studio(sName)}`,

  paymentReminder: (ev, sName) => `Hi ${firstName(ev.client)},

Thank you so much for choosing ${studio(sName)} for your ${ev.type}! 📸

This is a gentle reminder that the ${ev.amountPaid > 0 ? "remaining balance" : "full payment"} of ₹${ev.amountDue?.toLocaleString("en-IN")} is pending for your package.

Payment details:
💳 [Insert UPI / Bank Details / Payment Link]

Please let us know once the payment is done so we can update our records.

Thank you! 🙏
${studio(sName)}`,

  reviewRequest: (ev, sName) => `Hi ${firstName(ev.client)} 🌟

We hope you're absolutely loving your photos from your ${ev.type}!

It was such a privilege to capture your special day. If you're happy with our work, we'd be so grateful if you could take 2 minutes to leave us a Google review — it truly helps our small studio grow 🙏

⭐ Leave a review here:
[Insert Google Review Link]

Thank you so much — it means the world to us!

With love,
${studio(sName)}`,
};
