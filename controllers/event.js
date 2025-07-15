import { pool } from "../index.js"
import { customEventSort, isEventInPast } from "../middlewares/event.js"

export const createEvent = async (req, res) => {
    try {
        const { title, date_time, location, capacity } = req.body
        const result = await pool.query(
            'INSERT INTO events (title, date_time, location, capacity) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, date_time, location, capacity]
        )
        
        res.status(201).json({
            success: true,
            event_id: result.rows[0].id,
        })
    } catch (error) {
        console.error('Error creating event:', error)
        res.status(500).json({
            error: 'Internal server error'
        })
    }
}

export const eventInfo = async (req, res) => {
    try {
        const eventId = parseInt(req.params.id)
        
        if (isNaN(eventId)) {
            return res.status(400).json({
                error: 'Invalid event ID'
            })
        }
        
        const eventResult = await pool.query(
            'SELECT * FROM events WHERE id = $1',
            [eventId]
        )
        
        if (eventResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Event not found'
            })
        }
        
        const usersResult = await pool.query(`
            SELECT u.id, u.name, u.email, r.registered_at
            FROM users u
            JOIN registrations r ON u.id = r.user_id
            WHERE r.event_id = $1
            ORDER BY r.registered_at
        `, [eventId])
        
        const event = eventResult.rows[0]
        const registeredUsers = usersResult.rows
        
        res.json({
            success: true,
            event: {
                ...event,
                registered_users: registeredUsers,
                current_registrations: registeredUsers.length
            }
        })
    } catch (error) {
        console.error('Error getting event details:', error)
        res.status(500).json({
            error: 'Internal server error'
        })
    }
}

export const registerForEvent = async (req, res) => {
    const client = await pool.connect()
    
    try {
        const eventId = parseInt(req.params.id, 10)
        const { user_id } = req.body
        
        if (isNaN(eventId) || !user_id) {
            return res.status(400).json({
                error: 'Invalid event ID or missing user_id'
            })
        }
        
        await client.query('BEGIN')
        
        const eventResult = await client.query(
            `SELECT id, title, date_time, location, capacity
             FROM events
             WHERE id = $1
             FOR UPDATE`,
            [eventId]
        )
        
        if (eventResult.rows.length === 0) {
            await client.query('ROLLBACK')
            return res.status(404).json({
                error: 'Event not found'
            })
        }
        
        const event = eventResult.rows[0]
        
        if (isEventInPast(event.date_time)) {
            await client.query('ROLLBACK')
            return res.status(400).json({
                error: 'Cannot register for past events'
            })
        }
        
        const userResult = await client.query(
            'SELECT id FROM users WHERE id = $1',
            [user_id]
        )
        
        if (userResult.rows.length === 0) {
            await client.query('ROLLBACK')
            return res.status(404).json({
                error: 'User not found'
            })
        }
        
        const existingRegistration = await client.query(
            'SELECT 1 FROM registrations WHERE user_id = $1 AND event_id = $2',
            [user_id, eventId]
        )
        
        if (existingRegistration.rows.length > 0) {
            await client.query('ROLLBACK')
            return res.status(409).json({
                error: 'User is already registered for this event'
            })
        }
        
        const currentRegistrations = await client.query(
            'SELECT COUNT(*) FROM registrations WHERE event_id = $1',
            [eventId]
        )
        
        const registrationCount = parseInt(currentRegistrations.rows[0].count, 10)
        
        if (registrationCount >= event.capacity) {
            await client.query('ROLLBACK')
            return res.status(400).json({
                error: 'Event is full'
            })
        }
        
        const registrationResult = await client.query(
            'INSERT INTO registrations (user_id, event_id) VALUES ($1, $2) RETURNING *',
            [user_id, eventId]
        )
        
        await client.query('COMMIT')
        
        res.status(201).json({
            success: true,
            message: 'Successfully registered for event',
            registration: registrationResult.rows[0]
        })
        
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Error registering for event:', error)
        res.status(500).json({
            error: 'Internal server error'
        })
    } finally {
        client.release()
    }
}

export const cancelRegistration = async (req, res) => {
    try {
        const eventId = parseInt(req.params.id)
        const { user_id } = req.body
        
        if (isNaN(eventId) || !user_id) {
            return res.status(400).json({
                error: 'Invalid event ID or missing user_id'
            })
        }
        
        const registrationResult = await pool.query(
            'SELECT * FROM registrations WHERE user_id = $1 AND event_id = $2',
            [user_id, eventId]
        )
        
        if (registrationResult.rows.length === 0) {
            return res.status(404).json({
                error: 'User is not registered for this event'
            })
        }
        
        await pool.query(
            'DELETE FROM registrations WHERE user_id = $1 AND event_id = $2',
            [user_id, eventId]
        )
        
        res.json({
            success: true,
            message: 'Registration cancelled successfully'
        })
        
    } catch (error) {
        console.error('Error cancelling registration:', error)
        res.status(500).json({
            error: 'Internal server error'
        })
    }
}

export const upcomingEvents =  async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM events WHERE date_time > NOW() ORDER BY date_time ASC, location ASC'
        )

        const sortedEvents = result.rows.sort(customEventSort)
        
        res.json({
            success: true,
            events: sortedEvents,
            count: sortedEvents.length
        })
        
    } catch (error) {
        console.error('Error listing upcoming events:', error)
        res.status(500).json({
            error: 'Internal server error'
        })
    }
}

export const eventStats =  async (req, res) => {
  try {
    const eventId = parseInt(req.params.id)

    if (isNaN(eventId)) {
      return res.status(400).json({
        error: "Invalid event ID",
      })
    }

    const eventResult = await pool.query("SELECT * FROM events WHERE id = $1", [
      eventId,
    ])

    if (eventResult.rows.length === 0) {
      return res.status(404).json({
        error: "Event not found",
      })
    }

    const event = eventResult.rows[0]

    const registrationResult = await pool.query(
      "SELECT COUNT(*) FROM registrations WHERE event_id = $1",
      [eventId]
    )

    const totalRegistrations = parseInt(registrationResult.rows[0].count)
    const remainingCapacity = event.capacity - totalRegistrations
    const capacityUsedPercentage = parseFloat(
      ((totalRegistrations / event.capacity) * 100).toFixed(2)
    )

    res.json({
      success: true,
      stats: {
        event_id: eventId,
        event_title: event.title,
        total_registrations: totalRegistrations,
        remaining_capacity: remainingCapacity,
        capacity_used_percentage: capacityUsedPercentage,
        max_capacity: event.capacity,
      },
    })
  } catch (error) {
    console.error("Error getting event stats:", error)
    res.status(500).json({
      error: "Internal server error",
    })
  }
}