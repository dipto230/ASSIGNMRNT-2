import { Request, Response } from "express";
import { vehicleService } from "./vehicle.service";

export const vehicleController = {
  createVehicle: async (req: Request, res: Response) => {
    try {
      const vehicle = await vehicleService.createVehicle(req.body);

      res.status(201).json({
        success: true,
        message: "Vehicle created successfully",
        data: vehicle
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

  getAllVehicles: async (_req: Request, res: Response) => {
    try {
      const vehicles = await vehicleService.getAllVehicles();

      res.status(200).json({
        success: true,
        message:
          vehicles.length === 0
            ? "No vehicles found"
            : "Vehicles retrieved successfully",
        data: vehicles
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  },

  getVehicleById: async (req: Request, res: Response) => {
    try {
      const vehicle = await vehicleService.getVehicleById(
        req.params.vehicleId as string
      );

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: "Vehicle not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Vehicle retrieved successfully",
        data: vehicle
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  },

  updateVehicle: async (req: Request, res: Response) => {
    try {
      const updated = await vehicleService.updateVehicle(
        req.params.vehicleId as string,
        req.body
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Vehicle not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Vehicle updated successfully",
        data: updated
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

  deleteVehicle: async (req: Request, res: Response) => {
    try {
      await vehicleService.deleteVehicle(req.params.vehicleId as string);

      res.status(200).json({
        success: true,
        message: "Vehicle deleted successfully"
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }
};
