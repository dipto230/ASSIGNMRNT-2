import { Request, Response } from "express";
import { bookingService } from "./booking.service";

export const bookingController = {
  createBooking: async (req: Request, res: Response) => {
    try {
      const { vehicle_id, rent_start_date, rent_end_date } = req.body;
      const user = (req as any).user;

      // Auto-return before creating new booking
      await bookingService.autoReturn();

      const booking = await bookingService.createBooking(user.id, vehicle_id, rent_start_date, rent_end_date);
      res.status(201).json({ success: true, data: booking });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  getBookings: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      // Auto-return before fetching bookings
      await bookingService.autoReturn();

      const bookings = await bookingService.getBookings(user);
      res.json({ success: true, data: bookings });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  cancelBooking: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { bookingId } = req.params;

      // Auto-return before canceling
      await bookingService.autoReturn();

      const cancelled = await bookingService.cancelBooking(bookingId, user);
      res.json({ success: true, data: cancelled });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  markAsReturned: async (req: Request, res: Response) => {
    try {
      const { bookingId } = req.params;

      // Auto-return before marking as returned
      await bookingService.autoReturn();

      const updated = await bookingService.markAsReturned(bookingId);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
};
