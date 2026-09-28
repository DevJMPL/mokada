import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.112.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const userTypes = new Set(['CUSTOMER', 'AGENT', 'ADMIN']);
const agentFunctions = new Set(['DRIVER', 'SALESPERSON', 'WAREHOUSE']);

type ProfilePayload = {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  avatar_path?: string | null;
  identity_document_path?: string | null;
  user_type?: string;
  agent_functions?: string[] | null;
  agent_function?: string | null;
  is_active?: boolean;
};

type AdminRequest =
  | { action: 'list' }
  | { action: 'create'; payload: ProfilePayload }
  | { action: 'update'; id: string; payload: ProfilePayload };

const jsonResponse = (body: Record<string, unknown>, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
};

const badRequest = (message: string) => jsonResponse({ error: message }, 400);

const trimOrNull = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeAgentFunctions = (payload: ProfilePayload) => {
  const source = Array.isArray(payload.agent_functions)
    ? payload.agent_functions
    : payload.agent_function
      ? [payload.agent_function]
      : [];

  const normalized: string[] = [];

  for (const value of source) {
    if (typeof value !== 'string' || !agentFunctions.has(value) || normalized.includes(value)) {
      continue;
    }

    normalized.push(value);
  }

  return normalized;
};

const normalizeProfile = (payload: ProfilePayload, requirePassword: boolean) => {
  const email = trimOrNull(payload.email)?.toLowerCase();
  const firstName = trimOrNull(payload.first_name);
  const lastName = trimOrNull(payload.last_name);
  const userType = payload.user_type ?? 'CUSTOMER';
  const normalizedAgentFunctions = normalizeAgentFunctions(payload);
  const password = trimOrNull(payload.password);

  if (!firstName) throw new Error('El nombre es obligatorio.');
  if (!lastName) throw new Error('Los apellidos son obligatorios.');
  if (!userTypes.has(userType)) throw new Error('El tipo de usuario no es valido.');
  if (userType === 'AGENT' && normalizedAgentFunctions.length === 0) {
    throw new Error('Selecciona al menos una funcion del agente.');
  }
  if (userType !== 'AGENT' && normalizedAgentFunctions.length > 0) {
    throw new Error('Solo los agentes pueden tener funcion asignada.');
  }
  if (requirePassword && (!password || password.length < 8)) {
    throw new Error('La contrasena debe tener al menos 8 caracteres.');
  }
  if (!requirePassword && password && password.length < 8) {
    throw new Error('La contrasena debe tener al menos 8 caracteres.');
  }

  return {
    auth: {
      email,
      password: password ?? undefined,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
        agent_functions: userType === 'AGENT' ? normalizedAgentFunctions : [],
      },
    },
    profile: {
      email,
      first_name: firstName,
      last_name: lastName,
      phone: trimOrNull(payload.phone),
      avatar_path: trimOrNull(payload.avatar_path),
      identity_document_path: trimOrNull(payload.identity_document_path),
      user_type: userType,
      agent_functions: userType === 'AGENT' ? normalizedAgentFunctions : [],
      is_active: payload.is_active ?? true,
    },
  };
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Metodo no permitido.' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ error: 'Faltan variables de entorno de Supabase.' }, 500);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Sesion requerida.' }, 401);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ error: 'Sesion no valida.' }, 401);
  }

  const { data: requesterProfile, error: profileError } = await adminClient
    .from('user_profiles')
    .select('id, auth_user_id, user_type, is_active')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (profileError) {
    return jsonResponse({ error: profileError.message }, 500);
  }

  if (!requesterProfile?.is_active || requesterProfile.user_type !== 'ADMIN') {
    return jsonResponse({ error: 'Necesitas permisos de administrador.' }, 403);
  }

  let body: AdminRequest;
  try {
    body = await req.json();
  } catch {
    return badRequest('Solicitud JSON invalida.');
  }

  try {
    if (body.action === 'list') {
      const { data, error } = await adminClient
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return jsonResponse({ data });
    }

    if (body.action === 'create') {
      const normalized = normalizeProfile(body.payload, true);

      if (normalized.profile.user_type === 'CUSTOMER') {
        throw new Error('Los clientes se crean desde el modulo de clientes.');
      }

      const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
        email: normalized.auth.email,
        password: normalized.auth.password,
        email_confirm: true,
        user_metadata: normalized.auth.user_metadata,
      });

      if (createError) throw createError;
      const authUserId = createdUser.user?.id;
      if (!authUserId) throw new Error('No se pudo crear el usuario de autenticacion.');

      const { data, error } = await adminClient
        .from('user_profiles')
        .upsert(
          {
            ...normalized.profile,
            auth_user_id: authUserId,
            created_by: user.id,
          },
          { onConflict: 'auth_user_id' },
        )
        .select('*')
        .single();

      if (error) {
        await adminClient.auth.admin.deleteUser(authUserId);
        throw error;
      }

      return jsonResponse({ data }, 201);
    }

    if (body.action === 'update') {
      const { data: existingProfile, error: existingError } = await adminClient
        .from('user_profiles')
        .select('*')
        .eq('id', body.id)
        .single();

      if (existingError) throw existingError;
      const normalized = normalizeProfile(
        {
          ...existingProfile,
          ...body.payload,
          email: body.payload.email ?? existingProfile.email,
        },
        false,
      );

      if (existingProfile.auth_user_id === user.id && normalized.profile.is_active === false) {
        throw new Error('No puedes desactivar tu propio usuario administrador.');
      }

      const authUpdate: Record<string, unknown> = {
        email: normalized.auth.email,
        user_metadata: normalized.auth.user_metadata,
      };

      if (normalized.auth.password) {
        authUpdate.password = normalized.auth.password;
      }

      const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(
        existingProfile.auth_user_id,
        authUpdate,
      );

      if (authUpdateError) throw authUpdateError;

      const { data, error } = await adminClient
        .from('user_profiles')
        .update(normalized.profile)
        .eq('id', body.id)
        .select('*')
        .single();

      if (error) throw error;
      return jsonResponse({ data });
    }

    return badRequest('Accion no soportada.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo procesar la solicitud.';
    return jsonResponse({ error: message }, 400);
  }
});
