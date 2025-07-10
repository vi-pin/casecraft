module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        'indigo-400': '#818cf8',
        'slate-100': '#f1f5f9',
        'slate-400': '#94a3b8',
        'slate-500': '#64748b',
        'slate-600': '#475569',
        'slate-800': '#1e293b',
        'slate-900': '#0f172a',
        'red-300': '#fca5a5',
        'red-500': '#ef4444',
      },
    },
  },
  plugins: [],
}