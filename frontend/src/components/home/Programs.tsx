import { BookOpenCheck, ClipboardList, GraduationCap, MonitorCog, ShieldCheck } from "lucide-react";
import { yabatechImages } from "@/lib/yabatechImages";

const focusAreas = [
  {
    title: "Student Records",
    icon: GraduationCap,
    desc: "Profile management, class allocation, and identity-aware access across the portal.",
    tags: ["Students", "Classes", "Profiles"],
    image: yabatechImages.secondGate,
    imageAlt: "YabaTech second gate",
  },
  {
    title: "Course Registration",
    icon: ClipboardList,
    desc: "A guided flow that helps students choose and save the right courses for the active session.",
    tags: ["Selection", "Registration", "Session"],
    image: yabatechImages.library,
    imageAlt: "YabaTech library building",
  },
  {
    title: "Result Processing",
    icon: BookOpenCheck,
    desc: "Teachers can enter CA and exam scores while the system computes totals and grades clearly.",
    tags: ["Scores", "Grades", "Summary"],
    image: yabatechImages.mechanicalWorkshop,
    imageAlt: "Mechanical workshop at YabaTech",
  },
  {
    title: "System Administration",
    icon: MonitorCog,
    desc: "Admins manage users, courses, classes, and school setup records from one dashboard.",
    tags: ["Users", "Courses", "Setup"],
    image: yabatechImages.newBuilding,
    imageAlt: "New building at YabaTech",
  },
  {
    title: "Controlled Access",
    icon: ShieldCheck,
    desc: "Role-based access keeps student, teacher, and admin actions separated and secure.",
    tags: ["Auth", "Permissions", "Security"],
    image: yabatechImages.scienceComplex,
    imageAlt: "Science and Technology Complex at YabaTech",
  },
];

const Programs = () => {
  return (
    <section id="programs" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#00843D]">Key Modules</h2>
            <h3 className="max-w-3xl text-4xl font-black tracking-tight text-[#111111] md:text-5xl">
              The modules that make the school workflow feel complete
            </h3>
          </div>
          <p className="max-w-xl text-base leading-7 text-[#4B5563]">
            The project stays focused on the core school operations that matter most: course setup,
            registration, result entry, and role-based control.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {focusAreas.map((program) => (
            <div
              key={program.title}
              className="group relative overflow-hidden rounded-[2rem] border border-[#E8F5EE] bg-white shadow-[0_18px_44px_rgba(0,132,61,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FFD600] hover:shadow-[0_26px_56px_rgba(0,132,61,0.12)]"
            >
              <div className="relative h-48 overflow-hidden bg-[#E8F5EE]">
                <img
                  src={program.image}
                  alt={program.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/70 via-[#111111]/8 to-transparent" />
                <div className="absolute bottom-4 left-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/50 bg-white/92 text-[#00843D] shadow-sm backdrop-blur">
                  <program.icon className="h-7 w-7" />
                </div>
              </div>

              <div className="relative z-10 p-8">
                <div className="absolute right-5 top-5 opacity-[0.08] transition-opacity group-hover:opacity-[0.14]">
                  <program.icon size={82} className="text-[#00843D]" />
                </div>
                <h4 className="mb-3 text-2xl font-bold text-[#111111]">{program.title}</h4>
                <p className="mb-6 leading-7 text-[#4B5563]">{program.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {program.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-[#FFD600] bg-[#FFF9CC] px-3 py-1 text-xs font-semibold text-[#111111]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs;




