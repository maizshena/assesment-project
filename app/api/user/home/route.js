// app/api/user/home/route.js

import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    // TODO: Get userId from session/auth
    const userId = "ece49c33-dff2-429c-9751-e7de8bdad4d4";

    // Get user collections
    const [collections] = await pool.execute(
      `
      SELECT 
        b.isbn,
        b.title,
        b.author,
        b.cover_image AS coverUrl,
        l.status,
        l.due_date
      FROM loan_details ld
      JOIN loans l ON ld.loan_id = l.id
      JOIN books b ON ld.isbn = b.isbn
      WHERE l.user_id = ? AND l.status IN ('BORROWED', 'PENDING_RETURN')
      ORDER BY l.loan_date DESC
      LIMIT 10
      `,
      [userId]
    );

    // Get recommendations
    const [recommendations] = await pool.execute(`
      SELECT 
        isbn,
        title,
        author,
        cover_image AS coverUrl,
        stock,
        CASE WHEN stock > 0 THEN 'AVAILABLE' ELSE 'UNAVAILABLE' END AS status
      FROM books
      WHERE stock > 0
      ORDER BY created_at DESC
      LIMIT 30
    `);

    return NextResponse.json({
      collections,
      recommendations
    });
  } catch (error) {
    console.error("Error fetching home data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}