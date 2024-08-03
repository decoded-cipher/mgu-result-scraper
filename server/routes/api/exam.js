
const express = require('express');
const router = express.Router();

const Exam = require('../../models/exam');
const { fetchExams } = require('../../helpers/exam_list');
const verifyToken = require('../../middleware/authentication');



/**
 * @route   GET /api/v4/exam
 * @desc    Get all exams
 * @access  Authenticated
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v4/exam
**/

router.get('/', async (req, res) => {

    let totalExams = await Exam.countDocuments()
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving exams',
                error: err
            });
        });

    let exams = await Exam.find()
        .select('-_id exam_id title')
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving exams',
                error: err
            });
        });

    res.status(200).json({
        status: 200,
        message: 'Exams retrieved successfully',
        data: {
            exams: exams,
            meta: {
                total: totalExams
            }
        }
    });

});



/**
 * @route   POST /api/v4/exam
 * @desc    Scrape and insert exams as bulk
 * @access  Authenticated
 * @return  message, data
 * @error   400, { error }
 * @status  201, 400
 * 
 * @example /api/v4/exam
**/

router.post('/', async (req, res) => {

    let mode = req.body.mode || 'UG';

    if (mode !== 'UG' && mode !== 'PG') {
        res.status(400).json({
            status: 400,
            message: 'Invalid mode',
            error: 'Mode must be either UG or PG'
        });
        return;
    }
    
    await fetchExams(mode)
        .then(async (exam_list) => {

            // check if any exams are already present. If so, insert only the new exams
            let existingExams = await Exam.find();
            let existingExamIds = existingExams.map(exam => exam.exam_id);
            let newExams = exam_list.filter(exam => !existingExamIds.includes(exam.exam_id));

            // insert only the new exams
            if (newExams.length > 0) {
                await Exam.insertMany(newExams)
                    .then(exams => {
                        res.status(201).json({
                            status: 201,
                            message: 'Exams inserted successfully',
                            data: {
                                exams: exams
                            }
                        });
                    })
                    .catch(err => {
                        res.status(400).json({
                            status: 400,
                            message: 'Error inserting exams',
                            error: err
                        });
                    });
            } else {
                res.status(200).json({
                    status: 200,
                    message: 'No new exams to insert',
                    data: {
                        exams: []
                    }
                });
            }

        })
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error fetching exams',
                error: err
            });
        });

});



module.exports = router;
