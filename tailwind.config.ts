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
        appBackground: '#FFFFFF',
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
      fontSize: {
        // standard scale — values match Tailwind defaults so existing usages don't shift
        '2xs':  ['10px', { lineHeight: '14px' }],
        'xs':   ['12px', { lineHeight: '16px' }],
        '13':   ['13px', { lineHeight: '18px' }],
        'sm':   ['14px', { lineHeight: '20px' }],
        '15':   ['15px', { lineHeight: '22px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg':   ['18px', { lineHeight: '26px' }],
        'xl':   ['20px', { lineHeight: '28px' }],
        '2xl':  ['24px', { lineHeight: '32px' }],
        '3xl':  ['30px', { lineHeight: '36px' }],
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
        'nav-top':      '0 -4px 12px rgba(0,0,0,0.06)',
        card:           '0 1px 3px rgba(0,0,0,0.08)',
        header:         '0 1px 0 #e5e7eb, 0 4px 16px rgba(0,0,0,0.07)',
        'search-focus': '0 0 0 3px rgba(234,88,12,0.12)',
        cta:            '0 4px 14px rgba(234,88,12,0.25)',
      },
    },
  },
  plugins: [],
} satisfies Config
