import { locales, loadTranslations, translations, defaultLocale, addTranslations, setLocale, setRoute } from '$lib/translations';

function pickLocal(locale_cookie, locale_al) {
    let locale;
    if (locale_cookie) {
        locale = locale_cookie;
    } else if (locale_al) {
        locale = locale_al
    } else if (navigator.language) {
        locale = navigator.language.toLowerCase();
    }

    const supportedLocales = locales.get().map((l) => l.toLowerCase());
    if (!supportedLocales.includes(locale)) {
        locale = defaultLocale;
    }

    return locale;
}

/** @type {import('@sveltejs/kit').Load} */
export const load = async ({ data }) => {
    const {
        route,
        locale_cookie,
        locale_al,
    } = data;


    const locale = pickLocal(locale_cookie, locale_al)

    await loadTranslations(locale, route);
    addTranslations(translations.get());

    await setRoute(route);
    await setLocale(locale);

    return  { locale, route } ;
};
