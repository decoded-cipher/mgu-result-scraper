
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
        
        let qid = module.exports.generateQid(student_id, exam_id);
        data = {
            ...data,
            qid: qid,
        }

        let result = await module.exports.checkQid(qid);
        if (result) {
            console.log("Data already present in database...");
            return;
        }
        
        await db.collection('results').insertOne(data, async (err, res) => {
            if (err) throw err;
            console.log("Data inserted successfully...");
        });

    },

    checkQid : async (qid) => {
        let result = await db.collection('results').findOne({ qid: qid });
        return result;
    },

}