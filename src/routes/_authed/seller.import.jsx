import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PlugZap } from "lucide-react";
import { importProducts } from "@/lib/server-fns";
import { CATEGORIES, MAKER_TYPES } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authed/seller/import")({
  head: () => ({ meta: [{ title: "Import listings — Sweet Shop" }] }),
  component: ImportPage,
});

const HEADER = "title,price,category,description,provenance,stock,maker_type,maker_name,maker_compensation,is_on_demand,lead_time_days,image_url";

function normalizeHeader(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseCsvRecords(text) {
  const records = [];
  let record = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"' && quoted && text[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      record.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      record.push(value.trim());
      value = "";
      if (record.some((field) => field.length > 0)) records.push(record);
      record = [];
    } else {
      value += char;
    }
  }

  if (quoted) throw new Error("The CSV contains an unmatched quotation mark.");
  if (value.length > 0 || record.length > 0) {
    record.push(value.trim());
    if (record.some((field) => field.length > 0)) records.push(record);
  }
  return records;
}

function parseCsv(text) {
  const records = parseCsvRecords(text);
  if (records.length === 0) return [];

  const firstHeaders = records[0].map(normalizeHeader);
  const hasHeader =
    firstHeaders.some((header) => ["title", "name", "productname", "producttitle", "listingtitle"].includes(header)) &&
    firstHeaders.some((header) => ["price", "pricecents", "variantprice", "regularprice", "listingprice", "productprice"].includes(header));
  const headers = hasHeader
    ? records.shift().map(normalizeHeader)
    : HEADER.split(",").map(normalizeHeader);

  return records.map((row) => {
    const column = (...aliases) => {
      const index = headers.findIndex((header) => aliases.includes(header));
      return index < 0 ? "" : String(row[index] ?? "").trim();
    };
    const priceCentsRaw = column("pricecents");
    const priceRaw = column("price", "variantprice", "regularprice", "listingprice", "unitprice", "productprice");
    const compareCentsRaw = column("compareatpricecents");
    const compareRaw = column("compareatprice", "variantcompareatprice");
    const stockRaw = column("stock", "quantity", "inventory", "inventoryquantity", "variantinventoryqty", "variantinventoryquantity", "productstock");
    const onDemandRaw = column("isondemand", "ondemand", "madetoorder").toLowerCase();
    const is_on_demand = onDemandRaw === ""
      ? false
      : ["true", "1", "yes", "y"].includes(onDemandRaw)
        ? true
        : ["false", "0", "no", "n"].includes(onDemandRaw)
          ? false
          : undefined;
    const compensationCentsRaw = column("makercompensationcents");
    const compensationRaw = column("makercompensation", "compensationrate", "makercompensationrate");

    return {
      title: column("title", "name", "productname", "producttitle", "listingtitle"),
      price_cents: priceCentsRaw !== ""
        ? Number(priceCentsRaw)
        : priceRaw === "" ? Number.NaN : Math.round(Number(priceRaw) * 100),
      compare_at_price_cents: compareCentsRaw !== ""
        ? Number(compareCentsRaw)
        : compareRaw === "" ? undefined : Math.round(Number(compareRaw) * 100),
      category: column("category", "producttype", "productcategory", "type"),
      description: column("description", "bodyhtml", "body", "productdescription"),
      provenance: column("provenance", "materials", "productmaterials", "madefrom"),
      stock: stockRaw === "" ? (is_on_demand === true ? 0 : Number.NaN) : Number(stockRaw),
      maker_type: column("makertype", "madeby") || "self",
      maker_name: column("makername", "vendor", "seller", "shopname") || undefined,
      maker_compensation_cents: compensationCentsRaw !== ""
        ? Number(compensationCentsRaw)
        : compensationRaw === "" ? undefined : Math.round(Number(compensationRaw) * 100),
      is_on_demand,
      lead_time_days: column("leadtimedays", "leadtime", "processingdays") === ""
        ? undefined
        : Number(column("leadtimedays", "leadtime", "processingdays")),
      image_url: column("imageurl", "imagesrc", "image", "image1", "photo", "primaryimage", "productimageurl") || undefined,
    };
  });
}

function rowErrors(row) {
  const errors = [];
  const validMaker = Object.prototype.hasOwnProperty.call(MAKER_TYPES, row.maker_type);
  const validOnDemand = typeof row.is_on_demand === "boolean";
  const validStock = row.is_on_demand
    ? row.stock === 0 && Number.isInteger(row.lead_time_days) && row.lead_time_days >= 1
    : Number.isInteger(row.stock) && row.stock >= 1;
  const validLeadTime = row.lead_time_days === undefined ||
    (Number.isInteger(row.lead_time_days) && row.lead_time_days >= 1);
  const validCompareAtPrice = row.compare_at_price_cents === undefined ||
    (Number.isInteger(row.compare_at_price_cents) && row.compare_at_price_cents >= 0);
  const validCompensationValue = row.maker_compensation_cents === undefined ||
    (Number.isInteger(row.maker_compensation_cents) && row.maker_compensation_cents >= 0);
  const validCompensation = validCompensationValue && (row.maker_type !== "incarcerated_artisan" ||
    (Number.isInteger(row.maker_compensation_cents) && row.maker_compensation_cents > 0));

  if (!row.title.trim()) errors.push("title");
  if (!Number.isInteger(row.price_cents) || row.price_cents < 0) errors.push("price");
  if (!row.category.trim()) errors.push("category");
  if (!row.description.trim()) errors.push("description");
  if (!validMaker) errors.push("maker type");
  if (!validOnDemand) errors.push("made-to-order flag");
  if (!validStock) errors.push("stock or made-to-order lead time");
  if (!validLeadTime) errors.push("lead time");
  if (!validCompareAtPrice) errors.push("compare-at price");
  if (!validCompensation) errors.push("maker compensation");
  return errors;
}

