const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

module.exports = {
  content: [
    ...createGlobPatternsForDependencies(
      __dirname + '../../../libraries/react-shared-libraries',
    ),
    join(
      __dirname + '../../../libraries/react-shared-libraries',
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}',
    ),
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}',
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  darkMode: ['class'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        sm: '576px',
        'sm-max': { max: '576px' },
        md: '768px',
        'md-max': { max: '768px' },
        lg: '992px',
        'lg-max': { max: '992px' },
        xl: '1200px',
        'xl-max': { max: '1200px' },
        '2xl': '1320px',
        '2xl-max': { max: '1320px' },
        '3xl': '1600px',
        '3xl-max': { max: '1600px' },
        '4xl': '1850px',
        '4xl-max': { max: '1850px' },
      },
    },
    extend: {
      colors: {
        // 기존 style
        // primary: '#000',
        // secondary: '#090B13',
        third: '#080B13',
        forth: '#612AD5',
        fifth: '#28344F',
        sixth: '#0B101B',
        seventh: '#7236f1',
        gray: '#8C8C8C',
        // input: '#131B2C',
        inputText: '#64748B',
        tableBorder: '#1F2941',
        // shadcn 추가 스타일
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
          border: 'hsl(var(--border))',
        },
      },
      // 업데이트 스타일
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // 기존 스타일
      gridTemplateColumns: {
        13: 'repeat(13, minmax(0, 1fr));',
      },
      backgroundImage: {
        loginBox: 'url(/auth/login-box.png)',
        loginBg: 'url(/auth/bg-login.png)',
      },
      fontFamily: {
        sans: ['Helvetica Neue'],
      },
      animation: {
        fade: 'fadeOut 0.5s ease-in-out',
        normalFadeOut: 'normalFadeOut 0.5s linear 5s forwards',
        overflow: 'overFlow 0.5s ease-in-out forwards',
        overflowReverse: 'overFlowReverse 0.5s ease-in-out forwards',
        fadeDown: 'fadeDown 4s ease-in-out forwards',
        normalFadeDown: 'normalFadeDown 0.5s ease-in-out forwards',
        newMessages: 'newMessages 1s ease-in-out 4s forwards',
      },
      boxShadow: {
        yellow: '0 0 60px 20px #6b6237',
        yellowToast: '0px 0px 50px rgba(252, 186, 3, 0.3)',
        greenToast: '0px 0px 50px rgba(60, 124, 90, 0.3)',
      },
      // that is actual animation
      keyframes: (theme) => ({
        fadeOut: {
          '0%': { opacity: 0, transform: 'translateY(30px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        normalFadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
        overFlow: {
          '0%': { overflow: 'hidden' },
          '99%': { overflow: 'hidden' },
          '100%': { overflow: 'visible' },
        },
        overFlowReverse: {
          '0%': { overflow: 'visible' },
          '99%': { overflow: 'visible' },
          '100%': { overflow: 'hidden' },
        },
        fadeDown: {
          '0%': { opacity: 0, transform: 'translateY(-30px)' },
          '10%': { opacity: 1, transform: 'translateY(0)' },
          '85%': { opacity: 1, transform: 'translateY(0)' },
          '90%': { opacity: 1, transform: 'translateY(10px)' },
          '100%': { opacity: 0, transform: 'translateY(-30px)' },
        },
        normalFadeDown: {
          '0%': { opacity: 0, transform: 'translateY(-30px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        newMessages: {
          '0%': { backgroundColor: '#7236f1', fontWeight: 'bold' },
          '99%': { backgroundColor: '#080B13', fontWeight: 'bold' },
          '100%': { backgroundColor: '#080B13', fontWeight: 'normal' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      }),
      screens: {
        custom: { raw: '(max-height: 800px)' },
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
    require('tailwindcss-animate'),
    function ({ addVariant }) {
      addVariant('child', '& > *');
      addVariant('child-hover', '& > *:hover');
    },
  ],
};
