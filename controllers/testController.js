import supabase from '../supabaseClient.js';

export const getTestTable = async (req, res) => {
  // Example: fetch all rows from a table called 'test_table'
  const { data, error } = await supabase.from('test_table').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}; 