function isValidRow(row) {
  return rowErrors(row).length === 0;
}

function ImportPage() {
  const run = useServerFn(importProducts);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const parsed = (() => {
    try {
      return { rows: parseCsv(text), error: "" };
    } catch (err) {
      return { rows: [], error: err?.message || "The CSV could not be parsed." };
    }
  })();
  const rows = parsed.rows;
  const invalidRows = rows.filter((row) => !isValidRow(row));
  const validRows = rows.filter(isValidRow);

  const loadFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setMessage("");
    if (file.size > 5 * 1024 * 1024) {
      setError("CSV files must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }
    try {
      setText(await file.text());
    } catch {
      setError("The selected CSV file could not be read.");
    }
  };

  const submit = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    let imported = 0;
    try {
      for (let start = 0; start < validRows.length; start += 50) {
        const result = await run({ data: { rows: validRows.slice(start, start + 50) } });
        imported += result.imported;
      }
      setMessage(`${imported} listings imported as private drafts. Submit them for verification when ready.`);
      setText("");
    } catch (err) {
      const detail = err?.message || "The import failed. Check the rows and try again.";
      setError(
        imported > 0
          ? `${imported} listings were imported as private drafts before the import stopped. Remove those rows from the CSV before retrying. ${detail}`
          : detail,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link to="/seller" className="text-xs font-medium text-primary/80 hover:text-primary">
        ← Seller dashboard
      </Link>
      <h1 className="mt-4 text-3xl">Import listings</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Import product rows from a CSV export. Common Shopify, Etsy, Wix and Squarespace product headers are recognised alongside the normalized template below. Imported listings remain private drafts and go through the same testing and legitimacy review as other listings.
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-primary/30 bg-white/60 p-5">
        <p className="flex items-center gap-2 text-sm font-medium">
          <PlugZap className="h-4 w-4 text-primary/70" /> Direct source connections are not configured
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          This importer accepts CSV data mapped to the column order below. It does not claim to connect to or synchronise external storefronts or other services.
        </p>
      </div>

      <div className="sweet-card mt-6 p-6">
        <label htmlFor="csv" className="text-sm font-medium">
          CSV columns
        </label>
        <p className="mt-1 text-xs text-muted-foreground">
          {HEADER}
        </p>
        <div className="mt-3">
          <label htmlFor="csv-file" className="text-sm font-medium">Choose a CSV export</label>
          <input
            id="csv-file"
            type="file"
            accept=".csv,text/csv"
            onChange={loadFile}
            className="mt-2 block w-full text-xs file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground"
          />
        </div>
        <Textarea
          id="csv"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={9}
          placeholder={HEADER}
          className="mt-2 font-mono text-xs"
        />
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          <p>Any category name is accepted. Suggested categories: {CATEGORIES.map((item) => item.value).join(", ")}.</p>
          <p>Maker types: {Object.keys(MAKER_TYPES).join(", ")}.</p>
          <p>Use true or false for is_on_demand. Made-to-order rows require stock 0 and a lead time; stocked rows require stock of at least 1.</p>
          <p>Description is required. Provenance details are optional. Incarcerated-artisan rows require a positive compensation rate per item. image_url is optional.</p>
          <p>Quote fields containing commas or line breaks. Common export headers are mapped automatically; provenance/materials, category, price and stock or made-to-order details must still be present. Rows are processed in batches of 50; there is no app-imposed total listing limit.</p>
        </div>

        {parsed.error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{parsed.error}</p>}

        {rows.length > 0 && (
          <div className="mt-4 rounded-xl bg-muted/60 p-4 text-xs">
            <p className="font-semibold">{validRows.length} valid rows · {invalidRows.length} invalid rows</p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              {rows.slice(0, 5).map((row, index) => (
                <li key={index} className={isValidRow(row) ? "" : "text-destructive"}>
                  {row.title || `Row ${index + 1}`} · {Number.isFinite(row.price_cents) ? (row.price_cents / 100).toFixed(2) : "invalid price"} · {row.category || "no category"}
                  {!isValidRow(row) ? ` · missing/invalid: ${rowErrors(row).join(", ")}` : ""}
                </li>
              ))}
              {rows.length > 5 && <li>and {rows.length - 5} more…</li>}
            </ul>
          </div>
        )}

        {message && <p className="mt-4 rounded-xl bg-secondary/70 p-3 text-sm">{message}</p>}
        {error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

        <Button
          onClick={submit}
          className="mt-5 rounded-full"
          disabled={busy || validRows.length === 0 || invalidRows.length > 0}
        >
          {busy ? "Importing…" : `Import ${validRows.length || ""} listings`}
        </Button>
      </div>
    </div>
  );
}
