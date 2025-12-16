import { pool } from "../../config/db";

export const userService = {
  getAllUsers: async () => {
    const result = await pool.query(
      `SELECT id,name,email,phone,role FROM users`
    );
    return result.rows;
  },

  updateUser: async (
    id: string,
    name?: string,
    email?: string,
    phone?: string,
    role?: string
  ) => {
    const result = await pool.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        role = COALESCE($4, role),
        updated_at = NOW()
       WHERE id=$5
       RETURNING id,name,email,phone,role`,
      [name, email?.toLowerCase(), phone, role, id]
    );

    return result.rows[0];
  },

  deleteUser: async (id: string) => {
    const active = await pool.query(
      `SELECT 1 FROM bookings WHERE customer_id=$1 AND status='active'`,
      [id]
    );

    if (active.rows.length > 0) {
      throw new Error("Cannot delete user with active bookings");
    }

    const result = await pool.query(
      `DELETE FROM users WHERE id=$1`,
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error("User not found");
    }
  }
};
