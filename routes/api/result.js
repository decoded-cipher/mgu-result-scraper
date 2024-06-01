
const express = require('express');
const router = express.Router();

const Exam = require('../../models/exam');
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

router.get('/', verifyToken, async (req, res) => {

    let totalExams = await Exam.countDocuments()
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving exams',
                error: err
            });
        });

    let exams = await Exam.find()
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



module.exports = router;
