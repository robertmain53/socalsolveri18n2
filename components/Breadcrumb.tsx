
import Link from "next/link";

export default function Breadcrumb({ items }: { items: Array<{ name: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
      <ol style={{ display: "flex", flexWrap: "wrap", gap: 6, listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((it, idx) => (
          <li key={idx} style={{ display: "flex", alignItems: "center" }}>
            {it.href ? <Link href={it.href}>{it.name}</Link> : <span>{it.name}</span>}
            {idx < items.length - 1 && <span style={{ margin: "0 6px" }}>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
