<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## App rules
- Stock, sale and return changes go only through the database functions (issue_stock, record_sale, return_stock, check_imei); never write imei_units/stock_movements directly from the client — they enforce IMEI status validation.
- Salesman balances are derived from stock_movements, sales, retailer_payments and deposits (see src/lib/me.ts); do not store running totals.
- UI strings live in src/lib/i18n.tsx (Bengali + English pairs).
- Leaf page metadata uses the shared pageHead helper to keep company identity consistent with distinct page titles.
- Dashboard and stock counts use security-invoker reporting RPCs so totals aggregate in PostgreSQL without bypassing caller RLS.
- Shared queries reuse data briefly and mutations invalidate it; do not cache security decisions in browser storage.
- Blank letterhead settings fall back to the company defaults; explicit saved business settings remain editable.
