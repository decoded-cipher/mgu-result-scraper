
const crypto = require('crypto');
const db = require('../config/db');


module.exports = {

    generateQid: (student_id, exam_id) => {
        let hash = crypto.createHash('md5');
        hash.update(String(student_id) + String(exam_id));
        let qid = hash.digest('hex');

        console.log("Hash generated: " + qid);
        return qid;
    },


    saveData : async (data, student_id, exam_id) => {
        return new Promise((resolve, reject) => {

            let qid = module.exports.generateQid(student_id, exam_id);
            let collectionName = "exam_" + exam_id;

            console.log("Saving data for: " + qid + " in collection: " + collectionName);

            db.collection(collectionName).findOne({ qid: qid }, async (err, result) => {
                if (err) {
                    console.log("Error in finding data: " + err);
                    reject(err);
                } else {
                    if (result) {
                        console.log("Data found. Skipping data insertion...\n");
                        resolve(result);
                    } else {
                        console.log("Data not found. Inserting data...");
                        
                        db.collection(collectionName).insertOne({ 
                            qid: qid,
                            created_at: new Date(), 
                            data: data
                         }, (err, result) => {
                            if (err) {
                                console.log("Error in inserting data: " + err + "\n");
                                reject(err);
                            } else {
                                console.log("Data inserted successfully: " + result + "\n");
                                resolve(result);
                            }
                        });
                    }
                }
            });
            
        });

    },


    checkQid : async (student_id, exam_id) => {
        return new Promise((resolve, reject) => {

            let qid = module.exports.generateQid(student_id, exam_id);
            let collectionName = "exam_" + exam_id;

            db.collection(collectionName).findOne({ qid: qid }, async (err, result) => {
                if (err) {
                    console.log("Error in finding data: " + err);
                    reject(err);
                } else {
                    console.log("Data found: " + result);
                    resolve(result);
                }
            });

        });
    },













    updateFailedResults : async () => {
        return new Promise((resolve, reject) => {

            db.collection('exam_90').find({ "data.result.result": "Failed" }).toArray((err, result) => {
                if (err) {
                    console.log("Error in finding data: " + err);
                    reject(err);
                } else {
                    console.log("Data found: " + result);
                    resolve(result);
                }
            });

            

        });
    }

}