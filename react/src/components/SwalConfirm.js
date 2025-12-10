import Swal from 'sweetalert2';
import { useTheme } from '@mui/material/styles';
import { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext.jsx';

// Hook that provides a theme-aware SweetAlert2 wrapper
export const useThemedSwal = () => {
  const theme = useTheme();
  const { themeMode } = useContext(SettingsContext);
  const mode = theme?.palette?.mode || themeMode || 'light';
  const isDark = mode === 'dark';

  const base = {
    background: theme?.palette?.background?.paper,
    color: theme?.palette?.text?.primary,
    iconColor: theme?.palette?.warning?.main,
    confirmButtonColor: theme?.palette?.primary?.main,
    cancelButtonColor: isDark ? (theme?.palette?.grey?.[700] || '#475569') : (theme?.palette?.grey?.[500] || '#6b7280'),
    buttonsStyling: true,
  };

  const fire = (options) => Swal.fire({ ...base, ...options });

  const confirmDelete = (entityLabel = 'item', overrides = {}) =>
    fire({
      title: 'Are you sure?',
      text: `You will not be able to recover the ${entityLabel} !`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: overrides.confirmButtonText || 'Yes, remove it!',
      cancelButtonText: overrides.cancelButtonText || 'Cancel',
      ...overrides,
    });

  return { fire, confirmDelete, mixin: (mixinOpts) => Swal.mixin({ ...base, ...mixinOpts }) };
};

