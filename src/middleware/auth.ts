import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (roles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);
      (req as any).user = decoded;

      if (roles.length > 0 && !roles.includes((decoded as any).role))
        return res.status(403).json({ error: "Forbidden" });

      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };
};