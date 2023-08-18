
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
                        console.log("Data found: " + result);
                        resolve(result);
                    } else {
                        console.log("Data not found. Inserting data...");
                        
                        db.collection(collectionName).insertOne({ 
                            qid: qid,
                            created_at: new Date(), 
                            data: data
                         }, (err, result) => {
                            if (err) {
                                console.log("Error in inserting data: " + err);
                                reject(err);
                            } else {
                                console.log("Data inserted successfully: " + result);
                                resolve(result);
                            }
                        });
                    }
                }
            });
            
        });

    },


    checkQid : async (id) => {
        return new Promise((resolve, reject) => {

            db.collection('results').findOne({ qid: id }, async (err, result) => {
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

}