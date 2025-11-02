type RelatedCalculator = {
  slug: string;
  title: string;
  category?: string;
  subCategory?: string;
};

type Props = {
  locale: string;
  items: RelatedCalculator[];
};

export default function RelatedCalculators({ locale, items }: Props) {
  if (items.length === 0) {
    return (
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Related calculators</h2>
        <p style={{ color: "#6b7280" }}>No related calculators yet.</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Related calculators</h2>
      <ul style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {items.map((item) => (
          <li key={item.slug} style={{ listStyle: "none" }}>
            <a href={`/${locale}/calculators/${item.slug}`} style={{ textDecoration: "none" }}>
              {item.title}
            </a>
            <div style={{ color: "#6b7280", fontSize: 12 }}>
              {item.category}
              {item.subCategory ? ` · ${item.subCategory}` : ""}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
