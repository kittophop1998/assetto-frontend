"use client";

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import translation files directly
import enCommon from '../../public/locales/en/common.json'
import thCommon from '../../public/locales/th/common.json'

// Translation resources
const resources = {
    en: {
        common: enCommon
    },
    th: {
        common: thCommon
    }
} as const;

// Prevent multiple initializations
let isInitializing = false;
let isInitialized = false;

const initI18n = async () => {
    if (isInitialized || isInitializing) {
        return i18n;
    }

    isInitializing = true;

    try {
        await i18n
            .use(initReactI18next)
            .init({
                resources,
                lng: 'th', // Default language - always use 'th' on server
                fallbackLng: 'th',
                supportedLngs: ['en', 'th'], // Only allow these languages
                defaultNS: 'common',
                ns: ['common'],
                interpolation: { 
                    escapeValue: false 
                },
                react: { 
                    useSuspense: false 
                },
                // Add these options to prevent errors
                returnNull: false,
                returnEmptyString: false,
                saveMissing: false,
                // Ensure translations are loaded before use
                load: 'languageOnly',
                // Prevent server-side rendering issues
                initImmediate: false,
                // Provide default value for missing keys
                missingKeyHandler: (lngs, ns, key) => {
                    if (typeof window !== 'undefined') {
                        console.warn(`Missing translation key: ${key} for languages: ${lngs}`);
                    }
                },
                // Add key separator to avoid issues
                keySeparator: '.',
                nsSeparator: ':',
            });

        isInitialized = true;

        // Save language preference to localStorage when changed (only on client)
        if (typeof window !== 'undefined') {
            i18n.on('languageChanged', (lng) => {
                // Only save if it's a valid language
                if (lng === 'th' || lng === 'en') {
                    localStorage.setItem('language', lng);
                }
            });
        }
    } catch (error) {
        console.error('Failed to initialize i18n:', error);
    } finally {
        isInitializing = false;
    }

    return i18n;
};

// Initialize immediately
initI18n();

export default i18n;