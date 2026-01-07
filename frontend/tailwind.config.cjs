module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      /* Design system driven by CSS variables in index.css */
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        primary: 'var(--color-primary)',
        accent: 'var(--color-accent)',
        text: 'var(--color-text)',
        muted: 'var(--color-muted)',
        divider: 'var(--color-divider)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)',

        /* Backwards-compatible aliases */
        bgPrimary: 'var(--bg-primary)',
        bgSecondary: 'var(--bg-secondary)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        btnPrimary: 'var(--btn-primary)',
        btnPrimaryText: 'var(--btn-primary-text)',
        btnSecondary: 'var(--btn-secondary)',
        btnSecondaryText: 'var(--btn-secondary-text)',
        dividerLegacy: 'var(--divider)',
      },

      spacing: {
        xs: 'var(--space-1)',
        sm: 'var(--space-2)',
        md: 'var(--space-4)',
        lg: 'var(--space-8)',
        xl: 'var(--space-12)',
        section: 'var(--space-16)',
      },

      borderRadius: {
        main: 'var(--radius-base)',
        lg: 'var(--radius-lg)',
        sm: 'var(--radius-sm)',
      },

      boxShadow: {
        card: 'var(--shadow-card)',
        sm: 'var(--shadow-sm)',
      },

      fontFamily: {
        body: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },

      fontSize: {
        base: ['var(--font-size-base)', { lineHeight: 'var(--line-height-base)' }],
        h1: ['var(--heading-1)'],
        h2: ['var(--heading-2)'],
        h3: ['var(--heading-3)'],
      },

      transitionDuration: {
        DEFAULT: 'var(--duration-default)',
        fast: 'var(--duration-fast)',
        slow: 'var(--duration-slow)',
      },

      transitionTimingFunction: {
        DEFAULT: 'var(--ease-default)',
      },
    },
  },
  plugins: [],
}
