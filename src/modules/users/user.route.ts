import express from "express";
import { userController } from "./user.controller";
import { authMiddleware } from "../../middleware/auth";

const router = express.Router();

router.get("/", authMiddleware(["admin"]), userController.getAllUsers);
router.put("/:userId", authMiddleware(), userController.updateUser);
router.delete("/:userId", authMiddleware(["admin"]), userController.deleteUser);

export default router;
