import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import Programs from "@/components/home/Programs";
import Footer from "@/components/home/Footer";
import { CheckCircle2, FileCheck2, NotebookTabs, ShieldCheck } from "lucide-react";
import { yabatechImages } from "@/lib/yabatechImages";

const featureCards = [
  {
    title: "Course Registration",
    description:
      "Students can select and save their courses for the active academic year from one guided workflow.",
    icon: NotebookTabs,
  },
  {
    title: "Result Management",
    description:
      "Teachers and administrators can record scores, compute grades, and publish academic performance.",
    icon: FileCheck2,
  },
  {
    title: "Role-Based Access",
    description:
      "Separate access for admins, teachers, and students keeps school records organized and secure.",
    icon: ShieldCheck,
  },
];

const Home = () => {
  return (
    <div className="bg-background">
      <Navbar />
      <main>
        <Hero />

        <section className="border-y border-[#E8F5EE] bg-white py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                "Student Registration",
                "Teacher Result Entry",
                "Published Results",
                "Academic Year Control",
                "Role-Based Access",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#E8F5EE] bg-[#F5F7FA] px-4 py-2 text-sm font-semibold text-[#111111] shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="overview" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="space-y-4">
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#00843D]">Why It Works</p>
                <h2 className="max-w-3xl text-4xl font-black tracking-tight text-[#111111] md:text-5xl">
                  Built around the academic tasks schools actually repeat every session
                </h2>
              </div>
              <p className="max-w-xl text-base leading-7 text-[#4B5563]">
                The portal stays intentionally focused on course registration and result handling,
                with clear role separation for students, teachers, and administrators.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {featureCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-[2rem] border border-[#E8F5EE] bg-white p-8 shadow-[0_20px_50px_rgba(0,132,61,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FFD600]"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F5EE] text-[#00843D]">
                    <card.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-[#111111]">{card.title}</h3>
                  <p className="leading-7 text-[#4B5563]">{card.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
            <div className="overflow-hidden rounded-[2rem] border border-[#E8F5EE] bg-white shadow-[0_20px_50px_rgba(0,132,61,0.08)]">
              <img
                src={yabatechImages.lecturerClass}
                alt="Lecturer teaching students at Yaba College of Technology"
                loading="lazy"
                decoding="async"
                className="h-full min-h-[340px] w-full object-cover"
              />
            </div>

            <div className="space-y-6">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#00843D]">About The System</p>
              <h3 className="max-w-2xl text-4xl font-black leading-tight text-[#111111] md:text-5xl">
                A practical school project with real academic workflow logic
              </h3>
              <p className="max-w-2xl text-base leading-8 text-[#4B5563]">
                This system connects student registration, teacher score entry, and published
                results in one smooth process. It is designed to feel realistic, presentable, and
                easy to explain during project review.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "Students can register their courses online",
                  "Teachers can upload CA and exam scores",
                  "Admins can manage classes, users, and sessions",
                  "Results are calculated and displayed clearly",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-[#E8F5EE] bg-white p-4 shadow-sm">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#00843D]" />
                    <p className="text-sm leading-7 text-[#4B5563]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Stats />
        <Programs />

        <section className="relative overflow-hidden py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-[#E8F5EE] bg-[linear-gradient(135deg,#00843D_0%,#006B31_62%,#006B31_100%)] p-12 text-center shadow-[0_30px_70px_rgba(0,132,61,0.26)] md:p-16">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,214,0,0.26),transparent_30%)]" />
              <div className="relative z-10 mx-auto max-w-3xl">
                <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-[#FFF9CC]">Ready To Try It</p>
                <h2 className="mb-6 text-4xl font-black text-white md:text-5xl">
                  Enter the portal and explore the full school workflow
                </h2>
                <p className="mx-auto mb-10 max-w-2xl text-lg leading-8 text-white/88">
                  Test course registration, result entry, and student result checking through one
                  modern YabaTech project interface.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <a
                    href="/login"
                    className="rounded-full bg-[#FFD600] px-10 py-4 text-lg font-bold text-[#111111] transition-transform hover:-translate-y-1 hover:bg-[#E6B800]"
                  >
                    Open Portal
                  </a>
                  <a
                    href="#programs"
                    className="rounded-full border border-white/40 bg-white/12 px-10 py-4 text-lg font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/18"
                  >
                    View Modules
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;




