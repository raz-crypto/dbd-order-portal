import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

function env(name: string, required = true): string {
  const v = process.env[name];
  if (!v && required) throw new Error(`Missing env var: ${name}`);
  return v || "";
}

function toBase64(buf: ArrayBuffer): string {
  return Buffer.from(buf).toString("base64");
}

function esc(s: string): string {
  return (s || "").replace(/[&<>"']/g, (c) => {
    const m: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return m[c] || c;
  });
}

type LineItem = Record<string, string>;

function renderItemsTable(items: LineItem[]) {
  const headers = [
    "Product #","Item #","Vendor","Style name","Color","OS","XS","S","M","L","XL","2XL","3XL","Total",
    "Deco Front","Deco Back","Deco Other","Label","Retail Finish","Variant","Production Note","Drawstrings",
  ];
  const keys = [
    "productNumber","itemNumber","vendor","styleName","color","os","xs","s","m","l","xl","x2l","x3l","total",
    "decorationFront","decorationBack","decorationOther","label","retailFinish","variant","productionNote","drawstrings",
  ];

  const rows = (items || []).map((it) => {
    const tds = keys.map((k) => `<td style="border:1px solid #e5e7eb;padding:6px;vertical-align:top;">${esc(it?.[k] || "")}</td>`).join("");
    return `<tr>${tds}</tr>`;
  }).join("");

  const ths = headers.map((h) => `<th style="border:1px solid #e5e7eb;padding:6px;background:#f8fafc;text-align:left;">${esc(h)}</th>`).join("");

  return `
    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:12px;">
      <thead><tr>${ths}</tr></thead>
      <tbody>${rows || `<tr><td colspan="${headers.length}" style="border:1px solid #e5e7eb;padding:6px;">(No line items provided)</td></tr>`}</tbody>
    </table>
  `;
}

export async function POST(req: Request) {
  try {
    const resend = new Resend(env("RESEND_API_KEY"));
    const toEmail = env("TO_EMAIL");
    const fromEmail = env("FROM_EMAIL");
    const ccEmail = process.env.CC_EMAIL || "";
    const portalCode = process.env.ORDER_PORTAL_CODE || "";

    const form = await req.formData();

    const salespersonName = String(form.get("salespersonName") || "");
    const salespersonEmail = String(form.get("salespersonEmail") || "");
    const accessCode = String(form.get("accessCode") || "");

    if (!salespersonName || !salespersonEmail) {
      return NextResponse.json({ error: "Missing salesperson name/email." }, { status: 400 });
    }
    if (portalCode && accessCode !== portalCode) {
      return NextResponse.json({ error: "Invalid access code." }, { status: 403 });
    }

    const poNumber = String(form.get("poNumber") || "");
    const poName = String(form.get("poName") || "");
    if (!poNumber || !poName) {
      return NextResponse.json({ error: "Missing PO number or PO name." }, { status: 400 });
    }

    const rushOrder = String(form.get("rushOrder") || "false") === "true";
    const submitDate = String(form.get("submitDate") || "");
    const shipDate = String(form.get("shipDate") || "");
    const status = String(form.get("status") || "");

    const clientFirstName = String(form.get("clientFirstName") || "");
    const clientLastName = String(form.get("clientLastName") || "");
    const address1 = String(form.get("address1") || "");
    const address2 = String(form.get("address2") || "");
    const city = String(form.get("city") || "");
    const state = String(form.get("state") || "");
    const zip = String(form.get("zip") || "");
    const phone = String(form.get("phone") || "");

    const notes = String(form.get("notes") || "");
    const itemsJson = String(form.get("itemsJson") || "[]");
    let items: LineItem[] = [];
    try { items = JSON.parse(itemsJson); } catch { items = []; }

    const poPdf = form.get("poPdf");
    if (!(poPdf instanceof File)) {
      return NextResponse.json({ error: "PO PDF is required." }, { status: 400 });
    }

    // Size guard (Vercel body limit isn't strict here, but large PDFs are risky)
    const maxBytes = Number(process.env.MAX_PDF_BYTES || "8000000"); // 8MB default
    if (poPdf.size > maxBytes) {
      return NextResponse.json({ error: `PDF is too large. Max is ${Math.round(maxBytes / 1e6)}MB.` }, { status: 413 });
    }

    const pdfBase64 = toBase64(await poPdf.arrayBuffer());

    const subject = `[DBD PO] ${poNumber} — ${poName}${rushOrder ? " (RUSH)" : ""}`;

    const html = `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;line-height:1.4;">
        <h2 style="margin:0 0 8px 0;">New Production Order</h2>
        <p style="margin:0 0 14px 0;color:#334155;">
          Submitted via the DBD Order Portal. PO PDF attached.
        </p>

        <h3 style="margin:18px 0 6px 0;">PO Header</h3>
        <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
          ${[
            ["PO Number", poNumber],
            ["PO Name", poName],
            ["Rush Order", rushOrder ? "Yes" : "No"],
            ["Submit Date", submitDate],
            ["Ship Date", shipDate],
            ["Status", status],
          ].map(([k,v]) => `
            <tr>
              <td style="padding:6px 10px;border:1px solid #e5e7eb;background:#f8fafc;font-weight:600;">${esc(k)}</td>
              <td style="padding:6px 10px;border:1px solid #e5e7eb;">${esc(v)}</td>
            </tr>
          `).join("")}
        </table>

        <h3 style="margin:18px 0 6px 0;">Client / Ship-To</h3>
        <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
          ${[
            ["Client", `${clientFirstName} ${clientLastName}`.trim()],
            ["Phone", phone],
            ["Address 1", address1],
            ["Address 2", address2],
            ["City", city],
            ["State", state],
            ["Zip", zip],
          ].map(([k,v]) => `
            <tr>
              <td style="padding:6px 10px;border:1px solid #e5e7eb;background:#f8fafc;font-weight:600;">${esc(k)}</td>
              <td style="padding:6px 10px;border:1px solid #e5e7eb;">${esc(v)}</td>
            </tr>
          `).join("")}
        </table>

        <h3 style="margin:18px 0 6px 0;">Line Items</h3>
        ${renderItemsTable(items)}

        ${notes ? `
          <h3 style="margin:18px 0 6px 0;">Notes</h3>
          <div style="border:1px solid #e5e7eb;padding:10px;border-radius:10px;white-space:pre-wrap;">${esc(notes)}</div>
        ` : ""}

        <p style="margin:18px 0 0 0;color:#475569;font-size:12px;">
          Submitted by ${esc(salespersonName)} (${esc(salespersonEmail)}).
        </p>
      </div>
    `;

    const ccList = [ccEmail].filter(Boolean);

    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      cc: ccList.length ? ccList : undefined,
      replyTo: salespersonEmail,
      subject,
      html,
      attachments: [
        {
          filename: poPdf.name || `${poNumber}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
