import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { backupSchema, recordSchema, RESET_PHRASE, RESTORE_PHRASE } from "@/lib/settings-data";

export const exportBusinessData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("export_business_data");
    if (error) throw new Error(error.message);
    return backupSchema.parse(data);
  });

export const resetBusinessData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ confirmation: z.literal(RESET_PHRASE), backupId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const result = await context.supabase.rpc("reset_business_data", { _confirmation: data.confirmation, _backup_id: data.backupId });
    if (result.error) throw new Error(result.error.message);
    return { ok: true };
  });

export const restoreBusinessData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ confirmation: z.literal(RESTORE_PHRASE), backup: backupSchema, backupId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const result = await context.supabase.rpc("restore_business_data", { _confirmation: data.confirmation, _snapshot: data.backup, _backup_id: data.backupId });
    if (result.error) throw new Error(result.error.message);
    return { ok: true };
  });

export const changeBusinessRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => recordSchema.parse(input))
  .handler(async ({ data, context }) => {
    const result = await context.supabase.rpc("manage_business_record", { _table: data.table, _id: data.id, _action: data.action, _values: data.values, _reason: data.reason });
    if (result.error) throw new Error(result.error.message);
    return { ok: true };
  });