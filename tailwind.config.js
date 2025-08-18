/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.html',
    './src/**/*.js',
    './src/**/*.vue',
    './src/**/*.jsx'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // 主色：靛蓝色
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      },
      boxShadow: {
        'kimi': '0 1px 3px rgba(0,0,0,0.1)',
        'kimi-hover': '0 10px 15px rgba(0,0,0,0.1)'
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
}

