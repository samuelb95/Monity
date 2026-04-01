import { supabase } from '../config/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const GROUP_SCHEMA_ERROR_CODES = new Set(['42P01', '42703', 'PGRST200', 'PGRST204', 'PGRST205']);

function isGroupSchemaError(error) {
  if (!error) return false;
  if (GROUP_SCHEMA_ERROR_CODES.has(error.code)) return true;

  const message = `${error.message || ''} ${error.details || ''}`.toLowerCase();
  return (
    message.includes('relation "expense_groups" does not exist') ||
    message.includes('relation "expense_group_members" does not exist') ||
    message.includes('relation "expense_group_entries" does not exist') ||
    message.includes('could not find the table') ||
    message.includes('schema cache') ||
    (message.includes('column') && message.includes('does not exist') && message.includes('expense_group'))
  );
}

function wrapGroupError(error) {
  if (!isGroupSchemaError(error)) {
    return error;
  }

  const wrappedError = new Error(
    'La fonctionnalité Groupes nécessite d’exécuter le script `SHARED_EXPENSE_GROUPS_SCHEMA.sql` dans Supabase.'
  );
  wrappedError.code = 'GROUP_SCHEMA_MISSING';
  wrappedError.cause = error;
  return wrappedError;
}

function parseGroup(group) {
  return {
    ...group,
    shared_account_enabled: Boolean(group.shared_account_enabled),
    shared_account_balance: Number(group.shared_account_balance || 0),
  };
}

function parseMember(member) {
  return {
    ...member,
    share_ratio: Number(member.share_ratio || 1),
  };
}

function parseEntry(entry) {
  return {
    ...entry,
    amount: Number(entry.amount || 0),
  };
}

function getDisplayNameForUser(user) {
  const firstName = user?.user_metadata?.first_name || user?.user_metadata?.firstName;
  const lastName = user?.user_metadata?.last_name || user?.user_metadata?.lastName;
  const fullName = `${firstName || ''} ${lastName || ''}`.trim();

  if (fullName) return fullName;
  if (user?.email) return user.email.split('@')[0];
  return 'Moi';
}

function hydrateGroups(groups, members, entries) {
  return (groups || []).map((group) => ({
    ...parseGroup(group),
    members: (members || [])
      .filter((member) => member.group_id === group.id)
      .map(parseMember)
      .sort((left, right) => new Date(left.created_at || 0) - new Date(right.created_at || 0)),
    entries: (entries || [])
      .filter((entry) => entry.group_id === group.id)
      .map(parseEntry)
      .sort((left, right) => new Date(right.entry_date || right.created_at || 0) - new Date(left.entry_date || left.created_at || 0)),
  }));
}

async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Utilisateur non connecté.');
  return user;
}

async function getAccessToken() {
  let { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;

  if (!session?.access_token && session?.refresh_token) {
    const refreshResult = await supabase.auth.refreshSession({
      refresh_token: session.refresh_token,
    });
    if (refreshResult.error) throw refreshResult.error;
    session = refreshResult.data.session;
  }

  if (!session?.access_token) {
    throw new Error('Session Supabase introuvable pour les opérations de groupe.');
  }

  return session.access_token;
}

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'undefined' || value === null || value === '') return;
    searchParams.set(key, value);
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

