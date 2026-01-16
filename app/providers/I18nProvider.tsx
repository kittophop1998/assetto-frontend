"use client";

import i18n from "@/src/lib/i18n";
import { ReactNode, useEffect } from "react";
import { I18nextProvider } from "react-i18next";

interface I18nProviderProps {
    children: ReactNode;
    initialLanguage?: string;
}

export default function I18nProvider({
    children,
    initialLanguage = 'th'
}: I18nProviderProps) {
    useEffect(() => {
        // Initialize i18n and set up language detection
        const initializeI18n = async () => {
            try {
                // Check if we're on client side
                if (typeof window !== 'undefined') {
                    // Get saved language preference or use initial language
                    const savedLanguage = localStorage.getItem('language');
                    const targetLanguage = savedLanguage && (savedLanguage === 'th' || savedLanguage === 'en') 
                        ? savedLanguage 
                        : initialLanguage;

                    // Change language if different from current and valid
                    if (i18n.language !== targetLanguage && i18n.isInitialized) {
                        await i18n.changeLanguage(targetLanguage);
                    }
                }
            } catch (error) {
                console.error("Error initializing i18n:", error);
            }
        };

        initializeI18n();

        // Listen for language changes
        const handleLanguageChange = (lng: string) => {
            console.log("Language changed to:", lng);
        };

        i18n.on('languageChanged', handleLanguageChange);

        // Cleanup
        return () => {
            i18n.off('languageChanged', handleLanguageChange);
        };
    }, [initialLanguage]);

    // Don't show loading state, just render with fallback
    return (
        <I18nextProvider i18n={i18n}>
            {children}
        </I18nextProvider>
    );
}