// app/api/books/[isbn]/route.js

import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request, context) {
  try {
    // Await params untuk Next.js 15+
    const params = await context.params;
    const isbn = params.isbn;

    console.log("=== API Books Detail Called ===");
    console.log("ISBN:", isbn);

    if (!isbn) {
      return NextResponse.json(
        { error: "ISBN is required" },
        { status: 400 }
      );
    }

    // Get book details - sesuaikan dengan struktur database
    const [bookRows] = await pool.execute(
      `
      SELECT 
        b.isbn,
        b.title,
        b.author,
        b.category_id,
        b.cover_image AS coverUrl,
        b.stock,
        CASE WHEN b.stock > 0 THEN 'AVAILABLE' ELSE 'UNAVAILABLE' END AS status,
        b.created_at,
        c.name as category_name
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.isbn = ?
      `,
      [isbn]
    );

    if (bookRows.length === 0) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    const book = {
      ...bookRows[0],
      // Set default values untuk field yang tidak ada di database
      publisher: "Tidak tersedia",
      publication_year: new Date(bookRows[0].created_at).getFullYear(),
      pages: "-",
      language: "Indonesia",
      description: "Deskripsi untuk buku ini sedang dalam proses penambahan. Silakan hubungi pustakawan untuk informasi lebih lanjut.",
      category: bookRows[0].category_name || bookRows[0].category_id,
      totalBorrows: 0
    };

    console.log("Book found:", book.title);

    // Get related books (same category)
    const [relatedBooks] = await pool.execute(
      `
      SELECT 
        isbn,
        title,
        author,
        cover_image AS coverUrl,
        stock,
        CASE WHEN stock > 0 THEN 'AVAILABLE' ELSE 'UNAVAILABLE' END AS status
      FROM books
      WHERE category_id = ? AND isbn != ?
      ORDER BY RAND()
      LIMIT 6
      `,
      [bookRows[0].category_id, isbn]
    );

    console.log("Related books found:", relatedBooks.length);

    // Get total borrowed count
    try {
      const [borrowStats] = await pool.execute(
        `
        SELECT COUNT(DISTINCT l.id) as total_borrows
        FROM loans l
        JOIN loan_details ld ON l.id = ld.loan_id
        WHERE ld.isbn = ?
        `,
        [isbn]
      );
      book.totalBorrows = borrowStats[0]?.total_borrows || 0;
    } catch (err) {
      console.log("Borrow stats error (non-critical):", err.message);
      book.totalBorrows = 0;
    }

    const response = {
      book,
      relatedBooks
    };

    console.log("=== API Response Success ===");
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("=== API ERROR ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}