async function restRequest(path, { method = 'GET', query, body } = {}) {
  const accessToken = await getAccessToken();
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${path}${buildQueryString(query)}`,
    {
      method,
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: typeof body === 'undefined' ? undefined : JSON.stringify(body),
    }
  );

  if (!response.ok) {
    let errorPayload = null;

    try {
      errorPayload = await response.json();
    } catch (error) {
      errorPayload = null;
    }

    throw errorPayload || new Error(`Erreur REST Supabase (${response.status})`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function getExpenseGroups() {
  try {
    const groups = await restRequest('expense_groups', {
      query: {
        select: '*',
        is_active: 'eq.true',
        order: 'created_at.desc',
      },
    });

    if (!groups?.length) return [];

    const groupIds = groups.map((group) => group.id);
    const inFilter = `in.(${groupIds.join(',')})`;

    const [members, entries] = await Promise.all([
      restRequest('expense_group_members', {
        query: {
          select: '*',
          group_id: inFilter,
          order: 'created_at.asc',
        },
      }),
      restRequest('expense_group_entries', {
        query: {
          select: '*',
          group_id: inFilter,
          order: 'entry_date.desc',
        },
      }),
    ]);

    return hydrateGroups(groups, members, entries);
  } catch (error) {
    throw wrapGroupError(error);
  }
}

export async function getExpenseGroupWorkspace(groupId) {
  try {
    const [groupRows, members, entries] = await Promise.all([
      restRequest('expense_groups', {
        query: {
          select: '*',
          id: `eq.${groupId}`,
        },
      }),
      restRequest('expense_group_members', {
        query: {
          select: '*',
          group_id: `eq.${groupId}`,
          order: 'created_at.asc',
        },
      }),
      restRequest('expense_group_entries', {
        query: {
          select: '*',
          group_id: `eq.${groupId}`,
          order: 'entry_date.desc',
        },
      }),
    ]);

    const group = groupRows?.[0];
    return hydrateGroups([group], members, entries)[0];
  } catch (error) {
    throw wrapGroupError(error);
  }
}

export async function createExpenseGroup(groupData) {
  try {
    const user = await getCurrentUser();
    const payload = {
      name: groupData.name.trim(),
      description: groupData.description?.trim() || null,
      currency: groupData.currency || 'EUR',
      default_split_mode: 'weighted',
      shared_account_enabled: Boolean(groupData.shared_account_enabled),
      shared_account_name: groupData.shared_account_enabled ? groupData.shared_account_name?.trim() || 'Compte commun' : null,
      shared_account_balance: Number(groupData.shared_account_balance || 0),
      is_active: true,
    };

    const insertedGroups = await restRequest('expense_groups', {
      method: 'POST',
      query: { select: '*' },
      body: payload,
    });
    const group = insertedGroups?.[0];

    await restRequest('expense_group_members', {
      method: 'POST',
      query: { select: '*' },
      body: {
        group_id: group.id,
        user_id: user.id,
        display_name: getDisplayNameForUser(user),
        email: user.email,
        share_ratio: Number(groupData.owner_share_ratio || 1),
        role: 'owner',
        color: '#0ea5e9',
      },
    });

    return await getExpenseGroupWorkspace(group.id);
  } catch (error) {
    throw wrapGroupError(error);
  }
}

export async function addExpenseGroupMember(groupId, memberData) {
  try {
    const rows = await restRequest('expense_group_members', {
      method: 'POST',
      query: { select: '*' },
      body: {
        group_id: groupId,
        display_name: memberData.display_name.trim(),
        email: memberData.email?.trim() || null,
        share_ratio: Number(memberData.share_ratio || 1),
        role: memberData.role || 'member',
        color: memberData.color || null,
      },
    });

    return parseMember(rows?.[0]);
  } catch (error) {
    throw wrapGroupError(error);
  }
}

export async function updateExpenseGroup(groupId, updates) {
  try {
    const rows = await restRequest('expense_groups', {
      method: 'PATCH',
      query: {
        id: `eq.${groupId}`,
        select: '*',
      },
      body: {
        ...updates,
        shared_account_balance:
          typeof updates.shared_account_balance !== 'undefined'
            ? Number(updates.shared_account_balance || 0)
            : undefined,
        updated_at: new Date().toISOString(),
      },
    });

    return parseGroup(rows?.[0]);
  } catch (error) {
    throw wrapGroupError(error);
  }
}

export async function createExpenseGroupEntry(entryData) {
  try {
    await getCurrentUser();

    const rows = await restRequest('expense_group_entries', {
      method: 'POST',
      query: { select: '*' },
      body: {
        group_id: entryData.group_id,
        entry_type: entryData.entry_type,
        description: entryData.description.trim(),
        amount: Number(entryData.amount || 0),
        currency: entryData.currency || 'EUR',
        entry_date: entryData.entry_date,
        paid_from: entryData.paid_from,
        paid_by_member_id: entryData.paid_by_member_id || null,
        is_recurring: Boolean(entryData.is_recurring),
        recurrence_pattern: entryData.is_recurring ? entryData.recurrence_pattern : null,
        recurrence_end_date: entryData.is_recurring ? entryData.recurrence_end_date || null : null,
        notes: entryData.notes?.trim() || null,
      },
    });

    return parseEntry(rows?.[0]);
  } catch (error) {
    throw wrapGroupError(error);
  }
}
