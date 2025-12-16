import express from "express";
import { bookingController } from "./booking.controller";
import { authMiddleware } from "../../middleware/auth";

const router = express.Router();

router.post(
  "/",
  authMiddleware(["customer", "admin"]),
  bookingController.createBooking
);

router.get(
  "/",
  authMiddleware(),
  bookingController.getBookings
);

router.put(
  "/:bookingId",
  authMiddleware(["customer", "admin"]),
  bookingController.updateBooking
);

export default router;
