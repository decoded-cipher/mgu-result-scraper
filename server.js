require('dotenv').config()
const express = require('express')
const { spawn } = require('child_process');

const db = require('./config/db');
const data = require('./public/data/mca_2020.json');

const utils = require('./helpers/utils.js');
const process_ug = require('./helpers/process_UG.js');
const process_pg = require('./helpers/process_PG.js');
const xlsx = require('./helpers/xlsx.js');
const analytics = require('./helpers/analytics.js');

const app = express()

// db.connect();

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




app.get('/xlsx', async (req, res) => {

    let result = await xlsx.generate_XLSX();
    res.send(result);
    
});







app.get('/analytics', async (req, res) => {

    let result = await analytics.generate_XLSX();
    res.send(result);

});







app.get('/test', async (req, res) => {

    var dataToSend;

    // spawn new child process to call the python script
    const python = spawn('python', ['./helpers/xlsx_pdf.py']);

    // collect data from script
    python.stdout.on('data', (data) => {
        console.log('Pipe data from python script ...');
        dataToSend = data.toString();
    });

    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        // send data to browser
        res.send(dataToSend)
    });

});










app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`)
})