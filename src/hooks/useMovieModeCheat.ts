import { useEffect, useRef, useState } from 'react';

const SECRET_CODES = ['CINEMA', 'SHOWTIME', 'MOVIE'];

export interface CheatNotificationState {
  visible: boolean;
  message: string;
  active: boolean;
}

export function useMovieModeCheat(
  onToggle: (activate?: boolean) => void,
  isCurrentlyOpen: boolean
): CheatNotificationState {
  const [notification, setNotification] = useState<CheatNotificationState>({
    visible: false,
    message: '',
    active: false,
  });

  const bufferRef = useRef<string>('');
  const timeoutRef = useRef<any>(null);
  const isOpenRef = useRef(isCurrentlyOpen);

  useEffect(() => {
    isOpenRef.current = isCurrentlyOpen;
  }, [isCurrentlyOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input field or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox')
      ) {
        return;
      }

      // Allow ESC to close Movie Mode if open
      if (e.key === 'Escape' && isOpenRef.current) {
        onToggle(false);
        return;
      }

      // Only track alphanumeric keys
      if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
        bufferRef.current = (bufferRef.current + e.key.toUpperCase()).slice(-15);

        for (const code of SECRET_CODES) {
          if (bufferRef.current.endsWith(code)) {
            bufferRef.current = '';
            const willOpen = !isOpenRef.current;
            onToggle(willOpen);

            // Display GTA San Andreas-style cheat activated banner
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setNotification({
              visible: true,
              message: willOpen ? '★ CHEAT ACTIVATED: MOVIE MODE ★' : '★ CHEAT DEACTIVATED ★',
              active: willOpen,
            });

            timeoutRef.current = setTimeout(() => {
              setNotification((prev) => ({ ...prev, visible: false }));
            }, 3000);

            break;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [onToggle]);

  return notification;
}
