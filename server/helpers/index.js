
const Batch = require('../models/batch.js');

// const process_ug = require('./process_UG.js');
// const process_pg = require('./process_PG.js');
const normalize = require('./normalize.js');

const cons_xlsx = require('./cons_sheet_xlsx.js');
const obe_xlsx = require('./obe_sheet_xlsx.js');
const analytics = require('./analytics.js');

const { sendToQueue } = require('../config/queue.js');


module.exports = {


    // 1. Fetch the results from respective sources
    // 2. Process the results and extract the necessary data
    // 3. Store the processed data in the database
    // 4. Normalize the data and store back in the database

    fetchProcessResults: async (mode, batch_id, prn, exam_id, title) => {

        let prnArr = [];
        let programme = null;

        if (batch_id) {

            await Batch.findOne({ batch_id: batch_id }).then(async (batch) => {
                batch.prn.forEach((obj) => {
                    for (let i = obj.start; i <= obj.end; i++) {
                        prnArr.push(i);
                    }
                });
                programme = batch.programme;
            }).catch((err) => { res.send(err); });

        } else if (prn) {

            // prnArr.push(prn);
            // await Batch.findOne({ prn: prn }).then(async (batch) => {
            //     programme = batch.programme;
            // }).catch((err) => { res.send(err); });

        }

        prnArr.forEach(async (prn) => { 
            await sendToQueue('fetch_queue', {
                // processMode: mode == "UG" ? process_ug : process_pg,
                processMode: mode,
                student_id : prn,
                exam_id: exam_id
            });
        });

    },



    // 1. Generate the consolidated Excel Sheet
    // 2. Generate the OBE Excel Sheet
    // 3. Generate the Analytics Excel Sheet
    // 4. Generate the Graphs (if required)

    generateExcelSheets: async (exam_id, title) => {

        await Batch.findOne({ batch_id: batch_id }).then(async (batch) => {
                
            let programme = batch.programme;

            await cons_xlsx.generate_XLSX(exam_id, programme, title).then(async (cons_sheet) => {
                await obe_xlsx.generate_XLSX(exam_id, programme, title).then(async (obe_sheet) => {
                    await analytics.generate_Tables_XLSX(cons_sheet.resultStats, exam_id, programme, title).then(async (tables) => {

                        res.json({
                            status: 200,
                            message: 'Excel Sheets generated successfully',
                            data: {
                                cons_sheet: {
                                    status: cons_sheet.status,
                                    message: cons_sheet.message,
                                },
                                obe_sheet: {
                                    status: obe_sheet.status,
                                    message: obe_sheet.message,
                                },
                                overall: tables,
                            }
                        });

                    }).catch((err) => { res.send(err); });
                }).catch((err) => { res.send(err); });
            }).catch((err) => { res.send(err); });

        }).catch((err) => { res.send(err); });

    }


};