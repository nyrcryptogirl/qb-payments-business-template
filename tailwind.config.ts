import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'system-ui'],
        body: ['var(--font-body)', 'system-ui'],
      },
    },
  },
  plugins: [],
}
export default config
