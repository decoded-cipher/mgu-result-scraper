
const crypto = require('crypto');
const db = require('../config/db');


module.exports = {

    // Generate unique id for each record
    generateQid: (student_id, exam_id) => {
        let hash = crypto.createHash('md5');
        hash.update(String(student_id) + String(exam_id));
        let qid = hash.digest('hex');

        console.log("--- [generateQid] --- Hash generated: " + qid);
        return qid;
    },


    // Check if data already exists
    checkQid : async (exam_id, qid) => {
        return new Promise((resolve, reject) => {

            // Generate collection name
            let collectionName = "exam_" + exam_id;

            // Check if data already exists
            db.collection(collectionName).findOne({ qid: qid }, async (err, result) => {
                if (err) {
                    console.log("--- [checkQid] --- Error in finding data: " + err);
                    reject(err);
                } else {
                    console.log("--- [checkQid] --- Data found: " + result);
                    resolve(result);
                }
            });

        });
    },


    // Save data to database
    saveData : async (data, exam_id, qid) => {
        return new Promise(async (resolve, reject) => {

            // Generate collection name
            let collectionName = "exam_" + exam_id;

            console.log("--- [saveData] --- Saving data for: " + qid + " in collection: " + collectionName);

            // Insert data into database
            db.collection(collectionName).insertOne({ 
                    qid: qid,
                    created_at: new Date(), 
                    data: data
                }, (err, result) => {
                    if (err) {
                        console.log("--- [saveData] --- Error in inserting data: " + err + "\n");
                        reject(err);
                    } else {
                        console.log("--- [saveData] --- Data inserted successfully: " + result + "\n");
                        resolve(result);
                    }
            });
            
        });

    },


    // Fetch data from database
    getDataByDept : async () => {
        return new Promise(async (resolve, reject) => {

            let collectionName = "exam_90";
            let programme = "Bachelor of Computer Application";

            console.log("--- [getDataByDept] --- Fetching data for : " + programme);

            // Fetch data from database
            db.collection(collectionName).find({ "data.programme": programme }).sort({ "data.prn": 1 }).toArray((err, result) => {
                if (err) {
                    console.log("--- [getDataByDept] --- Error in fetching data: \n");
                    reject(err);
                } else {
                    console.log("--- [getDataByDept] --- Data fetched successfully: \n");
                    resolve(result);
                }
            });

        });

    }



}