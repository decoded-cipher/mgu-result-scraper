
const express = require('express');
const router = express.Router();

const Result = require('../../models/result');
const verifyToken = require('../../middleware/authentication');



/**
 * @route   GET /api/v4/result
 * @desc    Get all results with pagination
 * @access  Authenticated
 * @params  page, limit, search
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v4/result?page=1&limit=10&search=keyword
**/

router.get('/', verifyToken, async (req, res) => {

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let search = req.query.search || null;

    let query = {};
    if (search) {
        query = { $text: { $search: search } };
    }

    let totalResults = await Result.countDocuments(query)
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving results',
                error: err
            });
        });

    let results = await Result.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-__v -_id')
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
                page: page,
                limit: limit,
                pages: Math.ceil(totalResults / limit),
                total: totalResults,
                search: search
            }
        }
    });

});



module.exports = router;
