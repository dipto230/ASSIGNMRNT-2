import express from "express";
import { vehicleController } from "./vehicle.controller";
import { authMiddleware } from "../../middleware/auth";

const router = express.Router();

router.post("/", authMiddleware(["admin"]), vehicleController.createVehicle);
router.get("/", vehicleController.getAllVehicles);
router.get("/:vehicleId", vehicleController.getVehicleById);
router.put("/:vehicleId", authMiddleware(["admin"]), vehicleController.updateVehicle);
router.delete("/:vehicleId", authMiddleware(["admin"]), vehicleController.deleteVehicle);

export default router;
