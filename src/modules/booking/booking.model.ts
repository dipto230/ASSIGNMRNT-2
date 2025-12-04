import { pool } from "../../config/db";

export const bookingModel = {
  createBooking: async (customer_id: number, vehicle_id: number, rent_start_date: string, rent_end_date: string, total_price: number) => {
    const result = await pool.query(
      `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
       VALUES ($1,$2,$3,$4,$5,'active') RETURNING *`,
      [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
    );
    return result.rows[0];
  },

  getBookingById: async (id: string) => {
    const result = await pool.query(`SELECT * FROM bookings WHERE id=$1`, [id]);
    return result.rows[0];
  },

  getAllBookings: async () => {
    const result = await pool.query(`SELECT * FROM bookings`);
    return result.rows;
  },

  getBookingsByCustomer: async (customer_id: number) => {
    const result = await pool.query(`SELECT * FROM bookings WHERE customer_id=$1`, [customer_id]);
    return result.rows;
  },

  updateBookingStatus: async (id: string, status: string) => {
    const result = await pool.query(
      `UPDATE bookings SET status=$1 WHERE id=$2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  },

  cancelBooking: async (id: string) => {
    const result = await pool.query(
      `UPDATE bookings SET status='cancelled' WHERE id=$1 AND status='active' RETURNING *`,
      [id]
    );
    return result.rows[0];
  }
};
