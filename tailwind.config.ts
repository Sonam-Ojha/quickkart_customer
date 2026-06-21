import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary
        primaryOrange: '#EA580C',
        orangeDark:    '#C2410C',
        orangeTint:    '#FFEDD5',
        // Teal
        deepTeal:  '#0F766E',
        tealDark:  '#115E59',
        tealTint:  '#CCFBF1',
        // Text
        ink:           '#1C1917',
        textSecondary: '#57534E',
        muted:         '#A8A29E',
        // Surfaces
        appBackground: '#FFFBF7',
        cardSurface:   '#FFFFFF',
        inputFill:     '#F5F5F4',
        border:        '#E7E5E4',
        // Semantic
        success:       '#16A34A',
        successBg:     '#DCFCE7',
        warning:       '#F59E0B',
        warningBg:     '#FEF3C7',
        error:         '#DC2626',
        errorBg:       '#FEE2E2',
        // Accent
        accentYellow: '#FACC15',
        accentCoral:  '#F43F5E',
      },
      fontFamily: {
        inter:   ['Inter', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      spacing: {
        '4':  '4px',
        '8':  '8px',
        '12': '12px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
      },
      borderRadius: {
        card: '12px',
        btn:  '10px',
      },
      maxWidth: {
        app: '480px',
      },
      height: {
        cta: '44px',
      },
      boxShadow: {
        'nav-top': '0 -4px 12px rgba(0,0,0,0.06)',
        card:      '0 1px 3px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config
