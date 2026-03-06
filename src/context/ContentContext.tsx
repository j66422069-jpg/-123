import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface ContentContextType {
  content: any;
  loading: boolean;
  fetchContent: (force?: boolean) => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const fetchContent = useCallback(async (force = false) => {
    if (!force && (content || fetching)) return;
    
    setFetching(true);
    try {
      const res = await fetch("api/content");
      if (res.ok) {
        const data = await res.json();
        setContent(data);
      }
    } catch (error) {
      console.error("Failed to fetch content:", error);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [content, fetching]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return (
    <ContentContext.Provider value={{ content, loading, fetchContent }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
};
