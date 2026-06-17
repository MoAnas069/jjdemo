import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eyycquaeknhbarasnseh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5eWNxdWFla25oYmFyYXNuc2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNDkxMDEsImV4cCI6MjA5NjcyNTEwMX0.gLR0wB49JsiRYLEMLZprn5AnI7ZjuGIzWI9821gE33c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Fetching site_content for sold_intro_headline...');
  const { data, error: fetchErr } = await supabase
    .from('site_content')
    .select('*')
    .eq('key', 'sold_intro_headline');

  if (fetchErr) {
    console.error('Error fetching:', fetchErr);
    return;
  }
  console.log('Current value in DB:', data);

  console.log('Updating value to "Recent Sales"...');
  const { data: updated, error: updateErr } = await supabase
    .from('site_content')
    .upsert([{ key: 'sold_intro_headline', value: 'Recent Sales' }]);

  if (updateErr) {
    console.error('Error updating:', updateErr);
    return;
  }
  console.log('Update completed.');
}

run();
