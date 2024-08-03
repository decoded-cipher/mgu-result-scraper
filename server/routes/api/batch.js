
const express = require('express');
const router = express.Router();

const Batch = require('../../models/batch');
const verifyToken = require('../../middleware/authentication');



/**
 * @route   GET /api/v4/batch
 * @desc    Get all batches with pagination
 * @access  Authenticated
 * @params  page, limit, search
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v4/batch?page=1&limit=10&search=keyword
**/

router.get('/', async (req, res) => {

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let search = req.query.search || null;

    let query = {};
    if (search) {
        query = { $text: { $search: search } };
    }

    let totalBatches = await Batch.countDocuments(query)
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving batches',
                error: err
            });
        });

    let batches = await Batch.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-__v -_id')
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving batches',
                error: err
            });
        });

    res.status(200).json({
        status: 200,
        message: 'Batches retrieved successfully',
        data: {
            batches: batches,
            meta: {
                page: page,
                limit: limit,
                pages: Math.ceil(totalBatches / limit),
                total: totalBatches,
                search: search
            }
        }
    });

});



/**
 * @route   POST /api/v4/batch
 * @desc    Create new batch
 * @access  Authenticated
 * @params  title, description, programme, prn
 * @return  message, data
 * @error   400, { error }
 * @status  201, 400
 * 
 * @example /api/v4/batch
**/

router.post('/', async (req, res) => {
    const newBatch = new Batch({
        title: req.body.title,
        description: req.body.description,
        programme: req.body.programme,
        prn: req.body.prn
    });

    await newBatch.save()
        .then(batch => {
            res.status(201).json({
                status: 201,
                message: 'Batch created successfully',
                // data: batch
            });
        })
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error creating batch',
                error: err
            });
        });
});



/**
 * @route   PATCH /api/v4/batch/:id
 * @desc    Update a batch by batch_id
 * @access  Authenticated
 * @params  title, description, programme, prn
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v4/batch/123456
**/

router.patch('/:id', async (req, res) => {
    const batchId = req.params.id;

    await Batch.findOneAndUpdate({ batch_id: batchId }, {
        title: req.body.title,
        description: req.body.description,
        programme: req.body.programme,
        prn: req.body.prn,
        updated_at: Date.now()
    })
        .then(batch => {
            res.status(200).json({
                status: 200,
                message: 'Batch updated successfully',
                // data: batch
            });
        })
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error updating batch',
                error: err
            });
        });
});



module.exports = router;
