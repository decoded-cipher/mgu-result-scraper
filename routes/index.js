
const express = require('express');
const router = express.Router();


const api = require('./api');
const auth = require('./auth');


router.use('/api/v4', api);
router.use('/auth', auth);


router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: 'API is working properly'
    });
});


module.exports = router;