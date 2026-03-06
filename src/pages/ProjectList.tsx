import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ProjectData } from "../types";

export default function ProjectList() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("api/projects");
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json)) setProjects(json);
        } else {
          console.error("Projects fetch failed:", res.statusText);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-20 text-black/20 font-bold tracking-widest uppercase">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-16">
          <h2 className="text-xs font-bold tracking-[0.3em] text-black/40 uppercase mb-4">
            Project Archive
          </h2>
          <h1 className="text-4xl font-bold tracking-tight">프로젝트 목록</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/projects/${project.id}`} className="group block">
                <div className="aspect-[16/9] overflow-hidden bg-black/5 mb-6 border border-black/5">
                  <img
                    src={project.thumbnailUrl || "https://picsum.photos/seed/project/800/450"}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold tracking-tight group-hover:text-black/60 transition-colors">
                      {project.title}
                    </h3>
                    <span className="text-xs font-bold text-black/20">{project.year}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-black/5 text-[10px] font-bold tracking-widest uppercase text-black/40">
                      {project.type}
                    </span>
                    <span className="px-2 py-1 bg-black/5 text-[10px] font-bold tracking-widest uppercase text-black/40">
                      {project.role}
                    </span>
                  </div>
                  <p className="text-sm text-black/60 leading-relaxed line-clamp-2">
                    {project.summary}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
