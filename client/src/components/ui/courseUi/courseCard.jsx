import { fmt } from "./fmt";

export default function CourseCard({ course, onNavigate }) {
  // Map icons dynamically based on structural course data
  const stats = [
    {
      label: course.duration,
      icon: (
        <svg className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: `${course.modulesCount} Modules`,
      icon: (
        <svg className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m11.142 0L21.75 12l-4.179-2.25M12 5.75L6.43 8.75 12 11.75l5.57-3L12 5.75zm0 12.5l-5.57-3L12 18.25l5.57-3-5.57 3z" />
        </svg>
      )
    },
    {
      label: `${course.projectsCount} Projects`,
      icon: (
        <svg className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .414-.336.75-.75.75H4.5a.75.75 0 01-.75-.75v-4.25m16.5 0a2.25 2.25 0 00-2.25-2.25H10.5m10.5 0l-5.14-5.14a2.25 2.25 0 00-3.18 0L4.5 11.9m0 2.25a2.25 2.25 0 01-2.25-2.25v-2.25a2.25 2.25 0 012.25-2.25h15a2.25 2.25 0 012.25 2.25v2.25a2.25 2.25 0 01-2.25 2.25" />
        </svg>
      )
    }
  ];

  return (
    <div className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-violet-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-900/20 flex flex-col">
      {/* Thumbnail */}
      <div className="relative overflow-hidden h-48">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        <span className="absolute top-3 left-3 bg-violet-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
          {course.category}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-white text-lg leading-tight mb-1">{course.title}</h3>
        <p className="text-slate-400 text-sm mb-4 leading-relaxed">{course.subtitle}</p>

        {/* Stats Grid Loops cleanly using your new SVGs */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {stats.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5 text-xs text-slate-400">
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {course.certificateAvailable && (
            <span className="flex items-center gap-1.5 text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-700/40 px-2.5 py-1 rounded-full">
              <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Certificate Included
            </span>
          )}
          {course.liveClassesAvailable && (
            <span className="flex items-center gap-1.5 text-xs bg-blue-900/40 text-blue-400 border border-blue-700/40 px-2.5 py-1 rounded-full">
              <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Live Classes Included
            </span>
          )}
        </div>

        {/* Pricing */}
        <div className="mb-5 mt-auto">
          <div className="text-2xl font-black text-white">{fmt(course.price)}</div>
          {course.installmentEnabled && (
            <div className="text-sm text-slate-400 mt-0.5">
              or {fmt(course.installmentAmount)} × {course.installmentCount}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate(course.slug)}
            className="flex-1 border border-slate-700 hover:border-violet-500 text-slate-300 hover:text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
          >
            View Details
          </button>
          <button
            onClick={() => onNavigate(course.slug)}
            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
          >
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
}
