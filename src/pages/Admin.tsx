import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, Trash2, Save, Edit2, X, Upload, PlusCircle, Trash } from "lucide-react";
import { HomeData, AboutData, ProjectData, EquipmentItem, ContactData, VideoData } from "../types";

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("home");

  // Data States
  const [home, setHome] = useState<HomeData>({
    name: "", role: "", tagline: "", resumeUrl: "", featuredProjectIds: []
  });
  const [about, setAbout] = useState<AboutData>({
    profileImageUrl: "", introText: "", capabilities: [], careers: []
  });
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [contact, setContact] = useState<ContactData>({
    email: "", instagramUrl: "", instagramText: "", phone: "", resumeUrl: ""
  });

  useEffect(() => {
    if (isLoggedIn) {
      const fetchData = async () => {
        try {
          const [homeRes, aboutRes, projectsRes, equipmentRes, contactRes] = await Promise.all([
            fetch("api/content?key=home"),
            fetch("api/content?key=about"),
            fetch("api/projects"),
            fetch("api/equipment"),
            fetch("api/content?key=contact")
          ]);

          if (homeRes.ok) {
            const json = await homeRes.json();
            if (json) setHome(prev => ({ ...prev, ...json }));
          }
          if (aboutRes.ok) {
            const json = await aboutRes.json();
            if (json) setAbout(prev => ({ ...prev, ...json }));
          }
          if (projectsRes.ok) {
            const json = await projectsRes.json();
            if (Array.isArray(json)) setProjects(json);
          }
          if (equipmentRes.ok) {
            const json = await equipmentRes.json();
            if (Array.isArray(json)) setEquipment(json);
          }
          if (contactRes.ok) {
            const json = await contactRes.json();
            if (json) setContact(prev => ({ ...prev, ...json }));
          }
        } catch (error) {
          console.error("Failed to fetch admin data:", error);
        }
      };
      fetchData();
    }
  }, [isLoggedIn]);

  // Editing States
  const [editingProject, setEditingProject] = useState<Partial<ProjectData> | null>(null);
  const [editingEquipmentId, setEditingEquipmentId] = useState<number | string | null>(null);
  const [equipmentForm, setEquipmentForm] = useState({ name: "", note: "" });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "0901") {
      setIsLoggedIn(true);
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  };

  const saveHome = async () => {
    await fetch("api/content", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-admin-token": password
      },
      body: JSON.stringify({ key: "home", value: home }),
    });
    alert("저장되었습니다.");
  };

  const saveAbout = async () => {
    await fetch("api/content", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-admin-token": password
      },
      body: JSON.stringify({ key: "about", value: about }),
    });
    alert("저장되었습니다.");
  };

  const saveContact = async () => {
    await fetch("api/content", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-admin-token": password
      },
      body: JSON.stringify({ key: "contact", value: contact }),
    });
    alert("저장되었습니다.");
  };

  const saveProject = async () => {
    if (!editingProject) return;
    const method = editingProject.id ? "PUT" : "POST";
    const url = editingProject.id ? `api/projects?id=${editingProject.id}` : "api/projects";
    
    await fetch(url, {
      method,
      headers: { 
        "Content-Type": "application/json",
        "x-admin-token": password
      },
      body: JSON.stringify(editingProject),
    });
    
    setEditingProject(null);
    fetch("api/projects").then(res => res.json()).then(setProjects);
    alert("저장되었습니다.");
  };

  const deleteProject = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`api/projects?id=${id}`, { 
      method: "DELETE",
      headers: { "x-admin-token": password }
    });
    fetch("api/projects").then(res => res.json()).then(setProjects);
  };

  const saveEquipment = async (item: EquipmentItem) => {
    const method = item.id ? "PUT" : "POST";
    const url = item.id ? `api/equipment?id=${item.id}` : "api/equipment";
    await fetch(url, {
      method,
      headers: { 
        "Content-Type": "application/json",
        "x-admin-token": password
      },
      body: JSON.stringify(item),
    });
    fetch("api/equipment").then(res => res.json()).then(setEquipment);
  };

  const deleteEquipment = async (id: number) => {
    await fetch(`api/equipment?id=${id}`, { 
      method: "DELETE",
      headers: { "x-admin-token": password }
    });
    fetch("api/equipment").then(res => res.json()).then(setEquipment);
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const res = await fetch("api/upload", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-admin-token": password
          },
          body: JSON.stringify({ image: reader.result as string }),
        });
        const { url } = await res.json();
        setEditingProject(prev => prev ? { ...prev, thumbnailUrl: url } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAboutImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && about) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const res = await fetch("api/upload", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-admin-token": password
          },
          body: JSON.stringify({ image: reader.result as string }),
        });
        const { url } = await res.json();
        setAbout({ ...about, profileImageUrl: url });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm p-12 bg-white border border-black/5 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight mb-8 text-center">ADMIN LOGIN</h1>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-black/10 text-sm mb-6 focus:outline-none focus:border-black transition-colors"
          />
          <button type="submit" className="w-full py-4 bg-black text-white text-xs font-bold tracking-widest uppercase hover:bg-black/90 transition-colors">
            LOGIN
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Tabs */}
        <div className="md:w-64 shrink-0">
          <h2 className="text-xs font-bold tracking-[0.3em] text-black/40 uppercase mb-8">Admin Dashboard</h2>
          <div className="flex flex-col space-y-2">
            {["home", "about", "projects", "equipment", "contact"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-left px-6 py-4 text-xs font-bold tracking-widest uppercase transition-all ${
                  activeTab === tab ? "bg-black text-white" : "hover:bg-black/5 text-black/40"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white border border-black/5 p-12">
          {activeTab === "home" && (
            <div className="space-y-8">
              <h3 className="text-xl font-bold mb-8">HOME 설정</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-black/40 mb-2">이름</label>
                  <input
                    type="text"
                    value={home.name}
                    onChange={(e) => setHome({ ...home, name: e.target.value })}
                    className="w-full px-4 py-3 border border-black/10 text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-black/40 mb-2">직무</label>
                  <input
                    type="text"
                    value={home.role}
                    onChange={(e) => setHome({ ...home, role: e.target.value })}
                    className="w-full px-4 py-3 border border-black/10 text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-black/40 mb-2">한 줄 소개</label>
                  <textarea
                    value={home.tagline}
                    onChange={(e) => setHome({ ...home, tagline: e.target.value })}
                    className="w-full px-4 py-3 border border-black/10 text-sm focus:outline-none focus:border-black h-24"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-black/40 mb-2">이력서 링크 (Google Drive)</label>
                  <input
                    type="text"
                    value={home.resumeUrl}
                    onChange={(e) => setHome({ ...home, resumeUrl: e.target.value })}
                    className="w-full px-4 py-3 border border-black/10 text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>
              <button onClick={saveHome} className="px-8 py-4 bg-black text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                <Save size={16} /> SAVE CHANGES
              </button>
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-8">
              <h3 className="text-xl font-bold mb-8">ABOUT 설정</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-black/40 mb-2">프로필 이미지 업로드</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-32 bg-black/5 border border-black/5 overflow-hidden">
                      {about.profileImageUrl && <img src={about.profileImageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                    </div>
                    <label className="px-6 py-3 border border-black/10 text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:bg-black/5 transition-colors">
                      파일 선택
                      <input type="file" className="hidden" onChange={handleAboutImageUpload} accept="image/*" />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-black/40 mb-2">자기소개</label>
                  <textarea
                    value={about.introText}
                    onChange={(e) => setAbout({ ...about, introText: e.target.value })}
                    className="w-full px-4 py-3 border border-black/10 text-sm focus:outline-none focus:border-black h-48"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-black/40 mb-2">가능 업무 범위 (엔터로 구분)</label>
                  <textarea
                    value={(Array.isArray(about.capabilities) ? about.capabilities : []).join("\n")}
                    onChange={(e) => setAbout({ ...about, capabilities: e.target.value.split("\n") })}
                    className="w-full px-4 py-3 border border-black/10 text-sm focus:outline-none focus:border-black h-32"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-black/40 mb-2">경력 사항 (엔터로 구분)</label>
                  <textarea
                    value={(Array.isArray(about.careers) ? about.careers : []).join("\n")}
                    onChange={(e) => setAbout({ ...about, careers: e.target.value.split("\n") })}
                    className="w-full px-4 py-3 border border-black/10 text-sm focus:outline-none focus:border-black h-32"
                  />
                </div>
              </div>
              <button onClick={saveAbout} className="px-8 py-4 bg-black text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                <Save size={16} /> SAVE CHANGES
              </button>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">PROJECT 관리</h3>
                <button
                  onClick={() => setEditingProject({
                    title: "", year: "", type: "", role: "", summary: "", featured: false, thumbnailUrl: "",
                    tech: { camera: "", lens: "", lighting: "", color: "" },
                    videos: []
                  })}
                  className="px-6 py-3 bg-black text-white text-[10px] font-bold tracking-widest uppercase flex items-center gap-2"
                >
                  <Plus size={14} /> ADD PROJECT
                </button>
              </div>

              {editingProject ? (
                <div className="space-y-8 border-t border-black/5 pt-8">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold">{editingProject.id ? "프로젝트 수정" : "새 프로젝트 추가"}</h4>
                    <button onClick={() => setEditingProject(null)}><X size={20} /></button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest uppercase text-black/40 mb-2">제목</label>
                      <input
                        type="text"
                        value={editingProject.title || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                        className="w-full px-4 py-3 border border-black/10 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest uppercase text-black/40 mb-2">연도</label>
                      <input
                        type="text"
                        value={editingProject.year || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, year: e.target.value })}
                        className="w-full px-4 py-3 border border-black/10 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest uppercase text-black/40 mb-2">형태 (예: 단편영화, 광고)</label>
                      <input
                        type="text"
                        value={editingProject.type || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, type: e.target.value })}
                        className="w-full px-4 py-3 border border-black/10 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest uppercase text-black/40 mb-2">역할 (예: 촬영감독, 촬영팀)</label>
                      <input
                        type="text"
                        value={editingProject.role || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, role: e.target.value })}
                        className="w-full px-4 py-3 border border-black/10 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-widest uppercase text-black/40 mb-2">한 줄 요약</label>
                    <textarea
                      value={editingProject.summary || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, summary: e.target.value })}
                      className="w-full px-4 py-3 border border-black/10 text-sm focus:outline-none focus:border-black h-24"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest uppercase text-black/40 mb-2">썸네일 업로드</label>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-14 bg-black/5 border border-black/5 overflow-hidden">
                          {editingProject.thumbnailUrl && <img src={editingProject.thumbnailUrl} className="w-full h-full object-cover" />}
                        </div>
                        <label className="px-4 py-2 border border-black/10 text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:bg-black/5">
                          UPLOAD <input type="file" className="hidden" onChange={handleThumbnailUpload} accept="image/*" />
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={editingProject.featured}
                        onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                      />
                      <label htmlFor="featured" className="text-xs font-bold tracking-widest uppercase">주요 작업으로 표시 (HOME)</label>
                    </div>
                  </div>

                  {/* Tech Info */}
                  <div className="p-6 bg-black/5 space-y-4">
                    <h5 className="text-[10px] font-bold tracking-widest uppercase text-black/40">Technical Info</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {["camera", "lens", "lighting", "color"].map((key) => (
                        <div key={key}>
                          <label className="block text-[8px] font-bold tracking-widest uppercase text-black/40 mb-1">{key}</label>
                          <input
                            type="text"
                            value={(editingProject.tech as any)?.[key] || ""}
                            onChange={(e) => setEditingProject({
                              ...editingProject,
                              tech: { ...(editingProject.tech || {}), [key]: e.target.value }
                            })}
                            className="w-full px-2 py-2 border border-black/10 text-xs focus:outline-none focus:border-black"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Videos */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[10px] font-bold tracking-widest uppercase text-black/40">Videos (YouTube)</h5>
                      <button
                        onClick={() => setEditingProject({
                          ...editingProject,
                          videos: [...(editingProject.videos || []), { title: "", description: "", youtubeUrl: "" }]
                        })}
                        className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 text-black/60 hover:text-black"
                      >
                        <PlusCircle size={12} /> ADD VIDEO
                      </button>
                    </div>
                    <div className="space-y-4">
                      {(Array.isArray(editingProject.videos) ? editingProject.videos : []).map((v, idx) => (
                        <div key={idx} className="p-6 border border-black/10 relative">
                          <button
                            onClick={() => {
                              const newVideos = [...editingProject.videos!];
                              newVideos.splice(idx, 1);
                              setEditingProject({ ...editingProject, videos: newVideos });
                            }}
                            className="absolute top-4 right-4 text-black/20 hover:text-red-500"
                          >
                            <Trash size={16} />
                          </button>
                          <div className="grid grid-cols-1 gap-4">
                            <input
                              type="text"
                              placeholder="Video Title"
                              value={v.title}
                              onChange={(e) => {
                                const newVideos = [...(editingProject.videos || [])];
                                newVideos[idx] = { ...newVideos[idx], title: e.target.value };
                                setEditingProject({ ...editingProject, videos: newVideos });
                              }}
                              className="w-full px-3 py-2 border border-black/10 text-xs focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="YouTube URL"
                              value={v.youtubeUrl}
                              onChange={(e) => {
                                const newVideos = [...(editingProject.videos || [])];
                                newVideos[idx] = { ...newVideos[idx], youtubeUrl: e.target.value };
                                setEditingProject({ ...editingProject, videos: newVideos });
                              }}
                              className="w-full px-3 py-2 border border-black/10 text-xs focus:outline-none"
                            />
                            <textarea
                              placeholder="Description"
                              value={v.description}
                              onChange={(e) => {
                                const newVideos = [...(editingProject.videos || [])];
                                newVideos[idx] = { ...newVideos[idx], description: e.target.value };
                                setEditingProject({ ...editingProject, videos: newVideos });
                              }}
                              className="w-full px-3 py-2 border border-black/10 text-xs focus:outline-none h-20"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button onClick={saveProject} className="w-full py-4 bg-black text-white text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2">
                    <Save size={16} /> SAVE PROJECT
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {(Array.isArray(projects) ? projects : []).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-6 border border-black/5 hover:border-black/20 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-12 bg-black/5 overflow-hidden">
                          {p.thumbnailUrl && <img src={p.thumbnailUrl} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <h4 className="font-bold">{p.title}</h4>
                          <p className="text-[10px] font-bold tracking-widest text-black/40 uppercase">{p.year} — {p.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={async () => {
                            const res = await fetch(`api/projects?id=${p.id}`);
                            if (res.ok) {
                              const fullProject = await res.json();
                              setEditingProject(fullProject);
                            }
                          }} 
                          className="p-2 text-black/40 hover:text-black"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => deleteProject(p.id!)} className="p-2 text-black/40 hover:text-red-500"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "equipment" && (
            <div className="space-y-8">
              <h3 className="text-xl font-bold mb-8">EQUIPMENT 관리</h3>
              <div className="space-y-12">
                {["Camera", "Lens", "Lighting", "Color"].map((cat) => (
                  <div key={cat} className="space-y-4">
                <div className="flex items-center justify-between border-b border-black/10 pb-2">
                  <h4 className="text-sm font-bold tracking-widest uppercase">{cat}</h4>
                  <button
                    onClick={() => {
                      setEditingEquipmentId(`new-${cat}`);
                      setEquipmentForm({ name: "", note: "" });
                    }}
                    className="text-[10px] font-bold tracking-widest uppercase text-black/40 hover:text-black"
                  >
                    + ADD ITEM
                  </button>
                </div>
                    <div className="grid grid-cols-1 gap-2">
                      {(Array.isArray(equipment) ? equipment : []).filter(e => e.category === cat).map((item) => (
                        <div key={item.id}>
                          {editingEquipmentId === item.id ? (
                            <div className="p-4 bg-black/5 space-y-3 border border-black/20">
                              <input
                                type="text"
                                placeholder="장비명"
                                value={equipmentForm.name}
                                onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
                                className="w-full px-3 py-2 border border-black/10 text-sm focus:outline-none"
                              />
                              <input
                                type="text"
                                placeholder="운용 역량 또는 특징"
                                value={equipmentForm.note}
                                onChange={(e) => setEquipmentForm({ ...equipmentForm, note: e.target.value })}
                                className="w-full px-3 py-2 border border-black/10 text-sm focus:outline-none"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={async () => {
                                    await saveEquipment({ ...item, ...equipmentForm });
                                    setEditingEquipmentId(null);
                                  }}
                                  className="px-4 py-2 bg-black text-white text-[10px] font-bold tracking-widest uppercase"
                                >
                                  SAVE
                                </button>
                                <button
                                  onClick={() => setEditingEquipmentId(null)}
                                  className="px-4 py-2 border border-black/10 text-[10px] font-bold tracking-widest uppercase"
                                >
                                  CANCEL
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-4 bg-black/5">
                              <div>
                                <p className="text-sm font-bold">{item.name}</p>
                                <p className="text-[10px] text-black/40 italic">{item.note}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingEquipmentId(item.id!);
                                    setEquipmentForm({ name: item.name, note: item.note });
                                  }}
                                  className="p-1 text-black/20 hover:text-black"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={() => deleteEquipment(item.id!)} className="p-1 text-black/20 hover:text-red-500">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {editingEquipmentId === `new-${cat}` && (
                        <div className="p-4 bg-black/5 space-y-3 border-2 border-black/10">
                          <input
                            type="text"
                            placeholder="장비명"
                            value={equipmentForm.name}
                            onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-black/10 text-sm focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="운용 역량 또는 특징"
                            value={equipmentForm.note}
                            onChange={(e) => setEquipmentForm({ ...equipmentForm, note: e.target.value })}
                            className="w-full px-3 py-2 border border-black/10 text-sm focus:outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                if (!equipmentForm.name) return alert("장비명을 입력하세요.");
                                await saveEquipment({ category: cat as any, ...equipmentForm });
                                setEditingEquipmentId(null);
                              }}
                              className="px-4 py-2 bg-black text-white text-[10px] font-bold tracking-widest uppercase"
                            >
                              SAVE
                            </button>
                            <button
                              onClick={() => setEditingEquipmentId(null)}
                              className="px-4 py-2 border border-black/10 text-[10px] font-bold tracking-widest uppercase"
                            >
                              CANCEL
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-8">
              <h3 className="text-xl font-bold mb-8">CONTACT 설정</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-black/40 mb-2">Email</label>
                  <input
                    type="text"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    className="w-full px-4 py-3 border border-black/10 text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-black/40 mb-2">Phone</label>
                  <input
                    type="text"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-black/10 text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-black/40 mb-2">Instagram URL</label>
                  <input
                    type="text"
                    value={contact.instagramUrl}
                    onChange={(e) => setContact({ ...contact, instagramUrl: e.target.value })}
                    className="w-full px-4 py-3 border border-black/10 text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-black/40 mb-2">Instagram Text (e.g., @cinematographer)</label>
                  <input
                    type="text"
                    value={contact.instagramText || ""}
                    onChange={(e) => setContact({ ...contact, instagramText: e.target.value })}
                    className="w-full px-4 py-3 border border-black/10 text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-black/40 mb-2">이력서 링크 (Google Drive)</label>
                  <input
                    type="text"
                    value={contact.resumeUrl}
                    onChange={(e) => setContact({ ...contact, resumeUrl: e.target.value })}
                    className="w-full px-4 py-3 border border-black/10 text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>
              <button onClick={saveContact} className="px-8 py-4 bg-black text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                <Save size={16} /> SAVE CHANGES
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
