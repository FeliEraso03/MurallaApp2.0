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
    
    // Diagnóstico y seguridad: Evitar que strings o arrays rompan la expresión regular
    if (params && typeof params === 'object' && !Array.isArray(params)) {
      for (const [param, replacement] of Object.entries(params)) {
        try {
          // El SyntaxError ocurren cuando param es un número solo (como "0" de un string)
          // Protegemos la creación del RegExp
          const regex = new RegExp(`{{${param}}}`, 'g');
          result = result.replace(regex, replacement);
        } catch (e) {
          console.warn(`[useI18n] Error interpolating key "${key}" with param "${param}":`, e);
        }
      }
    } else if (params && typeof params !== 'object') {
      // Si llegamos aquí con un string como segundo argumento, este es el culpable
      console.warn(`[useI18n] detected invalid call: t("${key}", "${params}"). Expected an object for params.`);
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
