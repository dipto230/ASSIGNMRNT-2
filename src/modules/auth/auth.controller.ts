import { Request, Response } from "express";
import { authService } from "./auth.service";

export const authController = {
  signup: async (req: Request, res: Response) => {
    try {
      const { name, email, password, phone, role } = req.body;

      const user = await authService.signup(
        name,
        email,
        password,
        phone,
        role
      );

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

  signin: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const result = await authService.signin(email, password);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          token: result.token,
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            phone: result.user.phone,
            role: result.user.role
          }
        }
      });
    } catch (err: any) {
      res.status(401).json({
        success: false,
        message: err.message
      });
    }
  }
};
