import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const [{ data: roles }, { data: profile }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", u.user.id),
        supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
      ]);
      const isAdmin = !!roles?.some((r) => r.role === "admin");
      return { id: u.user.id, email: u.user.email, isAdmin, profile };
    },
  });
}

export function useSalesmen() {
  return useQuery({
    queryKey: ["salesmen"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "salesman");
      const ids = (roles ?? []).map((r) => r.user_id);
      if (!ids.length) return [];
      const { data } = await supabase.from("profiles").select("*").in("id", ids).order("full_name");
      return data ?? [];
    },
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
}

/** Per-product holding and account summary for a salesman. */
export function useSalesmanSummary(salesmanId: string | undefined) {
  return useQuery({
    enabled: !!salesmanId,
    queryKey: ["summary", salesmanId],
    queryFn: async () => {
      const id = salesmanId!;
      const [moves, sales, pays, deps, imeis] = await Promise.all([
        supabase.from("stock_movements").select("*, products(name,is_smartphone)").eq("salesman_id", id),
        supabase.from("sales").select("*").eq("salesman_id", id),
        supabase.from("retailer_payments").select("*").eq("salesman_id", id),
        supabase.from("deposits").select("*").eq("salesman_id", id).order("created_at", { ascending: false }),
        supabase.from("imei_units").select("imei, product_id, status").eq("salesman_id", id).eq("status", "with_salesman"),
      ]);
      const byProduct: Record<string, { name: string; isSmart: boolean; issued: number; sold: number; returned: number; damaged: number; hand: number; value: number }> = {};
      for (const m of moves.data ?? []) {
        const p = (byProduct[m.product_id] ??= {
          name: (m.products as { name: string } | null)?.name ?? "",
          isSmart: !!(m.products as { is_smartphone: boolean } | null)?.is_smartphone,
          issued: 0, sold: 0, returned: 0, damaged: 0, hand: 0, value: 0,
        });
        if (m.kind === "issue") { p.issued += m.qty; p.hand += m.qty; p.value += m.qty * Number(m.unit_price); }
        else {
          p.hand -= m.qty;
          p.value -= m.qty * Number(m.unit_price);
          if (m.kind === "sale") p.sold += m.qty;
          if (m.kind === "return") p.returned += m.qty;
          if (m.kind === "damage") p.damaged += m.qty;
        }
      }
      const salesTotal = (sales.data ?? []).reduce((a, s) => a + Number(s.total), 0);
      const salesPaid = (sales.data ?? []).reduce((a, s) => a + Number(s.paid), 0);
      const collected = (pays.data ?? []).reduce((a, s) => a + Number(s.amount), 0);
      const deposited = (deps.data ?? []).reduce((a, s) => a + Number(s.amount), 0);
      const issuedValue = (moves.data ?? []).filter((m) => m.kind === "issue").reduce((a, m) => a + m.qty * Number(m.unit_price), 0);
      const returnedValue = (moves.data ?? []).filter((m) => m.kind !== "issue" && m.kind !== "sale").reduce((a, m) => a + m.qty * Number(m.unit_price), 0);
      return {
        products: Object.entries(byProduct).map(([product_id, v]) => ({ product_id, ...v })),
        handImeis: imeis.data ?? [],
        salesTotal,
        cashInHand: salesPaid + collected - deposited,
        retailerDue: salesTotal - salesPaid - collected,
        deposited,
        deposits: deps.data ?? [],
        /** what the salesman still owes the dealer house (goods taken minus returned minus money deposited) */
        owesDealer: issuedValue - returnedValue - deposited,
      };
    },
  });
}

export function useRetailers() {
  return useQuery({
    queryKey: ["retailers"],
    queryFn: async () => (await supabase.from("retailers").select("*").order("name")).data ?? [],
  });
}
