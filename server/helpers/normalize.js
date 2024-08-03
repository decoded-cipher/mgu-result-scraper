

const { getSubjectsByDept, getDataByDept, updateWithNormalData, deleteDataByDept } = require('./database');



module.exports = {

    normalizeSubjects : async (exam_id, programme) => {
        return new Promise(async (resolve, reject) => {
    
    
            await getDataByDept(exam_id, programme).then(async (data) => {
                await getSubjectsByDept(exam_id, programme).then(async (subjects) => {

                    let normalizedData = [];
                    data.forEach(student => {


                        // check if the student has any missing subjects
                        if(student.data.result.subjects.length != subjects.length) {
                            
                            let missingSubjects = subjects.filter(subject => !student.data.result.subjects.some(studentSubject => studentSubject.course_code === subject.course_code));


                            // add the missing subjects to the student's result
                            missingSubjects.forEach(subject => {
                                student.data.result.subjects.push({

                                    course_code: subject.course_code,
                                    course: subject.course_name,
                                    credit: null,

                                    internal: {
                                        isa: null,
                                        max: null,
                                    },
                                    external: {
                                        esa: null,
                                        max: null,
                                    },

                                    total: null,
                                    max: null,
                                    grade: null,
                                    grade_points: null,
                                    credit_points: null,
                                    result: "N/A"

                                });
                            });

                        }

                        // sort the subjects by course code before pushing
                        student.data.result.subjects.sort((a, b) => (a.course_code > b.course_code) ? 1 : -1);


                        // check if the student has grade. if not, calculate the grade
                        if(student.data.result.grade == null && (student.data.result.total != null && student.data.result.max != null)) {
                            module.exports.calculateGrade(student.data.result.total, student.data.result.max).then((grade) => {
                                student.data.result.grade = grade;
                            });
                        }


                        normalizedData.push(student);
                    });


                    // update the database with the normalized data
                    await updateWithNormalData(exam_id, programme, normalizedData).then(async (update) => {
                        resolve(update);
                    }).catch((err) => { reject(err); });

                });
            });
            

        });
    },


    // deleteData : async (exam_id, programme) => {
    //     return new Promise(async (resolve, reject) => {
    //         await deleteDataByDept(exam_id, programme).then(async (deleted) => {
    //             resolve(deleted);
    //         }).catch((err) => { reject(err); });
    //     });
    // },


    calculateGrade : async (total, max) => {
        return new Promise(async (resolve, reject) => {
            let grade = "";

            switch(true) {
                case (total >= (max * 0.95)):
                    grade = "S";
                    break;
                case (total >= (max * 0.85)):
                    grade = "A+";
                    break;
                case (total >= (max * 0.75)):
                    grade = "A";
                    break;
                case (total >= (max * 0.65)):
                    grade = "B+";
                    break;
                case (total >= (max * 0.55)):
                    grade = "B";
                    break;
                case (total >= (max * 0.45)):
                    grade = "C";
                    break;
                case (total >= (max * 0.35)):
                    grade = "D";
                    break;
                default:
                    grade = "F";
            }

            resolve(grade);
        });
    }

};