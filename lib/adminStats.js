import pool from "@/lib/db";

export async function getAdminStats() {
  const [activeLoansResult] = await pool.execute(`
    SELECT COUNT(*) as count 
    FROM loans 
    WHERE status IN ('BORROWED', 'PENDING_RETURN')
  `);

  const [totalUsersResult] = await pool.execute(`
    SELECT COUNT(*) as count 
    FROM users 
    WHERE role = 'USER'
  `);

  const [totalBooksResult] = await pool.execute(`
    SELECT COUNT(*) as count 
    FROM books
  `);

  return {
    activeLoans: activeLoansResult[0]?.count || 0,
    totalUsers: totalUsersResult[0]?.count || 0,
    totalBooks: totalBooksResult[0]?.count || 0
  };
}
