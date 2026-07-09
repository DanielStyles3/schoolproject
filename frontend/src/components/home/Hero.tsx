import { ArrowRight, ChevronRight, FolderCheck, ScrollText, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import { yabatechImages } from "@/lib/yabatechImages";

const Hero = () => {
  return (
    <section id="home" className="relative overflow-hidden pb-20 pt-32 sm:pb-24 lg:pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,132,61,0.10),transparent_26%),radial-gradient(circle_at_top_right,rgba(255,214,0,0.18),transparent_22%),linear-gradient(180deg,#F5F7FA_0%,#FFFFFF_100%)]" />
      <div className="absolute left-0 top-28 h-56 w-56 rounded-full bg-[#FFD600]/20 blur-3xl" />
      <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-[#00843D]/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:min-h-[82vh] lg:grid-cols-[1.04fr_0.96fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E8F5EE] bg-white/90 px-4 py-2 text-sm font-semibold text-[#00843D] shadow-sm backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FFD600]" />
              YabaTech academic operations prototype
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-black leading-[0.92] tracking-tight text-[#111111] md:text-7xl">
                Smarter course registration and result management for a modern school portal.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[#4B5563] md:text-xl">
                A focused YabaTech web app where students register courses, teachers record scores,
                and administrators manage academic workflow from one clean digital system.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/login" className="w-full sm:w-auto">
                <span className="flex w-full items-center justify-center gap-2 rounded-full bg-[#00843D] px-8 py-4 font-bold text-white shadow-[0_20px_40px_rgba(0,132,61,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#006B31]">
                  Open Portal
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Link>
              <a
                href="#overview"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E8F5EE] bg-white px-8 py-4 font-bold text-[#111111] transition-all hover:border-[#FFD600] hover:bg-[#FFF9CC] sm:w-auto"
              >
                Explore Features
                <ChevronRight className="h-4 w-4 text-[#00843D]" />
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { value: "Students", label: "Register courses easily" },
                { value: "Teachers", label: "Record results securely" },
                { value: "Admins", label: "Control school setup" },
              ].map((item) => (
                <div key={item.value} className="rounded-[1.75rem] border border-[#E8F5EE] bg-white/90 p-5 shadow-[0_18px_36px_rgba(0,132,61,0.08)] backdrop-blur-sm">
                  <p className="text-lg font-black text-[#111111] sm:text-xl">{item.value}</p>
                  <p className="mt-1 text-sm leading-6 text-[#4B5563]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-10 hidden rounded-[1.5rem] border border-[#FFD600] bg-[#FFF9CC] px-4 py-3 shadow-lg lg:block">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#111111]">Built For</p>
              <p className="mt-1 text-lg font-bold text-[#111111]">Yaba College of Technology</p>
            </div>

            <div className="overflow-hidden rounded-[2.25rem] border border-[#E8F5EE] bg-white shadow-[0_28px_70px_rgba(0,132,61,0.14)]">
              <div className="relative">
                <img
                  src={yabatechImages.mainGate}
                  alt="Yaba College of Technology main gate"
                  fetchPriority="high"
                  decoding="async"
                  className="h-[520px] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/72 via-transparent to-transparent" />
                <div className="absolute left-6 top-6 rounded-full border border-white/60 bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[#00843D] backdrop-blur-sm">
                  Academic Workflow
                </div>
              </div>

              <div className="grid gap-4 bg-white p-6 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#E8F5EE] bg-[#F5F7FA] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#00843D]">
                    <FolderCheck className="h-4 w-4" />
                    <span className="text-sm font-semibold text-[#111111]">Registration</span>
                  </div>
                  <p className="text-sm leading-6 text-[#4B5563]">Students choose and submit active semester courses.</p>
                </div>
                <div className="rounded-2xl border border-[#E8F5EE] bg-[#F5F7FA] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#00843D]">
                    <ScrollText className="h-4 w-4" />
                    <span className="text-sm font-semibold text-[#111111]">Results</span>
                  </div>
                  <p className="text-sm leading-6 text-[#4B5563]">Teachers capture CA and exam scores for assigned courses.</p>
                </div>
                <div className="rounded-2xl border border-[#E8F5EE] bg-[#F5F7FA] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#00843D]">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-sm font-semibold text-[#111111]">Access Control</span>
                  </div>
                  <p className="text-sm leading-6 text-[#4B5563]">Each role sees only the tools and data it should manage.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;




