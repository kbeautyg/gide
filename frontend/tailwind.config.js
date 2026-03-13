/** @type {import('tailwindcss').Config} */
export default {
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
        // Цвета в стиле Airbnb
        airbnb: {
          rausch: '#FF385C',          // Основной розовый
          babu: '#00A699',            // Бирюзовый для акцентов
          arches: '#FC642D',          // Оранжевый для акций
          hof: '#484848',             // Тёмно-серый для текста
          foggy: '#767676',           // Средний серый
        },
        // Сохраняем тропические для совместимости (будут заменены постепенно)
        tropical: {
          turquoise: '#00A699',
          coral: '#FF385C',
          gold: '#FFD700',
          ocean: '#00A699',
        },
      },
      borderRadius: {
        lg: "12px",  // Увеличено для карточек (Airbnb-стиль)
        md: "8px",
        sm: "6px",
        xl: "16px",  // Для больших блоков
        full: "9999px",
      },
      boxShadow: {
        'airbnb-sm': '0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)',
        'airbnb': '0 2px 16px rgba(0,0,0,0.12)',
        'airbnb-hover': '0 6px 20px rgba(0,0,0,0.15)',
        'airbnb-lg': '0 8px 28px rgba(0,0,0,0.18)',
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
