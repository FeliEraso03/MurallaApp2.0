import { useState, useEffect, useCallback } from 'react';
import { getTranslation, detectBrowserLanguage, isRTL } from '../i18n';

export function useI18n(initialLanguage = null) {
  const [language, setLanguage] = useState(initialLanguage || detectBrowserLanguage());
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLanguage() {
      setLoading(true);
      try {
        const { getAllTranslations } = await import('../i18n');
        const loadedTranslations = await getAllTranslations(language);
        setTranslations(loadedTranslations);
      } catch (error) {
        console.error('Error loading translations:', error);
      } finally {
        setLoading(false);
      }
    }
    loadLanguage();
  }, [language]);

  const changeLanguage = useCallback((newLanguage) => {
    setLanguage(newLanguage);
  }, []);

  const t = useCallback((key, params = {}) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    // Interpolación de parámetros
    let result = value;
    for (const [param, replacement] of Object.entries(params)) {
      result = result.replace(new RegExp(`{{${param}}}`, 'g'), replacement);
    }
    
    return result;
  }, [translations]);

  return {
    language,
    changeLanguage,
    t,
    loading,
    isRTL: isRTL(language)
  };
}
