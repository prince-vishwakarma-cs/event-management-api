import { pool } from "../index.js";

export const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );

    res.status(201).json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "User with this email already exists",
      });
    }

    console.error("Error creating user:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
}


export const allUsers =  async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY name');
        res.json({
            success: true,
            users: result.rows
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
}

