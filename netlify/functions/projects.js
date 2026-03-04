import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const handler = async (event) => {
  const { httpMethod, headers, body, queryStringParameters } = event;
  const adminToken = headers['x-admin-token'];
  const isValidAdmin = adminToken === process.env.ADMIN_TOKEN;

  try {
    if (httpMethod === 'GET') {
      const { id } = queryStringParameters || {};
      if (id) {
        const { data: project, error: pError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();
        if (pError) throw pError;

        const { data: videos, error: vError } = await supabase
          .from('project_videos')
          .select('*')
          .eq('project_id', id);
        if (vError) throw vError;

        return {
          statusCode: 200,
          body: JSON.stringify({ ...project, videos }),
        };
      } else {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('year', { ascending: false });
        if (error) throw error;
        return {
          statusCode: 200,
          body: JSON.stringify(data),
        };
      }
    }

    if (!isValidAdmin) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const payload = JSON.parse(body || '{}');

    if (httpMethod === 'POST') {
      const { videos, tech, ...projectData } = payload;
      const { data: project, error: pError } = await supabase
        .from('projects')
        .insert([{
          ...projectData,
          tech_camera: tech?.camera,
          tech_lens: tech?.lens,
          tech_lighting: tech?.lighting,
          tech_color: tech?.color
        }])
        .select()
        .single();
      if (pError) throw pError;

      if (videos && Array.isArray(videos)) {
        const videoRows = videos.map(v => ({ ...v, project_id: project.id }));
        const { error: vError } = await supabase.from('project_videos').insert(videoRows);
        if (vError) throw vError;
      }

      return { statusCode: 200, body: JSON.stringify(project) };
    }

    if (httpMethod === 'PUT') {
      const { id } = queryStringParameters || {};
      if (!id) throw new Error('ID is required');

      const { videos, tech, ...projectData } = payload;
      const { error: pError } = await supabase
        .from('projects')
        .update({
          ...projectData,
          tech_camera: tech?.camera,
          tech_lens: tech?.lens,
          tech_lighting: tech?.lighting,
          tech_color: tech?.color
        })
        .eq('id', id);
      if (pError) throw pError;

      // Update videos: delete and re-insert
      await supabase.from('project_videos').delete().eq('project_id', id);
      if (videos && Array.isArray(videos)) {
        const videoRows = videos.map(v => ({ ...v, project_id: id }));
        const { error: vError } = await supabase.from('project_videos').insert(videoRows);
        if (vError) throw vError;
      }

      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    if (httpMethod === 'DELETE') {
      const { id } = queryStringParameters || {};
      if (!id) throw new Error('ID is required');
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (error) {
    console.error('Projects function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
