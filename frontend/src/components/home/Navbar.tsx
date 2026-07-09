import { useEffect, useState } from "react";
import { Menu, X, GraduationCap, ArrowRight } from "lucide-react";
import { Link } from "react-router";

const links = [
  { href: "#home", label: "Home" },
  { href: "#overview", label: "Overview" },
  { href: "#stats", label: "Impact" },
  { href: "#programs", label: "Modules" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-[#E8F5EE] bg-white/92 py-3 shadow-[0_20px_45px_rgba(0,132,61,0.10)] backdrop-blur-md"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#00843D] p-2.5 shadow-[0_18px_34px_rgba(0,132,61,0.20)]">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="block text-2xl font-black tracking-tight text-[#111111]">
                YABA<span className="text-[#00843D]">TECH</span>
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4B5563]">
                Course And Result Portal
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {links.map((item) => (
              <a key={item.label} href={item.href} className="text-sm font-semibold text-[#4B5563] transition-colors hover:text-[#00843D]">
                {item.label}
              </a>
            ))}
            <Link to="/architecture" className="text-sm font-semibold text-[#4B5563] transition-colors hover:text-[#00843D]">
              Architecture
            </Link>
            <Link to="/login" className="rounded-full border border-[#E8F5EE] bg-white px-4 py-2 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#F5F7FA]">
              Sign In
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[#00843D] px-5 py-2.5 text-sm font-bold text-white shadow-[0_18px_34px_rgba(0,132,61,0.20)] transition-all hover:-translate-y-0.5 hover:bg-[#006B31]"
            >
              Open Portal
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button onClick={() => setIsOpen((value) => !value)} className="text-[#111111] md:hidden">
            {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-b border-[#E8F5EE] bg-white px-4 pb-6 pt-3 shadow-[0_18px_40px_rgba(0,132,61,0.08)] md:hidden">
          <div className="space-y-4">
            {links.map((item) => (
              <a key={item.label} href={item.href} className="block text-base font-semibold text-[#111111] hover:text-[#00843D]">
                {item.label}
              </a>
            ))}
            <Link to="/architecture" className="block text-base font-semibold text-[#111111] hover:text-[#00843D]">
              Architecture
            </Link>
            <Link to="/login" className="block text-base font-semibold text-[#111111] hover:text-[#00843D]">
              Sign In
            </Link>
            <Link to="/login" className="block rounded-full bg-[#00843D] px-5 py-3 text-center font-bold text-white">
              Open Portal
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;