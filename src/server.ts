import express, { Request, Response } from "express";
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path"
dotenv.config({path: path.join(process.cwd(), '.env')})
const app = express();
const port = 5000;

//connection pool
const pool = new Pool({
    connectionString:`${process.env.CONNECTION_STR}`
})
//parser
app.use(express.json());

const initDB = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100)NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK(role IN('admin','user')),
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    )

        `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        vehicle_name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('car', 'bike', 'van', 'SUV')),
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    daily_rent_price NUMERIC(10,2) NOT NULL CHECK (daily_rent_price > 0),
    availability_status VARCHAR(20) 
        NOT NULL CHECK (availability_status IN ('available', 'booked'))
        )
        `);
    
    await pool.query(`
        CREATE TABLE IF NOT EXISTS bookings(
        id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    rent_start_date DATE NOT NULL,
    rent_end_date DATE NOT NULL CHECK (rent_end_date > rent_start_date),
    total_price NUMERIC(10,2) NOT NULL CHECK (total_price > 0),
    status VARCHAR(20) 
        NOT NULL CHECK (status IN ('active', 'cancelled', 'returned'))
        )`)
};
initDB();
app.get("/", (req: Request, res: Response) => {
    res.send("Assignment 2 server is running after error");
})

app.post("/users", async (req: Request, res: Response) => {
    const { name, email, password, phone, role } = req.body;
    try {
        const result = await pool.query(`INSERT INTO users (name, email,password, phone, role) VALUES($1, $2, $3, $4, $5) RETURNING *`, [name, email, password, phone, role]);
        console.log(result)
        res.status(201).json({
            success: true,
            message: "User Created successfully",
            data: result.rows[0]
            
        })

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message:err.message
        })
    }
})

app.post("/", (req: Request, res: Response) => {
    console.log(req.body);
    res.status(201).json({
        success: true,
        message:"API IS WORKING"
    })
})

app.listen(port, () => {
    console.log(`Assignment 2 server is running on port number ${port}`);
})
