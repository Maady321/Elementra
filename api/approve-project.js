import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader || !projectId) {
    return res.status(400).json({ error: 'Missing information' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    
    // Verify client identity using their token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized session' });
    }

    // Verify the user owns the project
    const { data: project, error: pError } = await supabase
      .from('projects')
      .select('id, status')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (pError || !project) {
      return res.status(404).json({ error: 'Project not found for this user' });
    }

    if (project.status === 'completed') {
      return res.status(400).json({ error: 'Project is already launched' });
    }

    // Request Approval: Update status to 'review' (Admin confirms later)
    const { error: uError } = await supabase
      .from('projects')
      .update({ status: 'review' })
      .eq('id', projectId);

    if (uError) throw uError;

    // Log the event in activities
    await supabase.from('activities').insert({
      project_id: projectId,
      action_type: 'approval_requested',
      description: 'Client has requested project approval and launch',
      performed_by: 'client'
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Launch request sent! We will review and go live soon.' 
    });

  } catch (err) {
    console.error('Approve Error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
