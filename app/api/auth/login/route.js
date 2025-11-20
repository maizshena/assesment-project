import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    const user = rows[0];

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    // Berhasil → kirim data user
    return NextResponse.json({
      message: 'Login berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}