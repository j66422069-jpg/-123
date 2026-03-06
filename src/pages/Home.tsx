import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Download } from "lucide-react";
import { motion } from "motion/react";
import { HomeData, ProjectData } from "../types";

export default function Home() {
  const [data, setData] = useState<HomeData>({
    name: "Director Name",
    role: "Cinematographer / Director",
    tagline: "Capturing moments that tell a story.",
    resumeUrl: "",
    featuredProjectIds: []
  });
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentRes, projectsRes] = await Promise.all([
          fetch("api/content?key=home"),
          fetch("api/projects")
        ]);

        if (contentRes.ok) {
          const contentJson = await contentRes.json();
          if (contentJson) setData(prev => ({ ...prev, ...contentJson }));
        } else {
          console.error("Home content fetch failed:", contentRes.statusText);
        }

        if (projectsRes.ok) {
          const projectsJson = await projectsRes.json();
          if (Array.isArray(projectsJson)) setProjects(projectsJson);
        } else {
          console.error("Projects fetch failed:", projectsRes.statusText);
        }
      } catch (error) {
        console.error("Failed to fetch home data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const featuredProjects = (Array.isArray(projects) ? projects : []).filter(p => Boolean(p.featured));
  const displayProjects = featuredProjects.length > 0 ? featuredProjects : (Array.isArray(projects) ? projects : []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      {/* Hero Section */}
      <section className="mb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-xs font-bold tracking-[0.3em] text-black/40 uppercase mb-4">
            {data.role}
          </h2>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">
            {data.name}
          </h1>
          <p className="text-xl md:text-2xl text-black/60 max-w-2xl leading-relaxed mb-12">
            {data.tagline}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link
              to="/projects"
              className="px-8 py-4 bg-black text-white text-sm font-medium tracking-widest flex items-center gap-2 hover:bg-black/90 transition-colors"
            >
              PROJECTS <ChevronRight size={16} />
            </Link>
            <a
              href={data.resumeUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border border-black/10 text-sm font-medium tracking-widest flex items-center gap-2 hover:bg-black/5 transition-colors"
            >
              이력서 다운로드 <Download size={16} />
            </a>
          </div>
        </motion.div>
      </section>

      {/* Featured Projects Grid */}
      <section>
        <div className="flex items-end justify-between mb-12">
          <div>
            <h3 className="text-xs font-bold tracking-[0.3em] text-black/40 uppercase mb-2">
              Featured Work
            </h3>
            <h2 className="text-3xl font-bold tracking-tight">주요 작업</h2>
          </div>
          <Link to="/projects" className="text-xs font-bold tracking-widest border-b border-black pb-1 hover:text-black/60 hover:border-black/60 transition-all">
            VIEW ALL
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/projects/${project.id}`} className="group block">
                <div className="aspect-[16/9] overflow-hidden bg-black/5 mb-4">
                  <img
                    src={project.thumbnailUrl || "https://picsum.photos/seed/project/800/450"}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold tracking-tight group-hover:text-black/60 transition-colors">
                      {project.title}
                    </h4>
                    <p className="text-xs text-black/40 font-medium tracking-widest uppercase mt-1">
                      {project.year} — {project.type}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-black/20 group-hover:text-black transition-colors">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
