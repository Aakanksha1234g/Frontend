import { createContext, useContext, useRef, useState, useEffect } from 'react';

const TemplatesContext = createContext();

export function useApplyTemplates() {
  return useContext(TemplatesContext);
}

export default function TemplatesProvider({ children }) {
    const [templateId, setTemplateId] = useState(null);
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
    const [showTemplates, setShowTemplates ] = useState(false);

  return (
    <TemplatesContext.Provider
      value={{
        templateId,
        setTemplateId,
        isNewProjectOpen,
        setIsNewProjectOpen,
        showTemplates,
        setShowTemplates,
      }}
    >
      {children}
    </TemplatesContext.Provider>
  );
}
