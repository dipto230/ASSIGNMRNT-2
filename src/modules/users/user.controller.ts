import { Request, Response } from "express";
import { userService } from "./user.service";
import { pool } from "../../config/db";

export const userController = {
  getAllUsers: async (req: Request, res: Response) => {
    try {
      const users = await userService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  updateUser: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const logged = (req as any).user;
      const { name, phone, role } = req.body;

      if (logged.role !== "admin" && logged.id != userId)
        return res.status(403).json({ error: "Forbidden" });

      if (logged.role !== "admin" && role)
        return res.status(403).json({ error: "Only admin can update role" });

      const updated = await userService.updateUser(userId as string, name, phone, role);
      if (!updated)
        return res.status(404).json({ error: "User not found" });

      res.json({ success: true, data: updated });

    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  deleteUser: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const activeBookings = await pool.query(
        `SELECT * FROM bookings WHERE customer_id=$1 AND status='active'`,
        [userId]
      );

      if (activeBookings.rows.length > 0)
        return res.status(400).json({
          error: "Cannot delete user with active bookings"
        });

      const result = await userService.deleteUser(userId as string);

      if (result.rows.length === 0)
        return res.status(404).json({ error: "User not found" });

      res.json({ success: true, deleted: result.rows[0] });

    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};
