import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const usePageLeaveConfirmation = (hasUnsavedChanges) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    const handlePopState = () => {
      if (hasUnsavedChanges()) {
        const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
        if (!confirmed) {
          // Prevent navigation
          window.history.pushState(null, '', location.pathname);
          return;
        }
      }
    };

    // Handle browser back/forward buttons
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, location.pathname]);

  // Custom navigation function that checks for unsaved changes
  const navigateWithConfirmation = (to, options = {}) => {
    if (hasUnsavedChanges()) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) {
        return false;
      }
    }
    navigate(to, options);
    return true;
  };

  return { navigateWithConfirmation };
}; 