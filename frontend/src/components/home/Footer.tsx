import { ArrowUp, Github, GraduationCap, Linkedin } from "lucide-react";
import { yabatechImages } from "@/lib/yabatechImages";

const Footer = () => {
  return (
    <footer className="border-t border-[#E8F5EE] bg-[linear-gradient(180deg,#FFFFFF_0%,#F5F7FA_100%)] pb-10 pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#00843D] p-2.5 shadow-[0_18px_34px_rgba(0,132,61,0.18)]">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="block text-2xl font-black tracking-tight text-[#111111] uppercase">YABATECH</span>
                <span className="text-xs uppercase tracking-[0.22em] text-[#4B5563]">Course And Result Portal</span>
              </div>
            </div>
            <p className="leading-7 text-[#4B5563]">
              A focused academic management prototype centered on course registration, teacher score
              entry, and student result checking.
            </p>
            <div className="flex gap-4">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8F5EE] bg-white text-[#4B5563] shadow-sm transition-all hover:border-[#FFD600] hover:bg-[#FFF9CC] hover:text-[#111111]">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8F5EE] bg-white text-[#4B5563] shadow-sm transition-all hover:border-[#FFD600] hover:bg-[#FFF9CC] hover:text-[#111111]">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-bold text-[#111111]">Core Features</h4>
            <ul className="space-y-4 text-[#4B5563]">
              {[
                "Student management",
                "Course registration",
                "Result management",
                "Class administration",
                "Academic year setup",
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-bold text-[#111111]">Portal Users</h4>
            <ul className="space-y-4 text-[#4B5563]">
              {[
                "Administrators",
                "Teachers",
                "Students",
                "Project supervisors",
                "Demo reviewers",
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-bold text-[#111111]">Project Note</h4>
            <p className="mb-6 leading-7 text-[#4B5563]">
              This homepage presents the system as a realistic school operations portal rather than a
              generic university brochure site.
            </p>
            <a href="/login" className="inline-flex rounded-full bg-[#00843D] px-5 py-3 font-bold text-white transition-colors hover:bg-[#006B31]">
              Open Portal
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#E8F5EE] pt-8 text-sm text-[#4B5563] md:flex-row">
          <p>(c) 2025 Yaba College of Technology student project.</p>
          <a href={yabatechImages.commonsCategory} target="_blank" rel="noreferrer" className="transition-colors hover:text-[#00843D]">Campus images from Wikimedia Commons</a>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="rounded-full border border-[#E8F5EE] bg-white p-3 shadow-sm transition-all hover:border-[#FFD600] hover:bg-[#FFF9CC]"
          >
            <ArrowUp className="h-5 w-5 text-[#00843D]" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

