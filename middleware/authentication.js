
const jwt = require('jsonwebtoken');
require('dotenv').config();


const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({
            status: 401,
            message: 'Unauthorized',
            error: 'Access denied'
        });
    }

    const bearer = token.split(' ');
    const bearerToken = bearer[1];

    try {
        const decoded = jwt.verify(bearerToken, process.env.TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(400).json({
            status: 400,
            message: 'Invalid token',
            error: error
        });
    }
}


module.exports = verifyToken;
