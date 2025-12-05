import { Request, Response } from "express";
import { authService } from "./auth.service";

export const authController = {
 signup: async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const user = await authService.signup(name, email, password, phone, role);

    
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      data: userWithoutPassword
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
},


  signin: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const response = await authService.signin(email, password);
      if (response === null)
        return res.status(404).json({ error: "User not found" });

      if (response === false)
        return res.status(400).json({ error: "Incorrect password" });

      res.json({
        success: true,
        token: response.token,
        user: {
          id: response.user.id,
          name: response.user.name,
          role: response.user.role
        }
      });

    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};
