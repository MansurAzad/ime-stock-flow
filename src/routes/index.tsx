import { pageHead } from "@/lib/page-head";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => pageHead("প্রোডাক্ট ডিস্ট্রিবিউশন ম্যানেজমেন্ট", "FIROZA ENTERPRISE — KONABARI, GAZIPUR. Product distribution, stock and salesman accounts. MOBILE- 01817122232."),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    throw redirect({ to: data.user ? "/dashboard" : "/auth" });
  },
  component: () => null,
});
