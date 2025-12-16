import { Request, Response } from "express";
import { userService } from "./user.service";

export const userController = {
  getAllUsers: async (_req: Request, res: Response) => {
    try {
      const users = await userService.getAllUsers();

      res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: users
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  },

  updateUser: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const logged = (req as any).user;
      const { name, email, phone, role } = req.body;

      if (logged.role !== "admin" && logged.id !== Number(userId)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden"
        });
      }

      if (logged.role !== "admin" && role) {
        return res.status(403).json({
          success: false,
          message: "Only admin can update role"
        });
      }

      const updated = await userService.updateUser(
        userId,
        name,
        email,
        phone,
        role
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updated
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

  deleteUser: async (req: Request, res: Response) => {
    try {
      await userService.deleteUser(req.params.userId as string);

      res.status(200).json({
        success: true,
        message: "User deleted successfully"
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }
};
