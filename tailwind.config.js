/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#D1623C',
          'orange-dark': '#B84E2A',
          navy: '#1A2B3D',
          'navy-light': '#2A3B4D',
          cream: '#FDF5ED',
        },
      },
      fontFamily: {
        logo: ['Playfair Display', 'Georgia', 'serif'],
        heading: ['Zilla Slab', 'Roboto Slab', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['5rem', { lineHeight: '1.1', fontWeight: '700' }],      // 80px
        'hero': ['3.75rem', { lineHeight: '1.1', fontWeight: '700' }],      // 60px
        'h1': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],           // 48px
        'h2': ['2.25rem', { lineHeight: '1.3', fontWeight: '700' }],        // 36px
        'h3': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],       // 30px
        'h4': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],         // 24px
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}