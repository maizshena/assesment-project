// app/api/books/explore/route.js

import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";

    console.log("Explore API called:", { category, search, sort });

    // Build query
    let query = `
      SELECT 
        isbn,
        title,
        author,
        category_id,
        cover_image AS coverUrl,
        stock,
        CASE WHEN stock > 0 THEN 'AVAILABLE' ELSE 'UNAVAILABLE' END AS status,
        created_at
      FROM books
      WHERE 1=1
    `;
    const params = [];

    // Filter by category
    if (category && category !== "ALL") {
      query += ` AND category_id = ?`;
      params.push(category);
    }

    // Filter by search
    if (search) {
      query += ` AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Sort
    switch (sort) {
      case "newest":
        query += ` ORDER BY created_at DESC`;
        break;
      case "oldest":
        query += ` ORDER BY created_at ASC`;
        break;
      case "title_asc":
        query += ` ORDER BY title ASC`;
        break;
      case "title_desc":
        query += ` ORDER BY title DESC`;
        break;
      case "author":
        query += ` ORDER BY author ASC`;
        break;
      default:
        query += ` ORDER BY created_at DESC`;
    }

    const [books] = await pool.execute(query, params);

    // Get categories with count
    const [categories] = await pool.execute(`
      SELECT 
        category_id,
        COUNT(*) as count
      FROM books
      GROUP BY category_id
      ORDER BY category_id
    `);

    return NextResponse.json({
      books,
      categories,
      total: books.length
    });
  } catch (error) {
    console.error("Explore API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}