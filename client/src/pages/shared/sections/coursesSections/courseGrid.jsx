import { useNavigate } from "react-router-dom";
import CourseCard from "../../../../components/ui/courseUi/courseCard";

export default function CourseGrid({ filtered, categories, category, setCategory }) {
  const navigate = useNavigate();

  // Logic to handle routing
  const handleNavigation = (slug) => {
    navigate(`/courses/${slug}`);
  };

  return (
    <section className="px-6 pb-20 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">
          {filtered.length} {filtered.length === 1 ? "Course" : "Courses"} Available
        </h2>
        <div className="flex gap-2 flex-wrap">
          {categories.slice(1).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === category ? "All" : cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                category === cat
                  ? "bg-violet-600 border-violet-600 text-white"
                  : "border-slate-700 text-slate-400 hover:border-violet-500 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          No courses match your filters. Try adjusting them.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((c) => (
            <CourseCard 
              key={c.slug} 
              course={c} 
              onNavigate={handleNavigation} 
            />
          ))}
        </div>
      )}
    </section>
  );
}