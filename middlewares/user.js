export const validateUser = (req, res, next) => {
    const { name, email } = req.body
    
    if (!name || !email) {
        return res.status(400).json({
            error: 'Missing required fields: name, email'
        })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: 'Invalid email format'
        })
    }

    next()
}