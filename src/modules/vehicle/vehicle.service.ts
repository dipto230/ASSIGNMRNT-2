import { pool } from "../../config/db";

export const vehicleService = {
  createVehicle: async (data: any) => {
    const {
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status
    } = data;

    const result = await pool.query(
      `INSERT INTO vehicles 
       (vehicle_name, type, registration_number, daily_rent_price, availability_status)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [
        vehicle_name,
        type,
        registration_number,
        daily_rent_price,
        availability_status
      ]
    );

    return result.rows[0];
  },

  getAllVehicles: async () => {
    const result = await pool.query(`SELECT * FROM vehicles`);
    return result.rows;
  },

  getVehicleById: async (id: string) => {
    const result = await pool.query(
      `SELECT * FROM vehicles WHERE id=$1`,
      [id]
    );
    return result.rows[0];
  },

  updateVehicle: async (id: string, body: any) => {
    const {
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status
    } = body;

    const result = await pool.query(
      `UPDATE vehicles SET
        vehicle_name = COALESCE($1, vehicle_name),
        type = COALESCE($2, type),
        registration_number = COALESCE($3, registration_number),
        daily_rent_price = COALESCE($4, daily_rent_price),
        availability_status = COALESCE($5, availability_status)
       WHERE id=$6
       RETURNING *`,
      [
        vehicle_name,
        type,
        registration_number,
        daily_rent_price,
        availability_status,
        id
      ]
    );

    return result.rows[0];
  },

  deleteVehicle: async (id: string) => {
    const active = await pool.query(
      `SELECT 1 FROM bookings WHERE vehicle_id=$1 AND status='active'`,
      [id]
    );

    if (active.rows.length > 0) {
      throw new Error("Cannot delete vehicle with active bookings");
    }

    const result = await pool.query(
      `DELETE FROM vehicles WHERE id=$1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error("Vehicle not found");
    }
  }
};
