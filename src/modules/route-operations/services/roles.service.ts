import { supabase } from '../../../lib/supabase/client';

export const routeRolesService = {
  async getAgentRoles() {
    // 1. Fetch agents
    const { data: agents, error: agentsError } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .eq('user_type', 'AGENT')
      .eq('is_active', true)
      .order('first_name');
      
    if (agentsError) throw agentsError;

    // 2. Fetch routes assigned to these agents
    const { data: routes, error: routesError } = await supabase
      .from('routes')
      .select('id, name, agent_id, sequence_order, default_vehicle_id, default_weekly_budget, vehicle:fleet_vehicles!routes_default_vehicle_id_fkey(internal_code)')
      .not('agent_id', 'is', null)
      .eq('is_active', true)
      .order('sequence_order')
      .order('name');

    if (routesError) throw routesError;

    return (agents || []).map(agent => ({
      ...agent,
      routes: (routes || []).filter((r: any) => r.agent_id === agent.id)
    }));
  },

  async saveAgentRoles(agentId: string, routes: any[]) {
    // Update the sequence_order and default_vehicle_id for each route
    const updates = routes.map((r, index) => ({
      id: r.id,
      agent_id: agentId, // ensure it stays the same
      sequence_order: index,
      default_vehicle_id: r.default_vehicle_id || null,
      default_weekly_budget: r.default_weekly_budget || 0,
      name: r.name, // required for supabase upsert/update if not partial
      code: r.code, // wait, supabase update doesn't need all fields if doing single updates
    }));

    for (const update of updates) {
      const { id, sequence_order, default_vehicle_id, default_weekly_budget } = update;
      const { error } = await supabase
        .from('routes')
        .update({ sequence_order, default_vehicle_id, default_weekly_budget })
        .eq('id', id);
        
      if (error) throw error;
    }
  }
};
