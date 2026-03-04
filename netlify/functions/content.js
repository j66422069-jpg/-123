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
      const { key } = queryStringParameters || {};
      if (key) {
        const { data, error } = await supabase
          .from('site_content')
          .select('value')
          .eq('key', key)
          .single();
        if (error) {
          if (error.code === 'PGRST116') return { statusCode: 200, body: JSON.stringify({}) };
          throw error;
        }
        return { statusCode: 200, body: JSON.stringify(data.value) };
      } else {
        const { data, error } = await supabase.from('site_content').select('*');
        if (error) throw error;
        const result = data.reduce((acc, curr) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {});
        return { statusCode: 200, body: JSON.stringify(result) };
      }
    }

    if (!isValidAdmin) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    if (httpMethod === 'POST') {
      const { key, value } = JSON.parse(body || '{}');
      if (!key || !value) throw new Error('Key and Value are required');

      const { error } = await supabase
        .from('site_content')
        .upsert({ key, value }, { onConflict: 'key' });
      if (error) throw error;

      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (error) {
    console.error('Content function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
