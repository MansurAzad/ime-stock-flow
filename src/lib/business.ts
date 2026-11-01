import { useState } from "react";

/** Dealer house identity printed on receipts/invoices (letterhead pad). */
export type Business = { name: string; address: string; phone: string };

const KEY = "business-info";
const DEFAULTS: Business = { name: "", address: "", phone: "" };

export function getBusiness(): Business {
  try {
    return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) || "{}") as Partial<Business>) };
  } catch {
    return DEFAULTS;
  }
}

export function useBusiness(): [Business, (b: Business) => void] {
  const [b, setB] = useState<Business>(getBusiness);
  const save = (nb: Business) => {
    setB(nb);
    localStorage.setItem(KEY, JSON.stringify(nb));
  };
  return [b, save];
}
