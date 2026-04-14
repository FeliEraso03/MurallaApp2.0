import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../utils/authContext';
import { detectBrowserLanguage, getAllTranslations, isRTL } from '../i18n';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const { user } = useAuth();
  const [language, setLanguage] = useState('en'); // Inglés por defecto
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  // Detectar idioma inicial
  useEffect(() => {
    // Primero verificar localStorage
    const savedLang = localStorage.getItem('muralla_language');
    if (savedLang) {
      setLanguage(savedLang);
    } else if (user?.preferences?.language) {
      // Usar el idioma de las preferencias del usuario autenticado
      setLanguage(user.preferences.language);
    } else {
      // Usar inglés por defecto para usuarios no autenticados
      setLanguage('en');
    }
  }, [user]);

  // Cargar traducciones cuando cambia el idioma
  useEffect(() => {
    async function loadLanguage() {
      setLoading(true);
      try {
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
    localStorage.setItem('muralla_language', newLanguage);
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
      result = result.replace(new RegExp(`{${param}}`, 'g'), replacement);
    }
    
    return result;
  }, [translations]);

  return (
    <I18nContext.Provider value={{ language, changeLanguage, t, loading, isRTL: isRTL(language) }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
