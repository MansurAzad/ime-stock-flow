import { beforeEach, describe, expect, it, vi } from "vitest";
import { enqueueOp, getQueue, isNetworkFailure, replayQueue } from "./offline";
const { insert } = vi.hoisted(() => ({ insert: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ insert }), rpc: vi.fn() } }));

describe("offline queue", () => {
  beforeEach(() => {
    window.localStorage.clear();
    insert.mockReset();
  });

  it("stores entries in order with timestamps", () => {
    enqueueOp({ kind: "deposit", payload: { salesman_id: "s1", amount: 500, note: null } });
    enqueueOp({ kind: "retailer_payment", payload: { retailer_id: "r1", amount: 200 } });
    const q = getQueue();
    expect(q).toHaveLength(2);
    expect(q[0]?.op.kind).toBe("deposit");
    expect(q[1]?.op.kind).toBe("retailer_payment");
    expect(q[0]?.createdAt).toBeTruthy();
  });

  it("survives a reload (reads back from local storage)", () => {
    enqueueOp({ kind: "add_retailer", payload: { name: "Test", phone: "", address: "", salesman_id: "s1" } });
    // Simulate a fresh page load: module state is irrelevant, storage is the source.
    const raw = window.localStorage.getItem("offline-queue-v1");
    expect(raw).toBeTruthy();
    if (!raw) throw new Error("Queue was not saved");
    const parsed = JSON.parse(raw);
    expect(parsed[0].op.payload.name).toBe("Test");
  });

  it("detects network failures, not server rejections", () => {
    expect(isNetworkFailure(new Error("Failed to fetch"), false)).toBe(true);
    expect(isNetworkFailure({ message: "Network request failed" }, false)).toBe(true);
    expect(isNetworkFailure({ message: "insufficient stock" }, false)).toBe(false);
    expect(isNetworkFailure({ message: "admin only" }, false)).toBe(false);
    // Anything is treated as network failure when the browser says it is offline.
    expect(isNetworkFailure({ message: "admin only" }, true)).toBe(true);
  });
  it("manual sync and reconnect share one replay and retain entries queued during replay", async () => {
    let finish: ((value: { error: null }) => void) | undefined;
    insert.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    enqueueOp({ kind: "deposit", payload: { salesman_id: "s1", amount: 500, note: null } });
    const first = replayQueue();
    const second = replayQueue();
    expect(first).toBe(second);
    enqueueOp({ kind: "deposit", payload: { salesman_id: "s1", amount: 200, note: null } });
    if (!finish) throw new Error("Replay did not start");
    finish({ error: null });
    await first;
    expect(insert).toHaveBeenCalledTimes(1);
    expect(getQueue()).toHaveLength(1);
    expect(getQueue()[0]?.op.payload).toEqual({ salesman_id: "s1", amount: 200, note: null });
  });
});
