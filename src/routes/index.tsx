import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "মোবাইল ডিস্ট্রিবিউশন হিসাব" },
      { name: "description", content: "Dealer house stock, salesman accounts and IMEI scanning in one app." },
      { property: "og:title", content: "Mobile Distribution Hisab" },
      { property: "og:description", content: "Dealer house stock, salesman accounts and IMEI scanning in one app." },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    throw redirect({ to: data.user ? "/dashboard" : "/auth" });
  },
  component: () => null,
});
