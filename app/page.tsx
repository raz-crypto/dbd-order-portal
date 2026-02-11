"use client";

import { useMemo, useState } from "react";
import { Logo } from "../components/Logo.tsx";

type LineItem = {
  productNumber: string;
  itemNumber: string;
  vendor: string;
  styleName: string;
  color: string;
  os: string;
  xs: string;
  s: string;
  m: string;
  l: string;
  xl: string;
  x2l: string;
  x3l: string;
  total: string;
  decorationFront: string;
  decorationBack: string;
  decorationOther: string;
  label: string;
  retailFinish: string;
  variant: string;
  productionNote: string;
  drawstrings: string;
};

const emptyItem = (): LineItem => ({
  productNumber: "",
  itemNumber: "",
  vendor: "",
  styleName: "",
  color: "",
  os: "",
  xs: "",
  s: "",
  m: "",
  l: "",
  xl: "",
  x2l: "",
  x3l: "",
  total: "",
  decorationFront: "",
  decorationBack: "",
  decorationOther: "",
  label: "",
  retailFinish: "",
  variant: "",
  productionNote: "",
  drawstrings: "",
});

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-700">
        {label} {required ? <span className="text-rose-600">*</span> : null}
      </span>
      <input
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </label>
  );
}

export default function Page() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Header / PO fields
  const [salespersonName, setSalespersonName] = useState("");
  const [salespersonEmail, setSalespersonEmail] = useState("");
  const [accessCode, setAccessCode] = useState(""); // optional gating via env

  const [clientFirstName, setClientFirstName] = useState("");
  const [clientLastName, setClientLastName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");

  const [poNumber, setPoNumber] = useState("");
  const [poName, setPoName] = useState("");
  const [rushOrder, setRushOrder] = useState(false);
  const [submitDate, setSubmitDate] = useState("");
  const [shipDate, setShipDate] = useState("");
  const [status, setStatus] = useState("");

  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<LineItem[]>([emptyItem(), emptyItem()]);
  const [poPdf, setPoPdf] = useState<File | null>(null);

  const totalUnits = useMemo(() => {
    const toNum = (x: string) => {
      const n = Number(String(x || "").replace(/[^0-9.]/g, ""));
      return Number.isFinite(n) ? n : 0;
    };
    return items.reduce((sum, it) => sum + toNum(it.total), 0);
  }, [items]);

  const canSubmit =
    salespersonName.trim() &&
    salespersonEmail.trim() &&
    poNumber.trim() &&
    poName.trim() &&
    poPdf;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    if (!poPdf) {
      setResult({ ok: false, msg: "Please attach the PO PDF." });
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();

      fd.append("salespersonName", salespersonName);
      fd.append("salespersonEmail", salespersonEmail);
      fd.append("accessCode", accessCode);

      fd.append("clientFirstName", clientFirstName);
      fd.append("clientLastName", clientLastName);
      fd.append("address1", address1);
      fd.append("address2", address2);
      fd.append("city", city);
      fd.append("state", state);
      fd.append("zip", zip);
      fd.append("phone", phone);

      fd.append("poNumber", poNumber);
      fd.append("poName", poName);
      fd.append("rushOrder", rushOrder ? "true" : "false");
      fd.append("submitDate", submitDate);
      fd.append("shipDate", shipDate);
      fd.append("status", status);

      fd.append("notes", notes);
      fd.append("itemsJson", JSON.stringify(items));

      fd.append("poPdf", poPdf, poPdf.name);

      const resp = await fetch("/api/submit", { method: "POST", body: fd });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || "Request failed");
      setResult({ ok: true, msg: "Sent to production (Zoho Desk email) ✅" });

      // reset a bit
      setNotes("");
    } catch (err: any) {
      setResult({ ok: false, msg: err?.message || "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  }

  function updateItem(idx: number, key: keyof LineItem, value: string) {
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });
  }

  function addRow() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeRow(i: number) {
    setItems((prev) => prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== i));
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="mx-auto max-w-6xl p-6">
     <header className="mb-6">
       <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
       <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-slate-900/5 blur-2xl" />
       <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-amber-400/10 blur-2xl" />

        <div className="relative p-6 md:p-7">
         <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Logo size={44} />

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
            Internal
          </span>
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
            PO PDF Required
          </span>
        </div>
      </div>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
        Production Order Intake
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-600">
        Fill out the form to initiate a production order. Submitting will email Zoho Desk with all details and the attached PO PDF.
       </p>
      </div>
      </div>
    </header>


      <form onSubmit={onSubmit} className="space-y-8">
        <section className="rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Sales Rep</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Your name" name="salespersonName" value={salespersonName} onChange={setSalespersonName} required />
            <Field label="Your email" name="salespersonEmail" value={salespersonEmail} onChange={setSalespersonEmail} required type="email" />
            <Field label="Access code (optional)" name="accessCode" value={accessCode} onChange={setAccessCode} placeholder="If your admin enabled it" />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Client / Ship-To</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="First name" name="clientFirstName" value={clientFirstName} onChange={setClientFirstName} />
            <Field label="Last name" name="clientLastName" value={clientLastName} onChange={setClientLastName} />
            <Field label="Phone" name="phone" value={phone} onChange={setPhone} placeholder="(optional)" />
            <Field label="Address 1" name="address1" value={address1} onChange={setAddress1} placeholder="Street, dock, suite" />
            <Field label="Address 2" name="address2" value={address2} onChange={setAddress2} placeholder="(optional)" />
            <Field label="City" name="city" value={city} onChange={setCity} />
            <Field label="State" name="state" value={state} onChange={setState} />
            <Field label="Zip" name="zip" value={zip} onChange={setZip} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold">Purchase Order Header</h2>
            <label className="mt-2 inline-flex items-center gap-2 text-sm md:mt-0">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={rushOrder}
                onChange={(e) => setRushOrder(e.target.checked)}
              />
              RUSH ORDER
            </label>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="PO Number" name="poNumber" value={poNumber} onChange={setPoNumber} required placeholder="e.g., DBD_287" />
            <Field label="PO Name" name="poName" value={poName} onChange={setPoName} required placeholder="e.g., Collection / Program name" />
            <Field label="Status" name="status" value={status} onChange={setStatus} placeholder="e.g., Confirmed" />
            <Field label="Submit date" name="submitDate" value={submitDate} onChange={setSubmitDate} type="date" />
            <Field label="Ship date" name="shipDate" value={shipDate} onChange={setShipDate} type="date" />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-slate-700">
                Attach PO PDF <span className="text-rose-600">*</span>
              </span>
              <input
                type="file"
                accept="application/pdf"
                required
                onChange={(e) => setPoPdf(e.target.files?.[0] || null)}
                className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
              />
              <p className="text-xs text-slate-500">The PDF will be attached to the email so production can reference it.</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Line Items</h2>
            <button
              type="button"
              onClick={addRow}
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              + Add row
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[1200px] w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-xs text-slate-600">
                  {[
                    "Product #","Item #","Vendor","Style name","Color","OS","XS","S","M","L","XL","2XL","3XL","Total",
                    "Deco Front","Deco Back","Deco Other","Label","Retail Finish","Variant","Production Note","Drawstrings",""
                  ].map((h) => (
                    <th key={h} className="sticky top-0 bg-white border-b border-slate-200 px-2 py-2 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx} className="text-sm">
                    {([
                      ["productNumber",""],
                      ["itemNumber",""],
                      ["vendor","ASColour, etc."],
                      ["styleName","Women's Heavyweight Hoodie"],
                      ["color","Ink Blue"],
                      ["os",""],
                      ["xs",""],
                      ["s",""],
                      ["m",""],
                      ["l",""],
                      ["xl",""],
                      ["x2l",""],
                      ["x3l",""],
                      ["total",""],
                      ["decorationFront","Embroidery"],
                      ["decorationBack","Embroidery"],
                      ["decorationOther",""],
                      ["label","Yes/No"],
                      ["retailFinish",""],
                      ["variant",""],
                      ["productionNote",""],
                      ["drawstrings","Yes/No"],
                    ] as Array<[keyof LineItem, string]>).map(([k, ph]) => (
                      <td key={String(k)} className="border-b border-slate-100 px-2 py-1 align-top">
                        <input
                          value={it[k]}
                          onChange={(e) => updateItem(idx, k, e.target.value)}
                          placeholder={ph}
                          className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm focus:border-slate-400"
                        />
                      </td>
                    ))}
                    <td className="border-b border-slate-100 px-2 py-1">
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                        title="Remove row"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-sm text-slate-600">
            Total units (sum of “Total” column): <span className="font-semibold text-slate-900">{totalUnits}</span>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Extra Notes</h2>
          <textarea
            className="mt-3 min-h-[120px] w-full rounded-2xl border border-slate-200 p-3 text-sm shadow-sm focus:border-slate-400"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything production should know (special instructions, deadlines, etc.)"
          />
        </section>

        <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-600">
            {result ? (
              <span className={result.ok ? "text-emerald-700" : "text-rose-700"}>{result.msg}</span>
            ) : (
              <span>When you submit, the details + PDF will be emailed to Zoho Desk.</span>
            )}
          </div>
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit to Production"}
          </button>
        </section>
      </form>

      <footer className="mt-10 text-xs text-slate-500">
        Tip: If you want to prevent random public submissions, set an <code className="rounded bg-slate-100 px-1">ORDER_PORTAL_CODE</code> env var.
      </footer>
      </div>
    </main>
  );
}
