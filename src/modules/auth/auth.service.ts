import { pool } from "../../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const authService = {
  signup: async (
    name: string,
    email: string,
    password: string,
    phone: string,
    role: "admin" | "customer"
  ) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const result = await pool.query(
        `INSERT INTO users (name, email, password, phone, role)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING id,name,email,phone,role`,
        [name, email.toLowerCase(), hashedPassword, phone, role]
      );

      return result.rows[0];
    } catch (err: any) {
      if (err.code === "23505") {
        throw new Error("Email already exists");
      }
      throw err;
    }
  },

  signin: async (email: string, password: string) => {
    const result = await pool.query(
      `SELECT * FROM users WHERE email=$1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new Error("Invalid email or password");
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return { user, token };
  }
};
