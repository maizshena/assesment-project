import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';

const COVER_DIR = path.join(process.cwd(), 'public', 'covers');

if (!fs.existsSync(COVER_DIR)) {
  fs.mkdirSync(COVER_DIR, { recursive: true });
}

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        b.isbn,
        b.title,
        b.author,
        b.stock,
        b.cover_image,
        b.category_id,
        c.name AS category_name
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id_category
      ORDER BY b.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetch books:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.formData();
    const isbn = data.get('isbn')?.trim();
    const title = data.get('title')?.trim();
    const author = data.get('author')?.trim();
    const category_id = data.get('category_id');
    const stock = parseInt(data.get('stock') || 0);
    const cover = data.get('cover_image'); // bisa null kalau edit tanpa ganti cover

    if (!isbn || !title || !author || !category_id) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    let coverPath = null;
    if (cover && cover.size > 0) {
      const bytes = await cover.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${isbn}.jpg`;
      const filepath = path.join(COVER_DIR, filename);
      await fs.promises.writeFile(filepath, buffer);
      coverPath = `/covers/${filename}`;
    }

    await pool.query(`
      INSERT INTO books (isbn, title, author, category_id, stock, cover_image)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        author = VALUES(author),
        category_id = VALUES(category_id),
        stock = VALUES(stock),
        cover_image = VALUES(cover_image)
    `, [isbn, title, author, category_id, stock, coverPath]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error add book:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const isbn = searchParams.get('isbn');
    
    if (!isbn) return NextResponse.json({ error: 'ISBN required' }, { status: 400 });

    const [books] = await pool.query('SELECT cover_image FROM books WHERE isbn = ?', [isbn]);
    if (books[0]?.cover_image) {
      const filePath = path.join(COVER_DIR, path.basename(books[0].cover_image));
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }

    await pool.query('DELETE FROM books WHERE isbn = ?', [isbn]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}