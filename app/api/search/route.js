// app/api/search/route.js
import pool from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q) return Response.json([]);

  const [rows] = await pool.execute(`
    SELECT 
      isbn AS id,
      title,
      author,
      cover_image AS coverUrl,
      CASE WHEN stock > 0 THEN 'AVAILABLE' ELSE 'UNAVAILABLE' END AS status
    FROM books
    WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ?
    ORDER BY 
      CASE WHEN title LIKE ? THEN 1 WHEN author LIKE ? THEN 2 ELSE 3 END
    LIMIT 100
  `, [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]);

  return Response.json(rows);
}