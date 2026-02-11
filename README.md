# DBD Order Portal (Vercel-ready)

Internal web form that collects purchase order details + attaches the PO PDF, then emails Zoho Desk.

## Local dev
1) Install deps:
```bash
npm install
```

2) Create `.env.local` from `.env.example` and fill:
- `RESEND_API_KEY`
- `FROM_EMAIL` (must be from a verified domain in Resend)
- `TO_EMAIL` (your Zoho Desk email)

3) Run:
```bash
npm run dev
```
Open http://localhost:3000

## Deploy to Vercel
- Import this repo/project into Vercel.
- Add the same env vars in Vercel Project Settings → Environment Variables.
- Deploy.

## Security note (recommended)
Without login, the URL is public. To prevent abuse, set `ORDER_PORTAL_CODE` and share the code only internally.

V2
