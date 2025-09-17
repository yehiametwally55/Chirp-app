import express from "express"
import cors from "cors"
import {Pool} from 'pg'
import { authMiddleware } from './auth.js';
import type { AuthenticatedRequest } from './auth.ts';

const app = express();
const PORT = 8080;

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
    ssl: {
    rejectUnauthorized: false, 
  },
});

const createTable = async () => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS chirps (
    id SERIAL Primary Key,
    username VARCHAR(50) NOT NULL,
    content VARCHAR(280) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
    );
    `;

    try{
        await pool.query(createTableQuery);
        console.log("'Chirps' table checked/created successfully.");
    } catch(error){
        console.error("Error creating table:", error);
    }
};

app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    
    res.status(200).json({message:"connection accepted"})
});

app.get('/api/chirps', async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM chirps ORDER BY timestamp DESC');
        console.log(result.rows);
        res.json(result.rows);
    } catch(error){
        console.error(error);
        res.status(500).json({error: "Internal server error"});
    }
});

app.post('/api/chirps', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const username = req.user?.username;
    const {content} = req.body;

    if(!username || !content){
        return res.status(400).json({error: "Username and content are required!"});
    }
    const query = 'INSERT INTO chirps(username,content) VALUES ($1,$2) RETURNING *';
    const values = [username, content];
    try{
        const result = await pool.query(query, values);
        console.log("new Chirp added to DB: ", result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch(error){
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
});



app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    createTable();
});