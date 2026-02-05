/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary CTA (Dark Green - Your Signature)
        primary: {
          DEFAULT: "#14532D",
          hover: "#166534",
          active: "#0F3D22",
          light: "#DCFCE7",    // Soft green backgrounds
          subtle: "#F0FDF4",   // Very subtle green tint
        },

        // Secondary / highlight
        secondary: {
          light: "#DCFCE7",
        },

        // Neutral surfaces - PREMIUM WARM STONE SYSTEM
        neutral: {
          bg: "#FAFAF9",       // Stone-50 (warmer, cleaner than beige)
          surface: "#FFFFFF",
          card: "#FEFEFE",     // Elevated surface (subtle off-white)
          border: "#E7E5E4",   // Stone-200 (warmer, harmonizes with green)
          hover: "#F5F5F4",    // Stone-100 (hover backgrounds)
        },

        // Text roles - REFINED WARM HIERARCHY
        text: {
          primary: "#1C1917",   // Stone-900 (warmer black, more sophisticated)
          secondary: "#57534E", // Stone-600 (warmer mid-gray)
          muted: "#A8A29E",     // Stone-400 (warmer light-gray)
          accent: "#14532D",    // Green for emphasis text
        },

        // States
        danger: "#DC2626",
        success: "#16A34A",
        warning: "#F59E0B",
      },

      // PREMIUM SHADOWS (Subtle, not harsh)
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'premium': '0 10px 15px -3px rgb(0 0 0 / 0.03), 0 4px 6px -4px rgb(0 0 0 / 0.03)',
        'subtle': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
      },

      // PREMIUM TYPOGRAPHY
      fontSize: {
        // Base sizes with refined line-heights for readability
        xs: ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        sm: ['0.875rem', { lineHeight: '1.6', letterSpacing: '0' }],
        base: ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
        // Page title - more refined
        'page-title': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
      },

      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },

      // PREMIUM SPACING (More generous)
      spacing: {
        '4.5': '1.125rem', // 18px - between p-4 and p-5
        '18': '4.5rem',    // Extra spacing option
      },

      // PREMIUM BORDER RADIUS (Softer corners)
      borderRadius: {
        'xl': '0.875rem',  // 14px - slightly larger
        '2xl': '1rem',     // 16px
      },

      // ANIMATIONS - Slower, more luxurious
      keyframes: {
        authCardIn: {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        
        // New micro-interaction animations
        'sheet-in': {
          '0%': { transform: 'translateY(100%) scale(0.98)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        'sheet-out': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(100%) scale(0.98)', opacity: '0' },
        },
        'slot-pulse': {
          '0%, 100%': { transform: 'scale(1)', borderColor: 'currentColor' },
          '50%': { transform: 'scale(1.02)', borderColor: '#14532D' },
        },
        'checkmark': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'date-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'price-float': {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
          '100%': { transform: 'translateY(0)' },
        },
        'price-rise': {
  '0%': { 
    opacity: '0', 
    transform: 'translateY(10px) scale(0.9)' 
  },
  '70%': { 
    opacity: '1', 
    transform: 'translateY(-5px) scale(1.05)' 
  },
  '100%': { 
    opacity: '0', 
    transform: 'translateY(-15px) scale(0.95)' 
  },
},
      'summary-slide': {
        '0%': { 
          opacity: '0', 
          transform: 'translateY(20px)',
          maxHeight: '0px'
        },
        '100%': { 
          opacity: '1', 
          transform: 'translateY(0)',
          maxHeight: '500px'
        },
      },
      'number-count': {
        '0%': { 
          opacity: '0.5',
          transform: 'scale(0.9)' 
        },
        '50%': { 
          opacity: '1',
          transform: 'scale(1.1)' 
        },
        '100%': { 
          opacity: '1',
          transform: 'scale(1)' 
        },
      },

      },

      animation: {
        authCardIn: "authCardIn 0.3s ease-out forwards",    // Slower = premium
        shimmer: "shimmer 2s infinite linear",
        slideUp: "slideUp 0.4s ease-out forwards",
        fadeIn: "fadeIn 0.3s ease-out forwards",
        scaleIn: "scaleIn 0.3s ease-out forwards",
        
        // New micro-interaction animations
        'sheet-in': 'sheet-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'sheet-out': 'sheet-out 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards',
        'slot-pulse': 'slot-pulse 0.3s ease-out forwards',
        'checkmark': 'checkmark 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        'date-bounce': 'date-bounce 0.4s ease-out forwards',
        'price-float': 'price-float 0.6s ease-in-out',

        'price-rise': 'price-rise 0.8s ease-out forwards',
      'summary-slide': 'summary-slide 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
      'number-count': 'number-count 0.3s ease-out forwards',
      },

      // PREMIUM TRANSITIONS
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },

      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'premium': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
    },
  },
  plugins: [],
}