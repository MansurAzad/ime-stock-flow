import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const dict = {
  appName: ["প্রোডাক্ট ডিস্ট্রিবিউশন ম্যানেজমেন্ট", "Product Distribution Management"],
  companyName: ["FIROZA ENTERPRISE", "FIROZA ENTERPRISE"],
  companyAddress: ["KONABARI, GAZIPUR", "KONABARI, GAZIPUR"],
  companyPhone: ["MOBILE- 01817122232", "MOBILE- 01817122232"],
  dashboard: ["ড্যাশবোর্ড", "Dashboard"],
  products: ["প্রোডাক্ট", "Products"],
  salesmen: ["সেলসম্যান", "Salesmen"],
  stockIssue: ["মাল দেওয়া", "Stock Issue"],
  sales: ["বিক্রি", "Sales"],
  retailers: ["দোকান / রিটেইলার", "Retailers"],
  settlement: ["ফেরত ও জমা", "Return & Deposit"],
  signOut: ["লগ আউট", "Sign out"],
  signIn: ["লগইন", "Sign in"],
  signUp: ["নতুন অ্যাকাউন্ট", "Create account"],
  email: ["ইমেইল", "Email"],
  password: ["পাসওয়ার্ড", "Password"],
  fullName: ["পুরো নাম", "Full name"],
  phone: ["ফোন", "Phone"],
  name: ["নাম", "Name"],
  model: ["মডেল", "Model"],
  price: ["দাম", "Price"],
  smartphone: ["স্মার্টফোন (IMEI)", "Smartphone (IMEI)"],
  buttonPhone: ["বাটন ফোন", "Button phone"],
  stock: ["স্টক", "Stock"],
  add: ["যোগ করুন", "Add"],
  save: ["সেভ", "Save"],
  qty: ["পরিমাণ", "Qty"],
  total: ["মোট", "Total"],
  paid: ["নগদ পেল", "Paid"],
  due: ["বাকি", "Due"],
  scan: ["IMEI স্ক্যান", "Scan IMEI"],
  stopScan: ["স্ক্যান বন্ধ", "Stop scan"],
  typeImei: ["IMEI লিখুন", "Type IMEI"],
  imeiOk: ["সঠিক IMEI", "IMEI OK"],
  imeiWrong: ["ভুল IMEI!", "Wrong IMEI!"],
  selectSalesman: ["সেলসম্যান বাছুন", "Select salesman"],
  selectRetailer: ["রিটেইলার বাছুন", "Select retailer"],
  selectProduct: ["প্রোডাক্ট বাছুন", "Select product"],
  inHand: ["হাতে আছে", "In hand"],
  issued: ["নিয়েছে", "Issued"],
  sold: ["বিক্রি", "Sold"],
  returned: ["ফেরত", "Returned"],
  damaged: ["ড্যামেজ", "Damaged"],
  cashInHand: ["হাতে নগদ টাকা", "Cash in hand"],
  deposited: ["জমা দিয়েছে", "Deposited"],
  retailerDue: ["দোকানের বাকি", "Retailer dues"],
  goodsValue: ["হাতের মালের দাম", "Goods value in hand"],
  collectPayment: ["টাকা আদায়", "Collect payment"],
  amount: ["টাকার পরিমাণ", "Amount"],
  deposit: ["টাকা জমা নিন", "Receive deposit"],
  returnGoods: ["মাল ফেরত", "Return goods"],
  markDamaged: ["ড্যামেজ হিসেবে", "As damaged"],
  confirm: ["নিশ্চিত করুন", "Confirm"],
  items: ["আইটেম", "Items"],
  history: ["ইতিহাস", "History"],
  noData: ["কোনো তথ্য নেই", "No data"],
  done: ["সম্পন্ন হয়েছে", "Done"],
  ledger: ["লেজার", "Ledger"],
  addImei: ["IMEI যোগ", "Add IMEIs"],
  imeiList: ["IMEI তালিকা (প্রতি লাইনে একটি)", "IMEI list (one per line)"],
  active: ["সক্রিয়", "Active"],
  newSalesman: ["নতুন সেলসম্যান", "New salesman"],
  date: ["তারিখ", "Date"],
  export: ["এক্সেল", "Excel"],
  print: ["প্রিন্ট / PDF", "Print / PDF"],
  receipt: ["রশিদ", "Receipt"],
  saleInvoice: ["বিক্রয় ইনভয়েস", "Sales Invoice"],
  moneyReceipt: ["মানি রশিদ", "Money Receipt"],
  settlementReport: ["হিসাব-মেলানো রিপোর্ট", "Settlement Report"],
  stockReport: ["স্টক রিপোর্ট", "Stock Report"],
  businessInfo: ["ব্যবসার নাম-ঠিকানা (প্যাড)", "Business name & address (letterhead)"],
  address: ["ঠিকানা", "Address"],
  receivedFrom: ["যার কাছ থেকে পেলাম", "Received from"],
  businessOwner: ["মালিক / ডিলার হাউস", "Owner / Dealer house"],
  printReceipt: ["রশিদ প্রিন্ট", "Print receipt"],
  owesDealer: ["ডিলার হাউস পাবে", "Owes dealer house"],
} as const;

export type Key = keyof typeof dict;
type Lang = "bn" | "en";
const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: "bn",
  setLang: () => {},
  t: (k) => dict[k][0],
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");
  useEffect(() => {
    const s = localStorage.getItem("lang");
    if (s === "en" || s === "bn") setLangState(s);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };
  const t = (k: Key) => dict[k][lang === "bn" ? 0 : 1];
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useT = () => useContext(Ctx);
