import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Offline entry queue. Entries made without internet are stored locally and
 * replayed against the same database functions when the connection returns.
 * The database functions remain the only writers of stock/sale data — queued
 * entries are validated by them at sync time, never applied optimistically.
 */

export type QueuedOp =
  | { kind: "record_sale"; payload: { _retailer: string; _items: unknown[]; _paid: number } }
  | { kind: "return_stock"; payload: { _salesman: string; _items: unknown[] } }
  | { kind: "issue_stock"; payload: { _salesman: string; _items: unknown[] } }
  | { kind: "deposit"; payload: { salesman_id: string; amount: number; note: string | null } }
  | { kind: "retailer_payment"; payload: { retailer_id: string; amount: number } }
  | { kind: "add_retailer"; payload: { name: string; phone: string; address: string; salesman_id: string } };

export type QueueEntry = { id: string; createdAt: string; op: QueuedOp };

const QUEUE_KEY = "offline-queue-v1";
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function getQueue(): QueueEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueueEntry[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(entries: QueueEntry[]) {
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(entries));
  emit();
}

export function enqueueOp(op: QueuedOp): QueueEntry {
  const entry: QueueEntry = {
    id: `${Date.now()}-${getQueue().length}`,
    createdAt: new Date().toISOString(),
    op,
  };
  saveQueue([...getQueue(), entry]);
  return entry;
}

/** True when a failure came from the network being unavailable, not from a server-side rejection. */
export function isNetworkFailure(error: unknown, offline: boolean): boolean {
  if (offline) return true;
  const msg = String((error as { message?: string } | null)?.message ?? error ?? "").toLowerCase();
  return msg.includes("failed to fetch") || msg.includes("networkerror") || msg.includes("fetch failed") || msg.includes("network request failed");
}

/** Run one queued op against the same RPC/insert paths the online forms use. */
async function runOp(op: QueuedOp) {
  switch (op.kind) {
    case "record_sale":
    case "return_stock":
    case "issue_stock":
      return await supabase.rpc(op.kind, op.payload as never);
    case "deposit":
      return await supabase.from("deposits").insert(op.payload);
    case "retailer_payment":
      return await supabase.from("retailer_payments").insert(op.payload);
    case "add_retailer":
      return await supabase.from("retailers").insert(op.payload);
  }
}

/**
 * Execute a mutation; when the network is down, store it in the queue instead.
 * Returns "done" | "queued" | { error } so callers can toast accordingly.
 */
export type RunResult = { s: "done"; data: unknown } | { s: "queued" } | { s: "error"; error: string };

export async function runOrQueue(op: QueuedOp, offline: boolean): Promise<RunResult> {
  if (!offline) {
    const { data, error } = await runOp(op);
    if (!error) return { s: "done", data };
    if (!isNetworkFailure(error, false)) return { s: "error", error: error.message };
  }
  enqueueOp(op);
  return { s: "queued" };
}

/** Replay every queued entry in order; stop at the first server rejection so order is preserved. */
let replayInFlight: Promise<{ synced: number; failed: string | null }> | null = null;
export function replayQueue(): Promise<{ synced: number; failed: string | null }> {
  if (replayInFlight) return replayInFlight;
  replayInFlight = replayQueueOnce().finally(() => { replayInFlight = null; });
  return replayInFlight;
}
async function replayQueueOnce(): Promise<{ synced: number; failed: string | null }> {
  const entries = getQueue();
  let synced = 0;
  for (const entry of entries) {
    const { error } = await runOp(entry.op);
    if (error) {
      const completed = new Set(entries.slice(0, synced).map((e) => e.id));
      saveQueue(getQueue().filter((e) => !completed.has(e.id)));
      return { synced, failed: error.message };
    }
    synced += 1;
  }
  const completed = new Set(entries.map((e) => e.id));
  saveQueue(getQueue().filter((e) => !completed.has(e.id)));
  return { synced, failed: null };
}

/** Reactive pending-entry count for the header badge. */
export function usePendingSyncCount(): number {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => getQueue().length,
    () => 0,
  );
}

/** Reactive browser online/offline status. */
export function useOnline(): boolean {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("online", cb);
      window.addEventListener("offline", cb);
      return () => {
        window.removeEventListener("online", cb);
        window.removeEventListener("offline", cb);
      };
    },
    () => (typeof navigator === "undefined" ? true : navigator.onLine),
    () => true,
  );
}
