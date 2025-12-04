import { pool } from "../../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const authService = {
  signup: async (name: string, email: string, password: string, phone: string, role: string) => {
    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, role)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, email, hashed, phone, role]
    );

    return result.rows[0];
  },

  signin: async (email: string, password: string) => {
    const userResult = await pool.query(
      `SELECT * FROM users WHERE email=$1`, 
      [email]
    );

    if (userResult.rows.length === 0) return null;

    const user = userResult.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return false;

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return { user, token };
  }
};
