export const validateEvent = (req, res, next) => {
    const { title, date_time, location, capacity } = req.body
    
    if (!title || !date_time || !location || !capacity) {
        return res.status(400).json({
            error: 'Missing required fields: title, date_time, location, capacity'
        })
    }

    const eventDate = new Date(date_time)

    if (isNaN(eventDate.getTime())) {
        return res.status(400).json({
            error: 'Invalid date_time format. Use ISO format.'
        })
    }

    if (capacity <= 0 || capacity > 1000) {
        return res.status(400).json({
            error: 'Capacity must be between 1 and 1000'
        })
    }

    next()
}

export const isEventInPast = (eventDateTime) => {
    return new Date(eventDateTime) < new Date()
}

export const customEventSort = (a, b) => {
   
    const dateA = new Date(a.date_time)
    const dateB = new Date(b.date_time)
    
    if (dateA < dateB) return -1
    if (dateA > dateB) return 1
    
    return a.location.localeCompare(b.location)
}