import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en/translation.json';
import zh from './locales/zh/translation.json';

// 定义支持的语言和对应的翻译资源
const resources = {
    en,
    zh,
};

i18n.use(LanguageDetector)
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        fallbackLng: 'en',
        supportlangs: ['en', 'zh'],
        debug: true, // set to true for debugging
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    });

export default i18n;
