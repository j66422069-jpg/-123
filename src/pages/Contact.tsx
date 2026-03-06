import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Mail, Instagram, Phone, Download, Copy, Check, ExternalLink } from "lucide-react";
import { ContactData } from "../types";

export default function Contact() {
  const [data, setData] = useState<ContactData>({
    email: "email@example.com",
    instagramUrl: "https://instagram.com",
    instagramText: "@cinematographer",
    phone: "010-0000-0000",
    resumeUrl: ""
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await fetch("api/content");
        if (res.ok) {
          const allContent = await res.json();
          setData({
            email: allContent.contact_email || "email@example.com",
            instagramUrl: allContent.contact_instagramUrl || "https://instagram.com",
            instagramText: allContent.contact_instagramText || "@cinematographer",
            phone: allContent.contact_phone || "010-0000-0000",
            resumeUrl: allContent.contact_resumeUrl || ""
          });
        }
      } catch (error) {
        console.error("Failed to fetch contact:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, []);

  const handleCopy = (text: string, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-20 text-black/20 font-bold tracking-widest uppercase">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-20">
          <h2 className="text-xs font-bold tracking-[0.3em] text-black/40 uppercase mb-4">
            Get in Touch
          </h2>
          <h1 className="text-4xl font-bold tracking-tight mb-8">연락처</h1>
          <p className="text-lg text-black/60 max-w-2xl leading-relaxed">
            새로운 프로젝트 제안이나 협업 문의는 언제든 환영합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Email */}
          <div className="p-10 bg-white border border-black/5 flex flex-col items-center text-center group">
            <div className="w-12 h-12 bg-black/5 flex items-center justify-center rounded-full mb-6 group-hover:bg-black group-hover:text-white transition-all">
              <Mail size={20} />
            </div>
            <h3 className="text-xs font-bold tracking-widest text-black/40 uppercase mb-4">Email</h3>
            <p className="text-sm font-bold mb-6">{data.email}</p>
            <button
              onClick={() => handleCopy(data.email, "email")}
              className="px-6 py-2 border border-black/10 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 hover:bg-black/5 transition-colors"
            >
              {copied === "email" ? <Check size={12} /> : <Copy size={12} />}
              {copied === "email" ? "COPIED" : "COPY"}
            </button>
          </div>

          {/* Phone */}
          <div className="p-10 bg-white border border-black/5 flex flex-col items-center text-center group">
            <div className="w-12 h-12 bg-black/5 flex items-center justify-center rounded-full mb-6 group-hover:bg-black group-hover:text-white transition-all">
              <Phone size={20} />
            </div>
            <h3 className="text-xs font-bold tracking-widest text-black/40 uppercase mb-4">Phone</h3>
            <p className="text-sm font-bold mb-6">{data.phone}</p>
            <button
              onClick={() => handleCopy(data.phone, "phone")}
              className="px-6 py-2 border border-black/10 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 hover:bg-black/5 transition-colors"
            >
              {copied === "phone" ? <Check size={12} /> : <Copy size={12} />}
              {copied === "phone" ? "COPIED" : "COPY"}
            </button>
          </div>

          {/* Instagram */}
          <div className="p-10 bg-white border border-black/5 flex flex-col items-center text-center group">
            <div className="w-12 h-12 bg-black/5 flex items-center justify-center rounded-full mb-6 group-hover:bg-black group-hover:text-white transition-all">
              <Instagram size={20} />
            </div>
            <h3 className="text-xs font-bold tracking-widest text-black/40 uppercase mb-4">Instagram</h3>
            <p className="text-sm font-bold mb-6">{data.instagramText || "@cinematographer"}</p>
            <a
              href={data.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 border border-black/10 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 hover:bg-black/5 transition-colors"
            >
              VISIT <ExternalLink size={12} />
            </a>
          </div>

          {/* Resume */}
          <div className="p-10 bg-white border border-black/5 flex flex-col items-center text-center group">
            <div className="w-12 h-12 bg-black/5 flex items-center justify-center rounded-full mb-6 group-hover:bg-black group-hover:text-white transition-all">
              <Download size={20} />
            </div>
            <h3 className="text-xs font-bold tracking-widest text-black/40 uppercase mb-4">Resume</h3>
            <p className="text-sm font-bold mb-6">이력서 다운로드</p>
            <a
              href={data.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-black text-white text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 hover:bg-black/90 transition-colors"
            >
              DOWNLOAD <Download size={12} />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
