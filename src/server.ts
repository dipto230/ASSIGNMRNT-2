import express, { Request, Response, NextFunction  } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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
        role VARCHAR(20) NOT NULL CHECK(role IN('admin','customer')),
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


const authMiddleware = (roles: string[] = []) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "No token provided" });
        }

        const token = authHeader.split(" ")[1];

        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
            (req as any).user = decoded;

            if (roles.length > 0 && !roles.includes(decoded.role)) {
                return res.status(403).json({ error: "Forbidden: You do not have access" });
            }

            next();
        } catch (err) {
            return res.status(401).json({ error: "Invalid token" });
        }
    };
};




// Signup
app.post("/api/v1/auth/signup", async (req: Request, res: Response) => {
    const { name, email, password, phone, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, password, phone, role)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, email, hashedPassword, phone, role]
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result.rows[0]
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});













// Signin
app.post("/api/v1/auth/signin", async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) return res.status(400).json({ error: "Incorrect password" });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            token,
            user: { id: user.id, name: user.name, role: user.role }
        });

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});














// Create User (Admin Only)
app.post("/users", authMiddleware(["admin"]), async (req: Request, res: Response) => {
    const { name, email, password, phone, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, password, phone, role)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, email, hashedPassword, phone, role]
        );

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: result.rows[0]
        });

    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});




// Get All Users (Admin Only)
app.get("/users", authMiddleware(["admin"]), async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`SELECT id, name, email, phone, role FROM users`);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});






app.put("/api/v1/users/:userId", authMiddleware(), async (req: Request, res: Response) => {
    const { userId } = req.params;
    const loggedInUser = (req as any).user;  
    const { name, phone, role } = req.body;

    try {
        // Only Admin can update role
        if (loggedInUser.role !== "admin" && role) {
            return res.status(403).json({
                success: false,
                message: "Only admin can update user role"
            });
        }

        // Non-admin can update only their own account
        if (loggedInUser.role !== "admin" && loggedInUser.id != userId) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You can update only your own profile"
            });
        }

        const result = await pool.query(
            `UPDATE users 
             SET name = COALESCE($1, name), 
                 phone = COALESCE($2, phone),
                 role = COALESCE($3, role),
                 updated_at = NOW()
             WHERE id = $4
             RETURNING id, name, email, phone, role`,
            [name, phone, role, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({
            success: true,
            message: "User updated successfully",
            data: result.rows[0]
        });

    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});


app.delete("/api/v1/users/:userId", authMiddleware(["admin"]), async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        // Check active bookings
        const activeBookings = await pool.query(
            `SELECT * FROM bookings 
             WHERE customer_id = $1 AND status = 'active'`,
            [userId]
        );

        if (activeBookings.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete user with active bookings"
            });
        }

        const result = await pool.query(
            `DELETE FROM users WHERE id = $1 RETURNING id, name`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "User deleted successfully",
            deletedUser: result.rows[0]
        });

    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});














































app.get("/", (req: Request, res: Response) => {
    res.send("Assignment 2 server is running after error");
})

// app.post("/users", async (req: Request, res: Response) => {
//     const { name, email, password, phone, role } = req.body;
//     try {
//         const result = await pool.query(`INSERT INTO users (name, email,password, phone, role) VALUES($1, $2, $3, $4, $5) RETURNING *`, [name, email, password, phone, role]);
//         console.log(result)
//         res.status(201).json({
//             success: true,
//             message: "User Created successfully",
//             data: result.rows[0]
            
//         })

//     } catch (err: any) {
//         res.status(500).json({
//             success: false,
//             message:err.message
//         })
//     }
// })

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
