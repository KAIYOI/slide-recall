import type { Config } from 'tailwindcss';
const config: Config = { content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'], theme: { extend: { fontFamily: { sans: ['var(--font-geist)', 'sans-serif'] }, colors: { ink: '#17221d', muted: '#748078', paper: '#f7f8f4', forest: '#244d3b', lime: '#d6f66a' }, boxShadow: { soft: '0 18px 60px rgba(26,48,36,.09)' } } }, plugins: [] };
export default config;
