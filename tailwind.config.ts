import withMT from '@material-tailwind/react/utils/withMT';
import defaultTheme from 'tailwindcss/defaultTheme';
/** @type {import('tailwindcss').Config} */

export default withMT({
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    'path-to-your-node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}',
    'path-to-your-node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: ['Quicksand', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        negative: 'var(--color-negative)',
        ...defaultTheme.colors,
      },
      screens: {
        mini: '350px',
        tablet: '640px',
        laptop: '1024px',
        desktop: '1280px',
        ...defaultTheme.screens,
      },
      ...defaultTheme.extend,
    },
  },
  plugins: [],
});
