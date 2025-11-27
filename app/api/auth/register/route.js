import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { name, email, password, username } = await request.json();

    // Validasi
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Required field' }, { status: 400 });
    }

    const conn = await pool.getConnection();

    // Cek email sudah terdaftar?
    const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      conn.release();
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await conn.query(
      'INSERT INTO users (id, username, name, email, password, role) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, username || email.split('@')[0], name, email, hashedPassword, 'USER']
    );

    conn.release();
    return NextResponse.json({ message: 'Register succeded' }, { status: 201 });
  } catch (error) {
    console.error('Register Error:', error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}