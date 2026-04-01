import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { loadFinancialWorkspace } from '../services/financialWorkspaceService';

export function useFinancialWorkspace(selectedDate = new Date()) {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const data = await loadFinancialWorkspace(selectedDate);

        if (!active) return;
        setWorkspace(data);
        setError(null);
      } catch (err) {
        console.error('Erreur chargement workspace:', err);
        if (!active) return;
        setError('Impossible de charger les données financières.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [isAuthenticated, reloadKey, selectedDate.getFullYear(), selectedDate.getMonth()]);

  return {
    loading,
    error,
    workspace,
    refresh: () => setReloadKey((value) => value + 1),
  };
}
