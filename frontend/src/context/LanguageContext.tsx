import React, { createContext, useContext, useState } from 'react';
import { PreferredLanguage } from '../types';

interface LanguageContextType {
  language: PreferredLanguage;
  setLanguage: (lang: PreferredLanguage) => void;
  t: (key: string) => string;
}

const translations: Record<PreferredLanguage, Record<string, string>> = {
  en: {
    app_title: 'SentinelOps AI',
    app_subtitle: 'Agentic Incident Ownership & Intelligent Coordination Platform',
    dashboard: 'Dashboard',
    incidents: 'Incidents',
    my_incidents: 'My Incidents',
    ai_insights: 'AI Insights',
    analytics: 'Analytics & Compliance',
    audit: 'Audit & Traceability',
    admin: 'Admin Settings',
    create_incident: 'Create Incident',
    owner_required: 'OWNER REQUIRED',
    why_at_risk: 'Why is this at risk?',
    recommend_owner: 'Recommend Owner',
    who_needs_to_know: 'Who needs to know?',
  },
  hi: {
    app_title: 'सेंटिनेलऑप्स एआई',
    app_subtitle: 'एजेंटिक घटना स्वामित्व और बुद्धिमत्ता पूर्ण समन्वय मंच',
    dashboard: 'डैशबोर्ड',
    incidents: 'घटनाएं',
    my_incidents: 'मेरी समस्याएं',
    ai_insights: 'एआई इनसाइट्स',
    analytics: 'विश्लेषण और अनुपालन',
    audit: 'ऑडिट और पता लगाने की क्षमता',
    admin: 'प्रशासक सेटिंग्स',
    create_incident: 'घटना दर्ज करें',
    owner_required: 'मालिक आवश्यक है',
    why_at_risk: 'यह जोखिम में क्यों है?',
    recommend_owner: 'मालिक की सिफारिश करें',
    who_needs_to_know: 'किसको सूचित करने की आवश्यकता है?',
  },
  mr: {
    app_title: 'सेंटिनेलऑप्स एआय',
    app_subtitle: 'एजेंटिक घटना मालकी आणि बुद्धिमत्ता पूर्ण समन्वय प्लॅटफॉर्म',
    dashboard: 'डॅशबोर्ड',
    incidents: 'घटना',
    my_incidents: 'माझ्या नियुक्त घटना',
    ai_insights: 'एआय इनसाइट्स',
    analytics: 'विश्लेषण आणि अनुपालन',
    audit: 'ऑडिट आणि ट्रेसेबिलिटी',
    admin: 'प्रशासक सेटिंग्ज',
    create_incident: 'नवीन घटना नोंदवा',
    owner_required: 'मालक आवश्यक आहे',
    why_at_risk: 'हे धोक्यात का आहे?',
    recommend_owner: 'तंत्रज्ञांची शिफारस करा',
    who_needs_to_know: 'कोणाला कळवणे आवश्यक आहे?',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<PreferredLanguage>('en');

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
