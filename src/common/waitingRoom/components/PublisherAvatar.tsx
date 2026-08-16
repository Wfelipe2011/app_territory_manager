import clsx from 'clsx';
import { User } from 'react-feather';

import type { PublisherProfile } from '@/lib/helper';
import { getPublisherInitials } from '@/lib/helper';

interface PublisherAvatarProps {
  profile: PublisherProfile;
  onClick?: () => void;
  ariaLabel?: string;
  size?: 'md' | 'lg';
}

export function PublisherAvatar({ profile, onClick, ariaLabel, size = 'md' }: PublisherAvatarProps) {
  const initials = getPublisherInitials(profile);
  return (
    <button
      type='button'
      aria-label={ariaLabel ?? 'Abrir perfil'}
      onClick={onClick}
      className={clsx(
        'flex items-center justify-center rounded-full bg-secondary font-semibold text-primary-text active:scale-[0.96] transition-transform',
        size === 'md' ? 'h-12 w-12 text-sm' : 'h-16 w-16 text-lg'
      )}
    >
      {initials || <User size={20} aria-hidden='true' />}
    </button>
  );
}
