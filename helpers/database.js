
const crypto = require('crypto');
let chalk = require('chalk');
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
                    console.log(chalk.redBright("--- [checkQid] --- Error in finding data: " + err));
                    reject(err);
                } else {
                    console.log(chalk.yellowBright("--- [checkQid] --- Data found: " + result));
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
                    console.log(chalk.redBright("--- [saveData] --- Error in inserting data: " + err + "\n"));
                    reject(err);
                } else {
                    console.log(chalk.greenBright("--- [saveData] --- Data inserted successfully: " + result + "\n"));
                    resolve(result);
                }
            });

        });

    },



    // Fetch data from database
    getDataByDept : async (exam_id, programme) => {
        return new Promise(async (resolve, reject) => {

            // Generate collection name
            let collectionName = "exam_" + exam_id;

            console.log("--- [getDataByDept] --- Fetching data for : " + programme);

            // Fetch data from database
            db.collection(collectionName).find({ "data.programme": programme }).sort({ "data.prn": 1 }).toArray((err, result) => {
                if (err) {
                    console.log(chalk.redBright("--- [getDataByDept] --- Error in fetching data: \n"));
                    reject(err);
                } else {
                    console.log(chalk.yellowBright("--- [getDataByDept] --- Data fetched successfully: \n"));
                    resolve(result);
                }
            });

        });

    },



    // Get the top 5 students from a department based on their marks in descending order (data.result.total)
    getTop5ByDept : async (exam_id, programme) => {
        return new Promise(async (resolve, reject) => {

            // Generate collection name
            let collectionName = "exam_" + exam_id;

            console.log("--- [getTop5ByDept] --- Fetching data for : " + programme);

            // Fetch data from database
            db.collection(collectionName).find({ "data.programme": programme }).sort({ "data.result.total": -1 }).limit(5).toArray((err, result) => {
                if (err) {
                    console.log(chalk.redBright("--- [getTop5ByDept] --- Error in fetching data: \n"));
                    reject(err);
                } else {
                    console.log(chalk.yellowBright("--- [getTop5ByDept] --- Data fetched successfully: \n"));
                    resolve(result);
                }
            });

        });

    },



    // Get the count of pass and fail of each subject in a department
    getSubjectPassFailCount : async (exam_id, programme) => {
        return new Promise(async (resolve, reject) => {

            // Generate collection name
            let collectionName = "exam_" + exam_id;

            console.log("--- [getSubjectPassFailCount] --- Fetching data for : " + programme);

            db.collection(collectionName).aggregate([
                { $match: { "data.programme": programme } },
                { $unwind: "$data.result.subjects" },
                {
                    $group: {
                        _id: "$data.result.subjects.course",
                        pass: { $sum: { $cond: [{ $eq: ["$data.result.subjects.result", "Passed"] }, 1, 0] } },
                        fail: { $sum: { $cond: [{ $eq: ["$data.result.subjects.result", "Failed"] }, 1, 0] } }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        name: "$_id",
                        pass: 1,
                        fail: 1
                    }
                }
            ]).toArray((err, result) => {
                if (err) {
                    console.log(chalk.redBright("--- [getSubjectPassFailCount] --- Error in fetching data: \n"));
                    reject(err);
                } else {
                    console.log(chalk.yellowBright("--- [getSubjectPassFailCount] --- Data fetched successfully: \n"));
                    resolve(result);
                }
            });

        });

    },



    // get subject wise top marks
    getSubjectTopMarks : async (exam_id, programme) => {
        return new Promise(async (resolve, reject) => {

            // Generate collection name
            let collectionName = "exam_" + exam_id;

            console.log("--- [getSubjectTopMarks] --- Fetching data for : " + programme);

            db.collection(collectionName).aggregate([
                { $match: { "data.programme": programme } },
                { $unwind: "$data.result.subjects" },
                {
                    $group: {
                        _id: "$data.result.subjects.course",
                        result: { $max: "$data.result.subjects" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        result: 1
                    }
                }

            ]).toArray(async (err, topMarks) => {
                if (err) {
                    console.log(chalk.redBright("--- [getSubjectTopMarks] --- Error in fetching data: \n"));
                    reject(err);
                } else {
                    console.log(chalk.yellowBright("--- [getSubjectTopMarks] --- Data fetched successfully: \n"));
                    resolve(topMarks);
                }
            });

        });

    },



    // get subject wise top mark holders
    getAllSubjectToppers : async (exam_id, programme) => {
        return new Promise(async (resolve, reject) => {

            console.log("--- [getAllSubjectToppers] --- Fetching data for : " + programme);

            // get subject wise top marks first
            let topMarks = await module.exports.getSubjectTopMarks(exam_id, programme);

            let topMarkHolders = [];

            // get subject wise toppers
            for (let i = 0; i < topMarks.length; i++) {
                let result = await module.exports.getSubjectTopper(topMarks[i].result.course, topMarks[i].result.total, exam_id, programme);
                topMarkHolders.push(result);
            }

            console.log(chalk.yellowBright("--- [getAllSubjectToppers] --- Data fetched successfully: \n"));

            topMarkHolders.forEach((sub, index) => {
                let item = {
                    course: topMarks[index].result.course,
                    count: sub.length,
                    marks: topMarks[index].result.total,
                    grade: topMarks[index].result.grade,
                    toppers: []
                }

                sub.forEach((student) => {
                    item.toppers.push({
                        name: student.name,
                        prn: student.prn
                    });
                });

                topMarkHolders[index] = item;
            });

            resolve(topMarkHolders);

        });

    },



    // get subject wise topper
    getSubjectTopper : async (course, total, exam_id, programme) => {
        return new Promise(async (resolve, reject) => {

            // Generate collection name
            let collectionName = "exam_" + exam_id;

            console.log("--- [getSubjectTopper] --- Fetching data for : " + programme);

            db.collection(collectionName).aggregate([
                { $match: { "data.programme": programme } },
                { $unwind: "$data.result.subjects" },
                { $match: { "data.result.subjects.course": course, "data.result.subjects.total": total } },
                {
                    $project: {
                        _id: 0,
                        name: "$data.name",
                        prn: "$data.prn",
                        grade: "$data.result.subjects.grade",
                        course: "$data.result.subjects.course",
                        marks: "$data.result.subjects.total"
                    }
                }

            ]).toArray((err, result) => {
                if (err) {
                    console.log(chalk.redBright("--- [getSubjectTopper] --- Error in fetching data: \n"));
                    reject(err);
                } else {
                    console.log(chalk.yellowBright("--- [getSubjectTopper] --- Data fetched successfully: \n"));
                    resolve(result);
                }
            });

        });

    },



    // Delete data from database based on programme
    deleteDataByDept : async (exam_id, programme) => {
        return new Promise(async (resolve, reject) => {

            // Generate collection name
            let collectionName = "exam_" + exam_id;

            console.log("--- [deleteDataByDept] --- Deleting data for : " + programme);

            // Delete data from database
            db.collection(collectionName).deleteMany({ "data.programme": programme }, (err, result) => {
                if (err) {
                    console.log(chalk.redBright("--- [deleteDataByDept] --- Error in deleting data: \n"));
                    reject(err);
                } else {
                    console.log(chalk.yellowBright("--- [deleteDataByDept] --- Data deleted successfully: \n"));
                    resolve(result);
                }
            });

        });

    },



    // Get all subjects based on programme
    getSubjectsByDept : async (exam_id, programme) => {
        return new Promise(async (resolve, reject) => {

            console.log("--- [getSubjectsByDept] --- Fetching data for : " + programme);

            // Generate collection name
            let collectionName = "exam_" + exam_id;

            db.collection(collectionName).aggregate([
                { $match: { "data.programme": programme } },
                { $unwind: "$data.result.subjects" },
                {
                    $group: {
                        _id: "$data.result.subjects.course_code",
                        name: { $first: "$data.result.subjects.course" },
                    }
                },
                {
                    $project: {
                        _id: 0,
                        course_code: "$_id",
                        course_name: "$name"
                    }
                }
            ]).toArray((err, result) => {
                if (err) {
                    console.log(chalk.redBright("--- [getSubjectsByDept] --- Error in fetching data: \n"));
                    reject(err);
                } else {
                    console.log(chalk.yellowBright("--- [getSubjectsByDept] --- Data fetched successfully: \n"));
                    resolve(result);
                }
            });

        });

    },



    // Update any data in database
    updateWithNormalData : async (exam_id, programme, data) => {
        return new Promise(async (resolve, reject) => {

            console.log("--- [updateWithNormalData] --- Updating data for : " + programme);

            // Generate collection name
            let collectionName = "exam_" + exam_id;


            // Initialize bulk operation
            let bulk = db.collection(collectionName).initializeUnorderedBulkOp();
            data.forEach((student) => {
                bulk.find({ qid: student.qid }).updateOne({ $set: { data: student.data } });
            });

            // Execute bulk operation
            bulk.execute((err, result) => {
                if (err) {
                    console.log(chalk.redBright("--- [updateWithNormalData] --- Error in updating data: \n"));
                    reject(err);
                } else {
                    console.log(chalk.greenBright("--- [updateWithNormalData] --- Data updated successfully: \n"));
                    resolve(result);
                }
            });

        });

    },



}