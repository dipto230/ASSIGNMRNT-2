import { pool } from "../../config/db";

export const userService = {
  getAllUsers: async () => {
    const result = await pool.query(
      `SELECT id,name,email,phone,role FROM users`
    );
    return result.rows;
  },

  updateUser: async (id: string, name?: string, phone?: string, role?: string) => {
    const result = await pool.query(
      `UPDATE users SET 
         name = COALESCE($1, name),
         phone = COALESCE($2, phone),
         role = COALESCE($3, role),
         updated_at = NOW()
       WHERE id = $4 RETURNING id,name,email,phone,role`,
      [name, phone, role, id]
    );
    return result.rows[0];
  },

  deleteUser: async (id: string) => {
    return pool.query(`DELETE FROM users WHERE id=$1 RETURNING id,name`, [id]);
  }
};
