import { pool } from "../../config/db";

export const bookingService = {
  createBooking: async (
    user: any,
    customer_id: number,
    vehicle_id: number,
    rent_start_date: string,
    rent_end_date: string
  ) => {
    
    if (user.role === "customer" && user.id !== customer_id) {
      throw new Error("Forbidden");
    }

    const vehicleRes = await pool.query(
      `SELECT * FROM vehicles WHERE id=$1`,
      [vehicle_id]
    );

    if (vehicleRes.rows.length === 0) {
      throw new Error("Vehicle not found");
    }

    const vehicle = vehicleRes.rows[0];

    if (vehicle.availability_status !== "available") {
      throw new Error("Vehicle not available");
    }

    const start = new Date(rent_start_date);
    const end = new Date(rent_end_date);

    if (end <= start) {
      throw new Error("rent_end_date must be after rent_start_date");
    }

    const days =
      Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );

    const total_price = days * Number(vehicle.daily_rent_price);

    const bookingRes = await pool.query(
      `INSERT INTO bookings 
       (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
       VALUES ($1,$2,$3,$4,$5,'active')
       RETURNING *`,
      [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
    );

    await pool.query(
      `UPDATE vehicles SET availability_status='booked' WHERE id=$1`,
      [vehicle_id]
    );

    return {
      ...bookingRes.rows[0],
      vehicle: {
        vehicle_name: vehicle.vehicle_name,
        daily_rent_price: vehicle.daily_rent_price
      }
    };
  },

  getBookings: async (user: any) => {
    if (user.role === "admin") {
      const res = await pool.query(`
        SELECT 
          b.*,
          json_build_object('name', u.name, 'email', u.email) AS customer,
          json_build_object(
            'vehicle_name', v.vehicle_name,
            'registration_number', v.registration_number
          ) AS vehicle
        FROM bookings b
        JOIN users u ON u.id = b.customer_id
        JOIN vehicles v ON v.id = b.vehicle_id
      `);
      return res.rows;
    }

    const res = await pool.query(`
      SELECT 
        b.id,
        b.vehicle_id,
        b.rent_start_date,
        b.rent_end_date,
        b.total_price,
        b.status,
        json_build_object(
          'vehicle_name', v.vehicle_name,
          'registration_number', v.registration_number,
          'type', v.type
        ) AS vehicle
      FROM bookings b
      JOIN vehicles v ON v.id = b.vehicle_id
      WHERE b.customer_id=$1
    `, [user.id]);

    return res.rows;
  },

  updateBooking: async (
    bookingId: string,
    status: "cancelled" | "returned",
    user: any
  ) => {
    const res = await pool.query(
      `SELECT * FROM bookings WHERE id=$1`,
      [bookingId]
    );

    if (res.rows.length === 0) {
      throw new Error("Booking not found");
    }

    const booking = res.rows[0];

    if (status === "cancelled") {
      if (user.role !== "customer" || booking.customer_id !== user.id) {
        throw new Error("Forbidden");
      }

      if (new Date(booking.rent_start_date) <= new Date()) {
        throw new Error("Cannot cancel after booking start date");
      }
    }

    if (status === "returned" && user.role !== "admin") {
      throw new Error("Only admin can mark as returned");
    }

    const updated = await pool.query(
      `UPDATE bookings SET status=$1 WHERE id=$2 RETURNING *`,
      [status, bookingId]
    );

    await pool.query(
      `UPDATE vehicles SET availability_status='available' WHERE id=$1`,
      [booking.vehicle_id]
    );

    return updated.rows[0];
  }
};
