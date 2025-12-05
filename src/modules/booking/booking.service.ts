import { bookingModel } from "./booking.model";
import { pool } from "../../config/db";

export const bookingService = {
  createBooking: async (
    customer_id: number,
    vehicle_id: number,
    rent_start_date: string,
    rent_end_date: string
  ) => {
    // Check vehicle availability
    const vehicle = await pool.query(`SELECT * FROM vehicles WHERE id=$1`, [vehicle_id]);
    if (vehicle.rows.length === 0) throw new Error("Vehicle not found");
    if (vehicle.rows[0].availability_status !== "available")
      throw new Error("Vehicle not available");

    // Calculate price
    const start = new Date(rent_start_date);
    const end = new Date(rent_end_date);
    const diffTime = end.getTime() - start.getTime();

    if (diffTime < 0) throw new Error("End date must be after start date");

    const number_of_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const total_price = number_of_days * parseFloat(vehicle.rows[0].daily_rent_price);

    // Create booking
    const booking = await bookingModel.createBooking(
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
      total_price
    );

    // Update vehicle status
    await pool.query(
      `UPDATE vehicles SET availability_status='booked' WHERE id=$1`,
      [vehicle_id]
    );

    return booking;
  },

  getBookings: async (user: any) => {
    if (user.role === "admin") return bookingModel.getAllBookings();
    return bookingModel.getBookingsByCustomer(user.id);
  },

  updateBooking: async (bookingId: string, user: any) => {
    const booking = await bookingModel.getBookingById(bookingId);
    if (!booking) throw new Error("Booking not found");

    // CUSTOMER → cancel only before start date
    if (user.role === "customer") {
      if (booking.customer_id !== user.id) throw new Error("Forbidden");

      const today = new Date();
      if (new Date(booking.rent_start_date) <= today)
        throw new Error("Cannot cancel after booking start");

      const cancelled = await bookingModel.cancelBooking(bookingId);

      await pool.query(
        `UPDATE vehicles SET availability_status='available' WHERE id=$1`,
        [booking.vehicle_id]
      );

      return cancelled;
    }

    // ADMIN → mark as returned
    if (user.role === "admin") {
      const updated = await bookingModel.updateBookingStatus(bookingId, "returned");

      await pool.query(
        `UPDATE vehicles SET availability_status='available' WHERE id=$1`,
        [booking.vehicle_id]
      );

      return updated;
    }

    throw new Error("Invalid action");
  },

  // SYSTEM AUTO RETURN
  autoReturn: async () => {
    const today = new Date().toISOString().split("T")[0];

    const result = await pool.query(
      `SELECT * FROM bookings WHERE rent_end_date < $1 AND status='active'`,
      [today]
    );

    for (let booking of result.rows) {
      await bookingModel.updateBookingStatus(booking.id, "returned");

      await pool.query(
        `UPDATE vehicles SET availability_status='available' WHERE id=$1`,
        [booking.vehicle_id]
      );
    }
  }
};
