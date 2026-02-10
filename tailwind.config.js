/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['Inter', 'sans-serif'],
  			display: ['Inter', 'system-ui', 'sans-serif'],
  			mono: ['JetBrains Mono', 'monospace']
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
        'neural-bg': '#0a0e1a',
        'bio-cyan': '#00d4ff',
        'memory-violet': '#8b5cf6',
        'alert-pink': '#f472b6',
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			ring: 'hsl(var(--ring))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  		},
  		boxShadow: {
  			glow: '0 0 20px -5px rgba(0, 212, 255, 0.5)',
  			'glow-violet': '0 0 20px -5px rgba(139, 92, 246, 0.5)',
  			glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
  		},
  		keyframes: {
  			'neural-pulse': {
  				'0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
  				'50%': { opacity: '0.6', transform: 'scale(1.05)' }
  			},
  			'float-slow': {
  				'0%, 100%': { transform: 'translateY(0px)' },
  				'50%': { transform: 'translateY(-10px)' }
  			},
        'synaptic-fire': {
          '0%': { boxShadow: '0 0 0px 0px rgba(0, 212, 255, 0)' },
          '50%': { boxShadow: '0 0 20px 5px rgba(0, 212, 255, 0.5)' },
          '100%': { boxShadow: '0 0 0px 0px rgba(0, 212, 255, 0)' }
        }
  		},
  		animation: {
  			'neural-pulse': 'neural-pulse 4s ease-in-out infinite',
  			'float-slow': 'float-slow 6s ease-in-out infinite',
        'synaptic-fire': 'synaptic-fire 2s ease-in-out infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")]
}