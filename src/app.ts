import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.route";
import userRoutes from "./modules/users/user.route";
import vehicleRoutes from "./modules/vehicle/vehicle.route";
import bookingRoutes from "./modules/booking/booking.route";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

//vehicle routes
app.use("/api/v1/vehicles", vehicleRoutes);

//routes
app.use("/api/v1/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.send("Assignment 2 Modular Server Running");
});

export default app;
