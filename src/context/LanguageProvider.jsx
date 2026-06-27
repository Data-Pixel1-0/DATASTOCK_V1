import { useEffect, useMemo, useRef, useState } from "react";
import { BASE_LANGUAGE, languages } from "../i18n/languages.js";
import { LanguageContext } from "./languageContext.js";

const STORAGE_KEY = "datastock-language";
const GOOGLE_TRANSLATE_SCRIPT_ID = "google-translate-script";
const GOOGLE_TRANSLATE_ELEMENT_ID = "google_translate_element";

function getStoredLanguage() {
  try {
    const storedLanguage = localStorage.getItem(STORAGE_KEY);
    return languages.some((language) => language.code === storedLanguage) ? storedLanguage : BASE_LANGUAGE;
  } catch {
    return BASE_LANGUAGE;
  }
}

function setTranslationCookie(language) {
  const cookieValue = language === BASE_LANGUAGE ? "" : `/${BASE_LANGUAGE}/${language}`;
  const expires = language === BASE_LANGUAGE ? "Thu, 01 Jan 1970 00:00:00 GMT" : "Fri, 31 Dec 9999 23:59:59 GMT";

  document.cookie = `googtrans=${cookieValue}; expires=${expires}; path=/`;
  document.cookie = `googtrans=${cookieValue}; expires=${expires}; path=/; domain=${window.location.hostname}`;
  document.cookie = `googtrans=${cookieValue}; expires=${expires}; path=/; domain=.${window.location.hostname}`;
}

function dispatchComboChange(combo, language) {
  combo.value = language === BASE_LANGUAGE ? "" : language;
  combo.dispatchEvent(new Event("change", { bubbles: true }));
}

function applyLanguage(language) {
  document.documentElement.lang = language;
  setTranslationCookie(language);

  const combo = document.querySelector(".goog-te-combo");
  if (combo) {
    dispatchComboChange(combo, language);
    return true;
  }

  return false;
}

function loadGoogleTranslate(language) {
  window.googleTranslateElementInit = () => {
    if (!window.google?.translate?.TranslateElement) return;

    new window.google.translate.TranslateElement(
      {
        pageLanguage: BASE_LANGUAGE,
        includedLanguages: languages.map((item) => item.code).join(","),
        autoDisplay: false,
      },
      GOOGLE_TRANSLATE_ELEMENT_ID
    );

    window.setTimeout(() => applyLanguage(language), 500);
  };

  if (document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID)) {
    window.googleTranslateElementInit();
    return;
  }

  const script = document.createElement("script");
  script.id = GOOGLE_TRANSLATE_SCRIPT_ID;
  script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getStoredLanguage);
  const previousLanguage = useRef(language);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Local storage can fail in private browsing; the current session still updates.
    }

    if (language === BASE_LANGUAGE && previousLanguage.current !== BASE_LANGUAGE) {
      setTranslationCookie(BASE_LANGUAGE);
      window.location.reload();
      return;
    }

    previousLanguage.current = language;

    if (!applyLanguage(language)) {
      loadGoogleTranslate(language);
    }
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: setLanguageState,
      currentLanguage: languages.find((item) => item.code === language) || languages[0],
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
      <div id={GOOGLE_TRANSLATE_ELEMENT_ID} aria-hidden="true" />
    </LanguageContext.Provider>
  );
}
