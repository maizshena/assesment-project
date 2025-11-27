// app/api/test-db/route.js

import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    console.log("Testing database connection...");
    
    // Test 1: Simple query
    const [result] = await pool.execute("SELECT 1 as test");
    console.log("Connection test:", result);

    // Test 2: Get all books
    const [books] = await pool.execute("SELECT isbn, title, author FROM books LIMIT 5");
    console.log("Books found:", books.length);

    // Test 3: Get specific book
    const [specificBook] = await pool.execute(
      "SELECT * FROM books WHERE isbn = ?",
      ["592302176"]
    );
    console.log("Specific book:", specificBook.length > 0 ? "FOUND" : "NOT FOUND");

    return NextResponse.json({
      status: "success",
      connectionTest: result,
      booksCount: books.length,
      books: books,
      specificBook: specificBook.length > 0 ? specificBook[0] : null
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      { 
        error: error.message,
        code: error.code,
        errno: error.errno,
        sqlMessage: error.sqlMessage
      },
      { status: 500 }
    );
  }
}