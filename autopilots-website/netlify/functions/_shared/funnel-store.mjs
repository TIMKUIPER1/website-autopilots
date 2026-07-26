import { getStore } from "@netlify/blobs";

const STORE_NAME = "autopilots-funnel";
const safeText = (value, max = 180) =>
  String(value ?? "")
    .trim()
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f]/g, " ")
    .slice(0, max);

export const funnelStore = () =>
  getStore({ name: STORE_NAME, consistency: "strong" });

export const safeSessionId = (value) => {
  const sessionId = safeText(value, 80);
  return /^[a-zA-Z0-9_-]{12,80}$/.test(sessionId) ? sessionId : "";
};

export const createRecordId = () =>
  `${new Date().toISOString().replace(/[:.]/g, "-")}_${crypto.randomUUID()}`;

export const saveFunnelEvent = async (event) => {
  const id = createRecordId();
  await funnelStore().setJSON(`events/${id}`, { id, ...event });
  return id;
};

export const saveLeadRecord = async (record) => {
  await funnelStore().setJSON(`leads/${record.id}`, record);
  return record;
};

export const updateLeadRecord = async (record) => {
  await funnelStore().setJSON(`leads/${record.id}`, record);
  return record;
};

export const listJSON = async (prefix, limit = 500) => {
  const store = funnelStore();
  const result = await store.list({ prefix });
  const keys = result.blobs
    .map((blob) => blob.key)
    .sort()
    .reverse()
    .slice(0, limit);
  return (
    await Promise.all(keys.map((key) => store.get(key, { type: "json" })))
  ).filter(Boolean);
};
