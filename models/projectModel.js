// Project model and schema reference
// Supabase table: projects
// Columns: id (uuid, primary key), name (text), description (text), user_id (uuid), created_at (timestamp), updated_at (timestamp)

export function mapProjectRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    user_id: row.user_id,
    created_at: row.created_at,
  };
} 