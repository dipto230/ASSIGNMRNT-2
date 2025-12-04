import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.route";
import userRoutes from "./modules/users/user.route";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Assignment 2 Modular Server Running");
});

export default app;
