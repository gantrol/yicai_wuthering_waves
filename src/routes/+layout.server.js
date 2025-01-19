/** @type {import('@sveltejs/kit').ServerLoad} */
export const load = async ({url, cookies, request}) => {
    const {pathname} = url;

    // Try to get the locale from cookie
    const locale_cookie = (cookies.get('lang') || '').toLowerCase();

    // Get user preferred locale
    const locale_al = `${`${request.headers.get('accept-language')}`.match(/[a-zA-Z]+?(?=-|_|,|;)/)}`.toLowerCase();


    return {
        route: pathname,
        locale_cookie,
        locale_al,
    };
};
