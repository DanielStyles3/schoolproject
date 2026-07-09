import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Database, FolderKanban, LineChart, UsersRound } from "lucide-react";

const data = [
  { stage: "Setup", records: 18, adoption: 8 },
  { stage: "Users", records: 42, adoption: 18 },
  { stage: "Courses", records: 64, adoption: 34 },
  { stage: "Registration", records: 86, adoption: 52 },
  { stage: "Results", records: 102, adoption: 73 },
];

const Stats = () => {
  return (
    <section id="stats" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 rounded-[2rem] border border-[#E8F5EE] bg-[linear-gradient(135deg,#FFFFFF_0%,#F5F7FA_50%,#FFF9CC_100%)] p-8 shadow-[0_24px_60px_rgba(0,132,61,0.08)] md:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-4">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#00843D]">System Impact</p>
              <h3 className="text-4xl font-black tracking-tight text-[#111111] md:text-5xl">
                A practical platform built around real academic data flow
              </h3>
            </div>
            <p className="max-w-2xl text-base leading-7 text-[#4B5563] lg:ml-auto">
              The workflow moves from academic setup to course selection and finally to published
              student results, with each stage reusing the same connected school records.
            </p>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-[#E8F5EE] bg-white p-8 shadow-[0_20px_48px_rgba(0,132,61,0.08)] lg:col-span-2">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xl font-bold text-[#111111]">Academic workflow growth</h4>
                <p className="mt-2 text-sm leading-6 text-[#4B5563]">Each stage adds more structure, users, and result data into one connected portal.</p>
              </div>
              <div className="rounded-full border border-[#FFD600] bg-[#FFF9CC] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#111111]">
                Shared Records
              </div>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="systemRecords" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00843D" stopOpacity={0.34} />
                      <stop offset="95%" stopColor="#00843D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F5EE" />
                  <XAxis dataKey="stage" stroke="#4B5563" fontSize={12} />
                  <YAxis stroke="#4B5563" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E8F5EE",
                      borderRadius: "16px",
                    }}
                  />
                  <Area type="monotone" dataKey="records" stroke="#00843D" fill="url(#systemRecords)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-5">
            {[
              {
                icon: UsersRound,
                title: "Multi-role workflow",
                desc: "Admins, teachers, and students all use the same system through role-specific experiences.",
              },
              {
                icon: FolderKanban,
                title: "Academic structure",
                desc: "Classes, courses, and academic years stay linked across registration and results.",
              },
              {
                icon: Database,
                title: "Consistent records",
                desc: "Course selections and teacher entries remain tied to each real student account.",
              },
              {
                icon: LineChart,
                title: "Performance summary",
                desc: "Students can review grades, totals, and GPA-style summaries from one results area.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-[1.5rem] border border-[#E8F5EE] bg-white p-5 shadow-[0_14px_30px_rgba(0,132,61,0.06)] transition-all hover:-translate-y-0.5 hover:border-[#FFD600]"
              >
                <div className="rounded-2xl bg-[#E8F5EE] p-3 text-[#00843D]">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h5 className="font-bold text-[#111111]">{item.title}</h5>
                  <p className="mt-1 text-sm leading-6 text-[#4B5563]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;