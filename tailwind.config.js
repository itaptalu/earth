/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./components/**/*.{js,vue,ts}',
		'./layouts/**/*.vue',
		'./pages/**/*.vue',
		'./plugins/**/*.{js,ts}',
		'./app.vue',
		'./error.vue',
	],
	theme: {
		extend: {
			spacing: {
				4.5: '1.125rem', //18px
				5.5: '1.375rem', //22px
				7.5: '1.875rem', //30px
				9.5: '2.375rem', //38px
				10.5: '2.625rem', //42px
				11.5: '2.875rem', //46px
				12.5: '3.125rem', //50px
			},
			maxWidth: ({ theme }) => ({
				...theme('spacing'),
			}),
			minWidth: ({ theme }) => ({
				...theme('spacing'),
			}),
			maxHeight: ({ theme }) => ({
				...theme('spacing'),
			}),
			minHeight: ({ theme }) => ({
				...theme('spacing'),
			}),
			borderRadius: ({ theme }) => ({
				...theme('spacing'),
			}),
			fontSize: ({ theme }) => ({
				...theme('spacing'),
			}),
			lineHeight: ({ theme }) => ({
				...theme('spacing'),
			}),

			colors: {
				main: '#FF6900',
				'main-light': '#FFEDE0',
				'main-bright': '#FF8F44',
				gray: {
					text: '#8F8F8F',
					stroke: '#E0E0E0',
					light: '#F5F5F5',
					bright: '#FCFCFC',
					lighter: '#F8F8F8',
				},
				green: {
					my: '#58BF68',
					'market-active': '#428C4B',
					text: '#428C4B',
					light: '#D9F8DD',
				},
				purple: {
					my: '#7000FF',
				},
				blue: {
					my: '#4152a4',
				},
				pink: {
					my: '#f197a3',
				},
				red: {
					my: '#FF0000',
				},
				orange: {
					'market-inactive': '#B58200',
				},
			},
			boxShadow: {
				modal: '0px 0px 15px 0px rgba(0, 0, 0, 0.1)',
				nav: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
				menu: '0px 0px 20px 2px rgba(0, 0, 0, 0.14)',
			},
		},
	},
	plugins: [],
};
