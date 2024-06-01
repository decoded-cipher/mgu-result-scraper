
const express = require('express');
const router = express.Router();

const Result = require('../../models/result');
const verifyToken = require('../../middleware/authentication');



/**
 * @route   GET /api/v4/result
 * @desc    Get all results
 * @access  Authenticated
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v4/result
**/

router.get('/', verifyToken, async (req, res) => {

    let totalResults = await Result.countDocuments()
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving results',
                error: err
            });
        });

    let results = await Result.find()
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving results',
                error: err
            });
        });

    res.status(200).json({
        status: 200,
        message: 'Results retrieved successfully',
        data: {
            results: results,
            meta: {
                total: totalResults
            }
        }
    });

});



module.exports = router;
