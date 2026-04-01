import { supabase } from '../config/supabase';
import { normalizeTargets } from '../utils/financeModels';

const STORAGE_KEY = 'monity-planning-config';

function readLocalConfig() {
  if (typeof window === 'undefined') return {};

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : {};
  } catch (error) {
    console.error('Erreur lecture config locale:', error);
    return {};
  }
}

function writeLocalConfig(config) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Erreur sauvegarde config locale:', error);
  }
}

function isMissingTableError(error) {
  return (
    error?.code === 'PGRST205' ||
    error?.message?.toLowerCase().includes('could not find') ||
    error?.message?.toLowerCase().includes('relation')
  );
}

function serializePayload(input) {
  return {
    allocation_targets: input.allocationTargets ? normalizeTargets(input.allocationTargets) : undefined,
    planner_view: input.plannerView,
    forecast_goal_id: input.forecastGoalId,
    forecast_monthly_contribution: input.forecastMonthlyContribution,
  };
}

function deserializePayload(data) {
  if (!data) return null;

  return {
    allocationTargets: data.allocation_targets || undefined,
    plannerView: data.planner_view || undefined,
    forecastGoalId: data.forecast_goal_id || undefined,
    forecastMonthlyContribution: data.forecast_monthly_contribution || undefined,
  };
}

export async function loadPlanningConfig() {
  const localConfig = readLocalConfig();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return localConfig;
    }

    const { data, error } = await supabase
      .from('financial_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error)) {
        return localConfig;
      }
      throw error;
    }

    return {
      ...localConfig,
      ...deserializePayload(data),
    };
  } catch (error) {
    console.error('Erreur chargement config planning:', error);
    return localConfig;
  }
}

export async function savePlanningConfig(partialConfig) {
  const nextConfig = {
    ...readLocalConfig(),
    ...partialConfig,
  };

  writeLocalConfig(nextConfig);

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return nextConfig;

    const payload = serializePayload(nextConfig);

    const { error } = await supabase.from('financial_profiles').upsert(
      {
        user_id: user.id,
        ...payload,
      },
      {
        onConflict: 'user_id',
      }
    );

    if (error && !isMissingTableError(error)) {
      throw error;
    }

    return nextConfig;
  } catch (error) {
    console.error('Erreur sauvegarde config planning:', error);
    return nextConfig;
  }
}
