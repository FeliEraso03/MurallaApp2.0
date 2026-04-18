// Sistema de internacionalización con carga dinámica de archivos JSON
// Compatible con Vite (usando import() dinámico)

const translationsCache = new Map();

const SUPPORTED_LANGUAGES = ['es', 'en', 'pt', 'zh', 'hi', 'ar', 'de', 'ru', 'fr', 'it', 'ja', 'ko', 'tr', 'id', 'nl'];

const LANGUAGE_INFO = {
    es: { name: 'Español', flag: '🇪🇸', rtl: false },
    en: { name: 'English', flag: '🇬🇧', rtl: false },
    pt: { name: 'Português', flag: '🇧🇷', rtl: false },
    zh: { name: '中文', flag: '🇨🇳', rtl: false },
    hi: { name: 'हिन्दी', flag: '🇮🇳', rtl: false },
    ar: { name: 'العربية', flag: '🇸🇦', rtl: true },
    de: { name: 'Deutsch', flag: '🇩🇪', rtl: false },
    ru: { name: 'Русский', flag: '🇷🇺', rtl: false },
    fr: { name: 'Français', flag: '🇫🇷', rtl: false },
    it: { name: 'Italiano', flag: '🇮🇹', rtl: false },
    ja: { name: '日本語', flag: '🇯🇵', rtl: false },
    ko: { name: '한국어', flag: '🇰🇷', rtl: false },
    tr: { name: 'Türkçe', flag: '🇹🇷', rtl: false },
    id: { name: 'Bahasa Indonesia', flag: '🇮🇩', rtl: false },
    nl: { name: 'Nederlands', flag: '🇳🇱', rtl: false },
};

/**
 * Carga dinámicamente las traducciones para un idioma específico
 */
async function loadTranslations(lang) {
    if (translationsCache.has(lang)) {
        return translationsCache.get(lang);
    }

    try {
        // Carga dinámica usando Vite's dynamic import
        const module = await
        import (`./locales/${lang}.json`);
        const translations = module.default;
        translationsCache.set(lang, translations);
        return translations;
    } catch (error) {
        console.warn(`Failed to load translations for ${lang}, falling back to Spanish`, error);
        // Fallback al español si falla la carga
        if (lang !== 'es') {
            return loadTranslations('es');
        }
        return {};
    }
}

/**
 * Obtiene una traducción específica con fallback
 * @param {string} lang - Código del idioma (es, en, pt, etc.)
 * @param {string} key - Clave de la traducción en formato "section.key"
 * @param {object} params - Parámetros para interpolación (opcional)
 * @returns {string} Traducción o la clave si no se encuentra
 */
export async function getTranslation(lang, key, params = {}) {
    const translations = await loadTranslations(lang);

    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            // Fallback al español si la traducción no existe
            if (lang !== 'es') {
                const fallbackTranslations = await loadTranslations('es');
                let fallbackValue = fallbackTranslations;
                for (const fallbackKey of keys) {
                    if (fallbackValue && typeof fallbackValue === 'object' && fallbackKey in fallbackValue) {
                        fallbackValue = fallbackValue[fallbackKey];
                    } else {
                        return key; // Retorna la clave si no existe en español
                    }
                }
                value = fallbackValue;
            } else {
                return key; // Retorna la clave si no existe
            }
            break;
        }
    }

    if (typeof value !== 'string') {
        return key;
    }

    // Interpolación de parámetros
    let result = value;

    // Seguridad: Evitar que strings o arrays rompan la expresión regular
    if (params && typeof params === 'object' && !Array.isArray(params)) {
        for (const [param, replacement] of Object.entries(params)) {
            try {
                const regex = new RegExp(`{{${param}}}`, 'g');
                result = result.replace(regex, replacement);
            } catch (e) {
                console.warn(`[i18n] Error interpolating key "${key}" with param "${param}":`, e);
            }
        }
    }

    return result;
}

/**
 * Obtiene las traducciones completas para un idioma
 * @param {string} lang - Código del idioma
 * @returns {object} Objeto de traducciones
 */
export async function getAllTranslations(lang) {
    return loadTranslations(lang);
}

/**
 * Verifica si un idioma es RTL (Right-to-Left)
 * @param {string} lang - Código del idioma
 * @returns {boolean}
 */
export function isRTL(lang) {
    const langInfo = LANGUAGE_INFO[lang];
    return (langInfo && langInfo.rtl) || false;
}

/**
 * Obtiene la información de un idioma
 * @param {string} lang - Código del idioma
 * @returns {object} Información del idioma
 */
export function getLanguageInfo(lang) {
    return LANGUAGE_INFO[lang] || LANGUAGE_INFO.es;
}

/**
 * Obtiene la lista de idiomas soportados
 * @returns {Array} Lista de idiomas con su información
 */
export function getSupportedLanguages() {
    return SUPPORTED_LANGUAGES.map(code => ({
        code,
        ...LANGUAGE_INFO[code],
    }));
}

/**
 * Detecta el idioma del navegador
 * @returns {string} Código del idioma detectado o 'es' por defecto
 */
export function detectBrowserLanguage() {
    const browserLang = navigator.language.split('-')[0];
    return SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : 'es';
}

/**
 * Limpia el caché de traducciones
 */
export function clearTranslationsCache() {
    translationsCache.clear();
}

// Exportar constantes
export { SUPPORTED_LANGUAGES, LANGUAGE_INFO };