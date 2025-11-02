import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-200">
      <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold">Quantus</p>
          <p className="text-sm text-slate-400">
            Standards-driven calculators and converters for teams that depend on defensible answers.
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
          <Link href="/category" className="hover:text-white">
            Category index
          </Link>
          <Link href="/about" className="hover:text-white">
            About
          </Link>
          <Link href="/author" className="hover:text-white">
            Author
          </Link>
          <Link href="/privacy" className="hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white">
            Terms
          </Link>
          <Link href="/cookies" className="hover:text-white">
            Cookies
          </Link>
          <Link href="/sitemap.xml" className="hover:text-white">
            Sitemap
          </Link>
          <Link href="/robots.txt" className="hover:text-white">
            Robots
          </Link>
        </nav>
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Quantus. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
