import { ui, defaultLang } from "./ui";

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split("/");
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function getPathWithoutLangFromUrl(url: URL) {
  const lang = getLangFromUrl(url);
  const path = url.pathname;
  const langPrefix = `/${lang}`;

  if (path === langPrefix || path === `${langPrefix}/`) {
    return "/";
  }

  if (path.startsWith(`${langPrefix}/`)) {
    return path.slice(langPrefix.length);
  }

  return path || "/";
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

export function useTranslatedPath(lang: keyof typeof ui) {
  return function translatePath(path: string, l: string = lang) {
    return `/${l}${path}`;
  };
}
