// src/i18n.ts
import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale;
  return {
    locale: locale || 'en', // Default to 'en' if undefined
    messages: (await import(`./messages/${locale || 'en'}.json`)).default
  };
});
