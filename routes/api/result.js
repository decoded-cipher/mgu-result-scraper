
const express = require('express');
const router = express.Router();

const Result = require('../../models/result');
const { fetchProcessResults } = require('../../helpers/index.js');
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

router.get('/', async (req, res) => {

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



/**
 * @route   POST /api/v4/result
 * @desc    Generate new result
 * @access  Authenticated
 * @params  mode, batch_id, prn, batch, requested_by
 * @return  message, data
 * @error   400, { error }
 * @status  201, 400
 * 
 * @example /api/v4/result
**/

router.post('/', async (req, res) => {

    let mode = req.body.mode;
    let batch_id = req.body.batch_id || null;
    let prn = req.body.prn || null;
    let exam_id = req.body.exam_id;
    let title = req.body.title;
    
    let result_id = null;

    // const newResult = new Result({
    //     mode: mode,            // mode: 'batch' or 'single' - required
    //     batch_id: batch_id,    // batch_id: 'batch_id' or null - required if mode is 'batch'
    //     prn: prn,              // prn: 'prn' or null - required if mode is 'single'

    //     exam_id: exam_id,
    //     user_id: req.body.user_id,
    //     requested_by: req.body.requested_by
    // });

    // await newResult.save()
    //     .then(result => {

    //         result_id = result.result_id;
            
    //         res.status(201).json({
    //             status: 201,
    //             message: 'Result generated successfully',
    //             data: result
    //         });
    //     })
    //     .catch(err => {
    //         res.status(400).json({
    //             status: 400,
    //             message: 'Error generating result',
    //             error: err
    //         });
    //     });


    // mode, batch_id, prn, exam_id, title
    await fetchProcessResults(mode, batch_id, null, exam_id, null);

});



module.exports = router;
