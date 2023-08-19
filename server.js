require('dotenv').config()
const express = require('express')

const db = require('./config/db');
const utils = require('./helpers/utils.js');

const data = require('./public/data/mca_2020.json');

const process_ug = require('./helpers/process_UG.js');
const process_pg = require('./helpers/process_PG.js');

const app = express()

db.connect();

app.get('/', async (req, res) => {

    let processMode = null;
    let mode = req.query.mode;

    mode == "ug" ? processMode = process_ug : processMode = process_pg;

    if(!mode) {
        res.send({
            status: "error",
            message: "Please specify the mode of the exam. (ug/pg)"
        });
        return;
    } else if(mode != "ug" && mode != "pg") {
        res.send({
            status: "error",
            message: "Invalid mode specified. (ug/pg)"
        });
        return;
    } else {

        // await utils.fetchExamDetails();
    
        // await processMode.fetchAllResults(data.students, data.exam_id);
        // console.log("--- -------------------- ---");
    
        // await utils.generatePDFs(data.students);
        // console.log("--- -------------------- ---");
    
        // await utils.sendOutEmails(data.students);
        // console.log("--- -------------------- ---");
    
        await processMode.processAllResults(data.students, data.exam_id);
        // console.log("--- -------------------- ---");

        res.send(data);
        
    }

})

app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`)
})