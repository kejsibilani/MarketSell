/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Use CSS variables from theme.css
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        'muted-foreground': 'var(--muted-foreground)',
        border: 'var(--border)',
        destructive: 'var(--destructive)',
      },
      textColor: {
        'gold': '#FFD700',
        'orange-accent': '#FF6B35',
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        display: ['3.5rem', { lineHeight: '1.2' }],
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #0B1F3A 0%, #1a3a5f 100%)',
        'gradient-primary': 'linear-gradient(135deg, #0B1F3A 0%, #3D67AE 100%)',
        'gradient-gold': 'linear-gradient(135deg, #FF6B35 0%, #FFB366 100%)',
        'noise': 'url("data:image/svg+xml,%3Csvg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="400" height="400" filter="url(%23noiseFilter)"/%3E%3C/svg%3E")',
      },
      boxShadow: {
        elegant: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        gold: '0 20px 25px -5px rgba(255, 107, 53, 0.2)',
        glow: '0 0 20px rgba(255, 107, 53, 0.3)',
      },
      borderRadius: {
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
