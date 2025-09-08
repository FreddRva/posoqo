/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Colores personalizados POSOQO
        gold: {
          primary: '#D4AF37',
          light: '#FFD700',
          dark: '#B8860B',
          accent: '#F4E4BC',
        },
        black: {
          primary: '#000000',
          soft: '#1A1A1A',
          medium: '#2A2A2A',
        },
        white: {
          primary: '#FFFFFF',
          soft: '#F8F8F8',
        },
        // Colores del sistema existente
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "gold-sparkle": {
          "0%, 100%": {
            opacity: "0",
            transform: "scale(0) rotate(0deg)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1) rotate(180deg)",
          },
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        "glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(212, 175, 55, 0.5)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gold-sparkle": "gold-sparkle 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #B8860B 100%)',
        'gradient-black': 'linear-gradient(135deg, #000000 0%, #1A1A1A 50%, #000000 100%)',
        'gradient-gold-text': 'linear-gradient(135deg, #D4AF37, #FFD700, #B8860B)',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(212, 175, 55, 0.3)',
        'gold-hover': '0 0 30px rgba(212, 175, 55, 0.5)',
        'premium': '0 20px 40px rgba(0, 0, 0, 0.3)',
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
        'cormorant': ['Cormorant Garamond', 'serif'],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities, addComponents, theme }) {
      // Agregar utilidades personalizadas
      addUtilities({
        '.gold-text': {
          background: 'linear-gradient(135deg, #D4AF37, #FFD700, #B8860B)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.gold-gradient': {
          background: 'linear-gradient(135deg, #D4AF37, #FFD700, #B8860B)',
        },
        '.gold-border': {
          border: '2px solid transparent',
          background: 'linear-gradient(var(--background), var(--background)) padding-box, linear-gradient(135deg, #D4AF37, #FFD700) border-box',
        },
        '.gold-glow': {
          'box-shadow': '0 0 20px rgba(212, 175, 55, 0.3), 0 0 40px rgba(212, 175, 55, 0.1), 0 0 60px rgba(212, 175, 55, 0.05)',
        },
        '.gold-glow:hover': {
          'box-shadow': '0 0 30px rgba(212, 175, 55, 0.5), 0 0 60px rgba(212, 175, 55, 0.2), 0 0 90px rgba(212, 175, 55, 0.1)',
        },
        '.premium-gradient': {
          background: 'linear-gradient(135deg, var(--background) 0%, var(--card) 50%, var(--background) 100%)',
        },
        '.gold-glass': {
          background: 'rgba(212, 175, 55, 0.1)',
          'backdrop-filter': 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
        },
        '.premium-text-shadow': {
          'text-shadow': '0 0 10px rgba(212, 175, 55, 0.5), 0 0 20px rgba(212, 175, 55, 0.3), 0 0 30px rgba(212, 175, 55, 0.1)',
        },
        '.premium-hover': {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.premium-hover:hover': {
          transform: 'translateY(-4px) scale(1.02)',
          'box-shadow': '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(212, 175, 55, 0.2)',
        },
        '.gold-sparkle': {
          animation: 'gold-sparkle 2s ease-in-out infinite',
        },
        '@keyframes gold-sparkle': {
          '0%, 100%': {
            opacity: '0',
            transform: 'scale(0) rotate(0deg)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1) rotate(180deg)',
          },
        },
      });

      // Agregar componentes personalizados
      addComponents({
        '.btn-primary': {
          '@apply px-8 py-4 rounded-full gold-gradient text-black font-bold text-lg shadow-2xl gold-glow transition-all duration-300 hover:scale-105 premium-hover': {},
        },
        '.btn-secondary': {
          '@apply px-8 py-4 rounded-full gold-border text-white font-bold text-lg hover:gold-glow transition-all duration-300 shadow-xl premium-hover': {},
        },
        '.card-premium': {
          '@apply relative premium-gradient backdrop-blur-sm p-6 rounded-3xl gold-border hover:gold-glow transition-all duration-500 hover:shadow-2xl premium-hover': {},
        },
        '.section-header': {
          '@apply text-center mb-16 relative z-10': {},
        },
        '.section-title': {
          '@apply text-5xl md:text-7xl font-black gold-text tracking-wider premium-text-shadow': {},
        },
        '.section-subtitle': {
          '@apply gold-text font-black tracking-[0.3em] text-sm md:text-base uppercase relative z-10': {},
        },
        '.section-divider': {
          '@apply w-32 h-1.5 gold-gradient mx-auto mt-6 rounded-full shadow-lg': {},
        },
      });
    }
  ],
}