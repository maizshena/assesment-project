import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // filter by status

    let query = `
      SELECT 
        l.id,
        l.user_id,
        l.users_name,
        l.loan_date,
        l.due_date,
        l.status,
        l.created_at,
        GROUP_CONCAT(
          CONCAT(
            '{"isbn":"', ld.isbn, 
            '","title":"', REPLACE(COALESCE(b.title, ''), '"', '\\"'),
            '","author":"', REPLACE(COALESCE(b.author, ''), '"', '\\"'),
            '","cover_image":', IFNULL(CONCAT('"', b.cover_image, '"'), 'null'),
            '","category_name":"', COALESCE(c.name, 'Uncategorized'),
            '","stock":', COALESCE(b.stock, 0),
            ',"returned_date":"', COALESCE(ld.returned_date, ''),
            '","fine_amount":', COALESCE(ld.fine_amount, 0),
            '}'
          ) SEPARATOR '|||'
        ) as books_json
      FROM loans l
      LEFT JOIN loan_details ld ON l.id = ld.loan_id
      LEFT JOIN books b ON ld.isbn = b.isbn
      LEFT JOIN categories c ON b.category_id = c.id_category
    `;

    if (status && status !== 'ALL') {
      query += ` WHERE l.status = ?`;
    }

    query += ` GROUP BY l.id ORDER BY l.created_at DESC`;

    const [rows] = status && status !== 'ALL' 
      ? await pool.query(query, [status])
      : await pool.query(query);

    const loans = rows.map(loan => ({
      ...loan,
      books: loan.books_json 
        ? loan.books_json.split('|||').map(b => JSON.parse(b))
        : []
    }));

    return NextResponse.json(loans);
  } catch (error) {
    console.error('Error fetch loans:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Tambah peminjaman baru
export async function POST(request) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const data = await request.json();
    const { user_id, users_name, due_date, books } = data; // books = array of ISBN

    if (!user_id || !due_date || !books || books.length === 0) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Insert ke loans
    const [loanResult] = await connection.query(
      `INSERT INTO loans (user_id, users_name, loan_date, due_date, status) 
       VALUES (?, ?, CURDATE(), ?, 'BORROWED')`,
      [user_id, users_name, due_date]
    );

    const loanId = loanResult.insertId;

    // Insert ke loan_details untuk setiap buku
    for (const isbn of books) {
      await connection.query(
        `INSERT INTO loan_details (loan_id, isbn) VALUES (?, ?)`,
        [loanId, isbn]
      );

      // Kurangi stock buku
      await connection.query(
        `UPDATE books SET stock = stock - 1 WHERE isbn = ? AND stock > 0`,
        [isbn]
      );
    }

    await connection.commit();
    return NextResponse.json({ success: true, loanId });

  } catch (error) {
    await connection.rollback();
    console.error('Error add loan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}

// PUT - Update status loan (accept return, reject, dll)
export async function PUT(request) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const data = await request.json();
    const { loan_id, action } = data; // action: 'accept_return', 'reject_return', 'cancel'

    if (!loan_id || !action) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    if (action === 'accept_return') {
      // Update status jadi RETURNED
      await connection.query(
        `UPDATE loans SET status = 'RETURNED' WHERE id = ?`,
        [loan_id]
      );

      // Update returned_date dan hitung denda
      const [loanData] = await connection.query(
        `SELECT due_date FROM loans WHERE id = ?`,
        [loan_id]
      );

      const dueDate = new Date(loanData[0].due_date);
      const returnDate = new Date();
      const daysLate = Math.max(0, Math.floor((returnDate - dueDate) / (1000 * 60 * 60 * 24)));
      const fineAmount = daysLate * 1000; // Rp 1000 per hari

      await connection.query(
        `UPDATE loan_details 
         SET returned_date = CURDATE(), fine_amount = ? 
         WHERE loan_id = ?`,
        [fineAmount, loan_id]
      );

      // Kembalikan stock buku
      const [details] = await connection.query(
        `SELECT isbn FROM loan_details WHERE loan_id = ?`,
        [loan_id]
      );

      for (const detail of details) {
        await connection.query(
          `UPDATE books SET stock = stock + 1 WHERE isbn = ?`,
          [detail.isbn]
        );
      }

    } else if (action === 'reject_return') {
      // Kembalikan status ke BORROWED
      await connection.query(
        `UPDATE loans SET status = 'BORROWED' WHERE id = ?`,
        [loan_id]
      );

    } else if (action === 'cancel') {
      // Cancel loan & kembalikan stock
      const [details] = await connection.query(
        `SELECT isbn FROM loan_details WHERE loan_id = ?`,
        [loan_id]
      );

      for (const detail of details) {
        await connection.query(
          `UPDATE books SET stock = stock + 1 WHERE isbn = ?`,
          [detail.isbn]
        );
      }

      await connection.query(
        `UPDATE loans SET status = 'REJECTED' WHERE id = ?`,
        [loan_id]
      );
    }

    await connection.commit();
    return NextResponse.json({ success: true });

  } catch (error) {
    await connection.rollback();
    console.error('Error update loan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}

// DELETE - Hapus loan
export async function DELETE(request) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get('id');

    if (!loanId) {
      return NextResponse.json({ error: 'Loan ID required' }, { status: 400 });
    }

    // Kembalikan stock dulu kalau status masih BORROWED
    const [loan] = await connection.query(
      `SELECT status FROM loans WHERE id = ?`,
      [loanId]
    );

    if (loan[0]?.status === 'BORROWED') {
      const [details] = await connection.query(
        `SELECT isbn FROM loan_details WHERE loan_id = ?`,
        [loanId]
      );

      for (const detail of details) {
        await connection.query(
          `UPDATE books SET stock = stock + 1 WHERE isbn = ?`,
          [detail.isbn]
        );
      }
    }

    // Hapus loan (loan_details akan auto-delete karena CASCADE)
    await connection.query(`DELETE FROM loans WHERE id = ?`, [loanId]);

    await connection.commit();
    return NextResponse.json({ success: true });

  } catch (error) {
    await connection.rollback();
    console.error('Error delete loan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}