import { Request, Response } from "express";
import { bookingService } from "./booking.service";

export const bookingController = {
  createBooking: async (req: Request, res: Response) => {
    try {
      const { vehicle_id, rent_start_date, rent_end_date } = req.body;
      const user = (req as any).user;

      await bookingService.autoReturn();

      const booking = await bookingService.createBooking(
        user.id,
        vehicle_id,
        rent_start_date,
        rent_end_date
      );

      res.status(201).json({ success: true, data: booking });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  getBookings: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      await bookingService.autoReturn();

      const bookings = await bookingService.getBookings(user);

      res.json({ success: true, data: bookings });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  updateBooking: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { bookingId } = req.params;

      await bookingService.autoReturn();

      const updated = await bookingService.updateBooking(bookingId, user);

      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
};
