import { parseCookies, setCookie } from 'nookies';

type ThemeMode = 'default' | 'campaign' | 'letters';

export const theme = {
  default: {
    primary: '#7AAD58',
    secondary: '#CBE6BA',
    negative: '#EE3D3D80',
  },
  campaign: {
    primary: '#5B98AB',
    secondary: '#EAF2F4',
    negative: '#e53e3e',
  },
  letters: {
    primary: '#E29D4F',
    secondary: '#F7E9D9',
    negative: '#e53e3e',
  },
};

export const changeTheme = (themeMode: ThemeMode = getTheme()) => {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme[themeMode].primary);
  root.style.setProperty('--color-secondary', theme[themeMode].secondary);
  root.style.setProperty('--color-negative', theme[themeMode].negative);
  setCookie(null, 'mode', themeMode);
};

function getTheme(): ThemeMode {
  const { mode } = parseCookies() as { mode: ThemeMode };
  return mode ? mode : 'default';
}
