import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("portfolio.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    year TEXT,
    type TEXT,
    role TEXT,
    summary TEXT,
    featured INTEGER DEFAULT 0,
    thumbnailUrl TEXT,
    tech_camera TEXT,
    tech_lens TEXT,
    tech_lighting TEXT,
    tech_color TEXT
  );

  CREATE TABLE IF NOT EXISTS project_videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    title TEXT,
    description TEXT,
    youtubeUrl TEXT,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    name TEXT,
    note TEXT
  );
`);

// Helper to get/set settings
const getSetting = (key: string, defaultValue: any) => {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  return row ? JSON.parse(row.value) : defaultValue;
};

const setSetting = (key: string, value: any) => {
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, JSON.stringify(value));
};

// Initial Data if empty
if (!db.prepare("SELECT key FROM settings WHERE key = 'home'").get()) {
  setSetting("home", {
    name: "홍길동",
    role: "촬영감독 (Cinematographer)",
    tagline: "빛과 구도로 이야기의 깊이를 더하는 촬영감독 홍길동입니다.",
    resumeUrl: "",
    featuredProjectIds: []
  });
  setSetting("about", {
    profileImageUrl: "https://picsum.photos/seed/profile/400/500",
    introText: "안녕하세요. 현장의 공기를 담아내는 촬영감독입니다. 다수의 단편영화와 광고 작업을 통해 탄탄한 기본기를 쌓아왔습니다.",
    capabilities: ["디지털 시네마토그래피", "조명 설계 및 운용", "DaVinci Resolve 색보정"],
    careers: ["2023 - 현재: 프리랜서 촬영감독", "2021 - 2023: AA 프로덕션 촬영팀", "2020: 한국예술종합학교 영상원 졸업"]
  });
  setSetting("contact", {
    email: "director@example.com",
    instagramUrl: "https://instagram.com",
    instagramText: "@cinematographer",
    phone: "010-1234-5678",
    resumeUrl: ""
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get("/api/home", (req, res) => res.json(getSetting("home", {})));
  app.post("/api/home", (req, res) => {
    setSetting("home", req.body);
    res.json({ success: true });
  });

  app.get("/api/about", (req, res) => res.json(getSetting("about", {})));
  app.post("/api/about", (req, res) => {
    setSetting("about", req.body);
    res.json({ success: true });
  });

  app.get("/api/contact", (req, res) => res.json(getSetting("contact", {})));
  app.post("/api/contact", (req, res) => {
    setSetting("contact", req.body);
    res.json({ success: true });
  });

  // Projects
  app.get("/api/projects", (req, res) => {
    const projects = db.prepare("SELECT * FROM projects ORDER BY year DESC").all() as any[];
    const transformed = projects.map(p => ({
      ...p,
      tech: {
        camera: p.tech_camera,
        lens: p.tech_lens,
        lighting: p.tech_lighting,
        color: p.tech_color
      }
    }));
    res.json(transformed);
  });

  app.get("/api/projects/:id", (req, res) => {
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id) as any;
    if (project) {
      project.tech = {
        camera: project.tech_camera,
        lens: project.tech_lens,
        lighting: project.tech_lighting,
        color: project.tech_color
      };
      project.videos = db.prepare("SELECT * FROM project_videos WHERE project_id = ?").all(req.params.id);
      res.json(project);
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  app.post("/api/projects", (req, res) => {
    const { title, year, type, role, summary, featured, thumbnailUrl, tech, videos } = req.body;
    const info = db.prepare(`
      INSERT INTO projects (title, year, type, role, summary, featured, thumbnailUrl, tech_camera, tech_lens, tech_lighting, tech_color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title ?? null, 
      year ?? null, 
      type ?? null, 
      role ?? null, 
      summary ?? null, 
      featured ? 1 : 0, 
      thumbnailUrl ?? null, 
      tech?.camera ?? null, 
      tech?.lens ?? null, 
      tech?.lighting ?? null, 
      tech?.color ?? null
    );
    
    const projectId = info.lastInsertRowid;
    if (videos && Array.isArray(videos)) {
      const stmt = db.prepare("INSERT INTO project_videos (project_id, title, description, youtubeUrl) VALUES (?, ?, ?, ?)");
      for (const v of videos) {
        stmt.run(projectId, v.title, v.description, v.youtubeUrl);
      }
    }
    res.json({ id: projectId });
  });

  app.put("/api/projects/:id", (req, res) => {
    const { title, year, type, role, summary, featured, thumbnailUrl, tech, videos } = req.body;
    db.prepare(`
      UPDATE projects SET 
        title = ?, year = ?, type = ?, role = ?, summary = ?, featured = ?, thumbnailUrl = ?,
        tech_camera = ?, tech_lens = ?, tech_lighting = ?, tech_color = ?
      WHERE id = ?
    `).run(
      title ?? null, 
      year ?? null, 
      type ?? null, 
      role ?? null, 
      summary ?? null, 
      featured ? 1 : 0, 
      thumbnailUrl ?? null, 
      tech?.camera ?? null, 
      tech?.lens ?? null, 
      tech?.lighting ?? null, 
      tech?.color ?? null, 
      req.params.id
    );

    db.prepare("DELETE FROM project_videos WHERE project_id = ?").run(req.params.id);
    if (videos && Array.isArray(videos)) {
      const stmt = db.prepare("INSERT INTO project_videos (project_id, title, description, youtubeUrl) VALUES (?, ?, ?, ?)");
      for (const v of videos) {
        stmt.run(req.params.id, v.title, v.description, v.youtubeUrl);
      }
    }
    res.json({ success: true });
  });

  app.delete("/api/projects/:id", (req, res) => {
    db.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);
    db.prepare("DELETE FROM project_videos WHERE project_id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Equipment
  app.get("/api/equipment", (req, res) => {
    const items = db.prepare("SELECT * FROM equipment").all();
    res.json(items);
  });

  app.post("/api/equipment", (req, res) => {
    const { category, name, note } = req.body;
    const info = db.prepare("INSERT INTO equipment (category, name, note) VALUES (?, ?, ?)").run(category ?? null, name ?? null, note ?? null);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/equipment/:id", (req, res) => {
    const { category, name, note } = req.body;
    db.prepare("UPDATE equipment SET category = ?, name = ?, note = ? WHERE id = ?").run(category ?? null, name ?? null, note ?? null, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/equipment/:id", (req, res) => {
    db.prepare("DELETE FROM equipment WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
