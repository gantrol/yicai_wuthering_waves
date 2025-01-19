import i18n from "sveltekit-i18n";
import lang from "./lang.json";

export const defaultLocale = "en";

/** @type {import('sveltekit-i18n').Config} */
export const config = {
  translations: {
    en: { lang },
    "zh-CN": { lang },
    "zh-TW": { lang },
    ja: { lang },
    ko: { lang },
    fr: { lang },
    de: { lang },
    es: { lang },
  },
  loaders: [
    {
      locale: "en",
      key: "common",
      loader: async () => (await import("./en/common.json")).default,
    },
    {
      locale: "en",
      key: "menu",
      loader: async () => (await import("./en/menu.json")).default,
    },
    {
      locale: "en",
      key: "home",
      routes: ["/"],
      loader: async () => (await import("./en/home.json")).default,
    },
    {
      locale: "zh-CN",
      key: "common",
      loader: async () => (await import("./zh-CN/common.json")).default,
    },
    {
      locale: "zh-CN",
      key: "menu",
      loader: async () => (await import("./zh-CN/menu.json")).default,
    },
    {
      locale: "zh-CN",
      key: "home",
      routes: ["/"],
      loader: async () => (await import("./zh-CN/home.json")).default,
    },
    {
      locale: "zh-TW",
      key: "common",
      loader: async () => (await import("./zh-TW/common.json")).default,
    },
    {
      locale: "zh-TW",
      key: "menu",
      loader: async () => (await import("./zh-TW/menu.json")).default,
    },
    {
      locale: "zh-TW",
      key: "home",
      routes: ["/"],
      loader: async () => (await import("./zh-TW/home.json")).default,
    },
    {
      locale: "ja",
      key: "common",
      loader: async () => (await import("./ja/common.json")).default,
    },
    {
      locale: "ja",
      key: "menu",
      loader: async () => (await import("./ja/menu.json")).default,
    },
    {
      locale: "ja",
      key: "home",
      routes: ["/"],
      loader: async () => (await import("./ja/home.json")).default,
    },
    {
      locale: "ko",
      key: "common",
      loader: async () => (await import("./ko/common.json")).default,
    },
    {
      locale: "ko",
      key: "menu",
      loader: async () => (await import("./ko/menu.json")).default,
    },
    {
      locale: "ko",
      key: "home",
      routes: ["/"],
      loader: async () => (await import("./ko/home.json")).default,
    },
    {
      locale: "fr",
      key: "common",
      loader: async () => (await import("./fr/common.json")).default,
    },
    {
      locale: "fr",
      key: "menu",
      loader: async () => (await import("./fr/menu.json")).default,
    },
    {
      locale: "fr",
      key: "home",
      routes: ["/"],
      loader: async () => (await import("./fr/home.json")).default,
    },
    {
      locale: "de",
      key: "common",
      loader: async () => (await import("./de/common.json")).default,
    },
    {
      locale: "de",
      key: "menu",
      loader: async () => (await import("./de/menu.json")).default,
    },
    {
      locale: "de",
      key: "home",
      routes: ["/"],
      loader: async () => (await import("./de/home.json")).default,
    },
    {
      locale: "es",
      key: "common",
      loader: async () => (await import("./es/common.json")).default,
    },
    {
      locale: "es",
      key: "menu",
      loader: async () => (await import("./es/menu.json")).default,
    },
    {
      locale: "es",
      key: "home",
      routes: ["/"],
      loader: async () => (await import("./es/home.json")).default,
    },
  ],
};

export const {
  t,
  loading,
  locales,
  locale,
  loadTranslations,
  addTranslations,
  translations,
  setLocale,
  setRoute,
} = new i18n(config);

loading.subscribe(
  ($loading) =>
    $loading && console.log("Loading translations for the main instance..."),
);

export const languageNames = {
  en: "English",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  ja: "日本語",
  ko: "한국어",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
};
