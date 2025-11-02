
import Link from "next/link";
import { notFound } from "next/navigation";
import { isSupportedLocale, publishedEntries, type Locale } from "../../../utils/content";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }, { locale: "it" }];
}

type Props = { params: { locale: string }, searchParams?: { [k: string]: string | string[] | undefined } };

export default function CalculatorsIndex({ params, searchParams }: Props) {
  const { locale } = params;
  if (!isSupportedLocale(locale)) return notFound();
  const all = publishedEntries(locale as Locale);

  const q = String(searchParams?.q ?? "").toLowerCase().trim();
  const cat = String(searchParams?.category ?? "");
  const sub = String(searchParams?.subCategory ?? "");

  const filtered = all.filter(it => {
    const byCat = cat ? it.category === cat : true;
    const bySub = sub ? it.subCategory === sub : true;
    const byQ = q ? (it.title.toLowerCase().includes(q) || it.slug.includes(q) || it.calcId.includes(q)) : true;
    return byCat && bySub && byQ;
  });

  const categories = Array.from(new Set(all.map(i=>i.category).filter(Boolean))).sort();
  const subcats = Array.from(new Set(all.filter(i=>!cat || i.category===cat).map(i=>i.subCategory).filter(Boolean))).sort();

  const makeQS = (obj: Record<string, string>) => {
    const usp = new URLSearchParams();
    if (obj.q) usp.set("q", obj.q);
    if (obj.category) usp.set("category", obj.category);
    if (obj.subCategory) usp.set("subCategory", obj.subCategory);
    const s = usp.toString();
    return s ? `?${s}` : "";
  };

  return (
    <section style={{ maxWidth: 1000, margin: "24px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Calculators</h1>

      <form method="get" style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 200px 220px", alignItems: "end", marginBottom: 16 }}>
        <div>
          <label htmlFor="q" style={{ display: "block", fontSize: 12, color: "#6b7280" }}>Search</label>
          <input id="q" name="q" defaultValue={q} placeholder="Search calculators..." style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 12px" }} />
        </div>
        <div>
          <label htmlFor="category" style={{ display: "block", fontSize: 12, color: "#6b7280" }}>Category</label>
          <select id="category" name="category" defaultValue={cat} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 12px" }}>
            <option value="">All</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="subCategory" style={{ display: "block", fontSize: 12, color: "#6b7280" }}>Subcategory</label>
          <select id="subCategory" name="subCategory" defaultValue={sub} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 12px" }}>
            <option value="">All</option>
            {subcats.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
          <button type="submit" style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb" }}>Apply</button>
          <a href={`/${locale}/calculators`} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", textDecoration: "none" }}>Reset</a>
        </div>
      </form>

      {filtered.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No calculators match your filters.</p>
      ) : (
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {filtered.map((it) => (
            <article key={it.slug} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                <Link href={`/${locale}/calculators/${it.slug}`}>{it.title}</Link>
              </h2>
              <p style={{ color: "#6b7280", fontSize: 13 }}>
                {it.category} {it.subCategory ? `· ${it.subCategory}` : ""}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
