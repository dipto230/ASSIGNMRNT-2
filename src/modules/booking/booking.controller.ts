import { Request, Response } from "express";
import { bookingService } from "./booking.service";

export const bookingController = {
  createBooking: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { customer_id, vehicle_id, rent_start_date, rent_end_date } = req.body;

      const booking = await bookingService.createBooking(
        user,
        customer_id,
        vehicle_id,
        rent_start_date,
        rent_end_date
      );

      res.status(201).json({
        success: true,
        message: "Booking created successfully",
        data: booking
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

  getBookings: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const bookings = await bookingService.getBookings(user);

      res.status(200).json({
        success: true,
        message:
          user.role === "admin"
            ? "Bookings retrieved successfully"
            : "Your bookings retrieved successfully",
        data: bookings
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  },

  updateBooking: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { bookingId } = req.params;
      const { status } = req.body;

      const updated = await bookingService.updateBooking(
        bookingId,
        status,
        user
      );

      res.status(200).json({
        success: true,
        message:
          status === "cancelled"
            ? "Booking cancelled successfully"
            : "Booking marked as returned. Vehicle is now available",
        data: updated
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }
};
