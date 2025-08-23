// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	ssr: false,
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	modules: ['@nuxt/icon', '@nuxt/image', '@nuxtjs/tailwindcss'],

	app: { head: { script: [{ src: '//cdn.jsdelivr.net/npm/globe.gl' }] } },
});
