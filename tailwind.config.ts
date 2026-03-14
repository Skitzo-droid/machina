import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:           '#09080a',
        'bg-1':       '#0e0c10',
        'bg-2':       '#161418',
        'bg-3':       '#1e1b22',
        lime:         '#c6f135',
        'lime-dim':   '#8aab20',
        cream:        '#e2dbd5',
        'cream-dim':  '#8a847e',
        'cream-faint':'#3d3936',
        orange:       '#f07c34',
        red:          '#e03535',
      },
      fontFamily: {
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono:  ['DM Mono', 'Courier New', 'monospace'],
      },
      borderColor: {
        DEFAULT:  'rgba(198,241,53,0.10)',
        hi:       'rgba(198,241,53,0.28)',
      },
      animation: {
        ticker:  'ticker 40s linear infinite',
        marquee: 'marquee 22s linear infinite',
        blink:   'blink 2s ease-in-out infinite',
        pulse2:  'pulse2 1.4s ease-in-out infinite',
      },
      keyframes: {
        ticker:  { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        blink:   { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.25' } },
        pulse2:  { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.3' } },
      },
    },
  },
  plugins: [],
}

export default config
