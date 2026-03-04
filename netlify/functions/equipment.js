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
      const { data, error } = await supabase.from('equipment').select('*');
      if (error) throw error;
      return { statusCode: 200, body: JSON.stringify(data) };
    }

    if (!isValidAdmin) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const payload = JSON.parse(body || '{}');

    if (httpMethod === 'POST') {
      const { data, error } = await supabase.from('equipment').insert([payload]).select().single();
      if (error) throw error;
      return { statusCode: 200, body: JSON.stringify(data) };
    }

    if (httpMethod === 'PUT') {
      const { id } = queryStringParameters || {};
      if (!id) throw new Error('ID is required');
      const { error } = await supabase.from('equipment').update(payload).eq('id', id);
      if (error) throw error;
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    if (httpMethod === 'DELETE') {
      const { id } = queryStringParameters || {};
      if (!id) throw new Error('ID is required');
      const { error } = await supabase.from('equipment').delete().eq('id', id);
      if (error) throw error;
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (error) {
    console.error('Equipment function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
