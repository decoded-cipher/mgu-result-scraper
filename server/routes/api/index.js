
const express = require('express');
const router = express.Router();


const batchRouter = require('./batch');
const resultRouter = require('./result');
const examsRouter = require('./exam');


router.use('/batch', batchRouter);
router.use('/result', resultRouter);
router.use('/exam', examsRouter);


module.exports = router;
