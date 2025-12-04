import { Request, Response } from "express";
import { vehicleService } from "./vehicle.service";
import { pool } from "../../config/db";

export const vehicleController = {
  createVehicle: async (req: Request, res: Response) => {
    try {
      const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;

      const newVehicle = await vehicleService.createVehicle(
        vehicle_name, type, registration_number, daily_rent_price, availability_status
      );

      res.status(201).json({ success: true, data: newVehicle });

    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  getAllVehicles: async (req: Request, res: Response) => {
    try {
      const vehicles = await vehicleService.getAllVehicles();
      res.json({ success: true, data: vehicles });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  getVehicleById: async (req: Request, res: Response) => {
    try {
      const vehicle = await vehicleService.getVehicleById(req.params.vehicleId);
      if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

      res.json({ success: true, data: vehicle });

    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  updateVehicle: async (req: Request, res: Response) => {
    try {
      const updated = await vehicleService.updateVehicle(req.params.vehicleId, req.body);
      if (!updated) return res.status(404).json({ error: "Vehicle not found" });

      res.json({ success: true, data: updated });

    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  deleteVehicle: async (req: Request, res: Response) => {
    try {
      const vehicleId = req.params.vehicleId;

      // check active bookings
      const active = await pool.query(
        `SELECT * FROM bookings WHERE vehicle_id=$1 AND status='active'`,
        [vehicleId]
      );

      if (active.rows.length > 0)
        return res.status(400).json({ error: "Cannot delete vehicle with active bookings" });

      const deleted = await vehicleService.deleteVehicle(vehicleId);
      if (deleted.rows.length === 0) 
        return res.status(404).json({ error: "Vehicle not found" });

      res.json({ success: true, deleted: deleted.rows[0] });

    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};
