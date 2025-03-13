import { parseCookies, setCookie } from 'nookies';

export type RoundInfo = {
  id: number;
  roundNumber: number;
  name: string;
  theme: string;
  tenantId: number;
  colorPrimary: string | null;
  colorSecondary: string | null;
  type: string;
}

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

export const changeTheme = (roundInfo: RoundInfo = getTheme()) => {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', roundInfo.colorPrimary || theme.default.primary);
  root.style.setProperty('--color-secondary', roundInfo.colorSecondary || theme.default.secondary);
  root.style.setProperty('--color-negative', theme.default.negative);
  setCookie(null, 'roundInfo', JSON.stringify(roundInfo));
};

function getTheme(): RoundInfo {
  const cookie = parseCookies() as { roundInfo: string };
  const roundInfo = cookie.roundInfo ? JSON.parse(cookie.roundInfo) : null;
  return roundInfo ? roundInfo : {
    id: 0,
    roundNumber: 1,
    name: 'Residencial',
    theme: 'default',
    tenantId: 0,
    colorPrimary: theme.default.primary,
    colorSecondary: theme.default.secondary,
    type: 'Residencial'
  };
}
