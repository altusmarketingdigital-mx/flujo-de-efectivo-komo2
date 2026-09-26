
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://awfwztbekdxgqiduqkhp.supabase.co', 'sb_publishable_MK1UXWLQUJT0s2V8DG9pHw_94e6vyyz');
async function test() {
  const { data, error } = await supabase.from('categories').insert([{ type: 'EXPENSE', name: 'TestCat' }]).select();
  console.log('Categories Insert Error:', error);
  console.log('Categories Data:', data);
}
test();

