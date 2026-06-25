// src/hooks/useEvents.js
import { useState, useEffect } from "react";
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

export function useEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "studios", user.uid, "events"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const addEvent = async (data) => {
    if (!user) return;
    const ref = collection(db, "studios", user.uid, "events");
    await addDoc(ref, {
      ...data,
      stage: 0,
      stageEnteredAt: new Date().toISOString(),
      followupCount: 0,
      amountTotal: Number(data.amountTotal) || 0,
      amountPaid: Number(data.amountPaid) || 0,
      staff: data.staff || [],
      galleryLink: "",
      finalLink: "",
      notes: "",
      log: [{ ts: new Date().toISOString(), msg: "Booking created" }],
      createdAt: serverTimestamp(),
    });
  };

  const updateEvent = async (id, data) => {
    if (!user) return;
    await updateDoc(doc(db, "studios", user.uid, "events", id), data);
  };

  const deleteEvent = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, "studios", user.uid, "events", id));
  };

  const advanceStage = async (event) => {
    if (event.stage >= 7) return;
    const newStage = event.stage + 1;
    const { STAGES } = require("../utils/constants");
    const log = [
      ...(event.log || []),
      { ts: new Date().toISOString(), msg: `Moved to: ${STAGES[newStage].name}` },
    ];
    await updateEvent(event.id, {
      stage: newStage,
      stageEnteredAt: new Date().toISOString(),
      log,
    });
  };

  const logAction = async (event, msg) => {
    const log = [...(event.log || []), { ts: new Date().toISOString(), msg }];
    await updateEvent(event.id, { log });
  };

  return { events, loading, addEvent, updateEvent, deleteEvent, advanceStage, logAction };
}
