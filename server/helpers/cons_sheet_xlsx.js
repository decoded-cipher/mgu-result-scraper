const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ExcelJS = require('exceljs');


const { getDataByDept } = require('./database');
// const data = require('../public/xlsx/data.json');

module.exports = {


    // Generate XLSX file
    generate_XLSX : async (exam_id, programme, title) => {
        return new Promise(async (resolve, reject) => {

            await getDataByDept(exam_id, programme).then(async (data) => {

                let resultStats = {
                    overall : {
                        pass : {
                            count : 0,
                        },
                        fail : {
                            count : 0,
                            index : [],
                            names : [],
                        },
                        grades: {
                            "S" : 0,
                            "A+" : 0,
                            "A" : 0,
                            "B+" : 0,
                            "B" : 0,
                            "C" : 0,
                            "D" : 0,
                            "F" : 0,
                        }
                    },
                    subjects : [],

                }

                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Results', {
                    pageSetup: { 
                        paperSize: 9,
                        orientation: 'landscape',
                        fitToPage: true,
                        fitToWidth: 1,
                        fitToHeight: 0,
                        horizontalCentered: true,
                    },
                    headerFooter: {
                        oddHeader: '&R&H&"Times New Roman,Regular"&11' + title + '&L&H&"Times New Roman,Regular"&11Kristu Jyoti College of Management \& Technology',
                        oddFooter: '&L&H&"Times New Roman,Regular"&11Generated by MGU Result Scrapper&C&H&"Times New Roman,Regular"&11 Page &P of &N&R&H&"Times New Roman,Regular"&11Powered by Inovus Labs',
                    },
                });


                
                // Add metadata to the XLSX file
                workbook.creator = 'Inovus Labs';
                workbook.lastModifiedBy = 'Arjun Krishna';

                workbook.title = 'Consolidated Marklist';
                workbook.subject = 'MGU Result Scrapper';
                workbook.category = 'MGU Result Scrapper';
                workbook.description = 'Consolidated marklist of all students';
                workbook.keywords = 'MGU, Result, Scrapper, Consolidated, Marklist';
                workbook.company = 'Inovus Labs';

                workbook.created = new Date();
                workbook.modified = new Date();
                workbook.lastPrinted = new Date();



                worksheet.properties.defaultRowHeight = 25;
                worksheet.properties.defaultColWidth = 9;

                worksheet.getColumn('A').width = 20;
                worksheet.getColumn('B').width = 30;
        
                worksheet.mergeCells('A4:A5');
                worksheet.mergeCells('B4:B5');


                
                // Populate the XLSX file with data, column wise
                await module.exports.getDataAsArray(data, resultStats).then((response) => {

                    worksheet.getColumn('A').values = [null, null, null, null, "Register Number", ...response.results.prn];
                    worksheet.getColumn('B').values = [null, null, null, null, "Name", ...response.results.names];

                    // Subject wise marks and grades
                    for(let i = 0; i <= response.results.subjects.length; i++) {

                        let cell_11 = String.fromCharCode(67 + (i * 2)) + "4";
                        let cell_12 = String.fromCharCode(68 + (i * 2)) + "4";

                        // If the loop is at the last iteration (<=), then its the overall section
                        // Else, add the subject wise marks and grades
                        if(i == response.results.subjects.length) {

                            cell_12 = String.fromCharCode(70 + (i * 2)) + "4";
                            worksheet.mergeCells(cell_11 + ":" + cell_12);

                            worksheet.getColumn(String.fromCharCode(67 + (i * 2))).values = [null, null, null, null, "Marks", ...response.results.overall.marks];
                            worksheet.getColumn(String.fromCharCode(68 + (i * 2))).values = [null, null, null, null, "CP", ...response.results.overall.cp];
                            worksheet.getColumn(String.fromCharCode(69 + (i * 2))).values = [null, null, null, null, "Grade", ...response.results.overall.grade];
                            worksheet.getColumn(String.fromCharCode(70 + (i * 2))).values = [null, null, null, "Overall", "SGPA", ...response.results.overall.sgpa];
                        
                        } else {
                            worksheet.mergeCells(cell_11 + ":" + cell_12);
                            worksheet.getColumn(String.fromCharCode(67 + (i * 2))).values = [null, null, null, null, "Marks", ...response.results.subjects[i].marks];
                            worksheet.getColumn(String.fromCharCode(68 + (i * 2))).values = [null, null, null, response.subjectList[i], "Grade", ...response.results.subjects[i].grade];

                        }

                    }

                }).catch((err) => {
                    console.log(chalk.redBright("--- [xlsx - generate_XLSX] --- Error in getting data as array: " + err));
                    reject({
                        status: "error",
                        message: "Error in getting data as array: ",
                        error: err
                    });
                });



                // Styling the XLSX file (fonts, borders, alignment, etc.)
                worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {

                        if(colNumber == 2 && rowNumber > 5) {
                            cell.alignment = {
                                wrapText: true,
                                vertical: 'middle',
                                horizontal: 'left',
                                indent: 1,
                            }
                        } else {
                            cell.alignment = {
                                wrapText: true,
                                vertical: 'middle',
                                horizontal: 'center'
                            }
                        }

                        cell.border = {
                            top: { style:'thin' },
                            left: { style:'thin' },
                            bottom: { style:'thin' },
                            right: { style:'thin' }
                        },

                        cell.font = {
                            name: 'Times New Roman',
                            size: 11,
                        }

                    });

                    if(rowNumber == 4) {
                        row.height = 75;
                    } else {
                        row.height = 25;
                    }

                    // if rowNumber exists in resultStats, then highlight the row
                    if(resultStats.overall.fail.index.includes(rowNumber - 6)) {
                        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
                            cell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: 'FFFABF8F' },
                                bgColor: { argb: 'FFFABF8F' }
                            }
                        });
                    }

                    // if any subject was skipped, then highlight the row
                    for(let i = 0; i < resultStats.subjects.length; i++) {
                        if(resultStats.subjects[i].skip.index.includes(rowNumber - 6)) {

                            let cell_1 = String.fromCharCode(67 + (i * 2));
                            let cell_2 = String.fromCharCode(68 + (i * 2));

                            row.getCell(cell_1).fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: 'FFF0F0F0' },
                                bgColor: { argb: 'FFF0F0F0' }
                            }
                            row.getCell(cell_2).fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: 'FFF0F0F0' },
                                bgColor: { argb: 'FFF0F0F0' }
                            }

                        }
                    }


                });


                // Write data to XLSX file
                await workbook.xlsx.writeFile(path.join(__dirname, '../public/xlsx/Consolidated Marklist.xlsx')).then(() => {
                    console.log(chalk.greenBright("--- [xlsx - generate_XLSX] --- Consolidated Marklist generated successfully."));
                    resolve({
                        status: "success",
                        message: "Consolidated Marklist generated successfully.",
                        resultStats: resultStats,
                    });
                }).catch((err) => {
                    console.log(chalk.redBright("--- [xlsx - generate_XLSX] --- Error in writing data to XLSX file: "));
                    reject({
                        status: "error",
                        message: "Error in writing Consolidated Marklist: ",
                        error: err
                    });
                });


                
            }).catch((err) => {
                console.log(chalk.redBright("--- [xlsx - generate_XLSX] --- Error in fetching data from database: " + err));
                reject({
                    status: "error",
                    message: "Error in fetching data from database: ",
                    error: err
                });
            });

        });
    },


    
    // Convert data to array, so that it can be used in XLSX
    getDataAsArray : async (data, resultStats) => {
        return new Promise(async (resolve, reject) => {

            // Get the subject list
            let subjectList = [];
            for(let i = 0; i < data[0].data.result.subjects.length; i++) {
                subjectList.push(data[0].data.result.subjects[i].course);
            }

            let results = {
                prn : [],
                names : [],
                subjects : [],
                overall : {
                    marks : [],
                    cp : [],
                    grade : [],
                    sgpa : [],
                }
            };

            // Get the overall marks and grades
            for(let i = 0; i < data.length; i++) {
                
                results.prn.push(data[i].data.prn);
                results.names.push(data[i].data.name);

                let markHolder = data[i].data.result.total;
                let cpHolder = data[i].data.result.credit_points;
                let gradeHolder = data[i].data.result.grade;
                let sgpaHolder = data[i].data.result.scpa;

                // Count the overall grades
                switch(gradeHolder) {
                    case "S":
                        resultStats.overall.grades["S"]++;
                        break;
                    case "A+":
                        resultStats.overall.grades["A+"]++;
                        break;
                    case "A":
                        resultStats.overall.grades["A"]++;
                        break;
                    case "B+":
                        resultStats.overall.grades["B+"]++;
                        break;
                    case "B":
                        resultStats.overall.grades["B"]++;
                        break;
                    case "C":
                        resultStats.overall.grades["C"]++;
                        break;
                    case "D":
                        resultStats.overall.grades["D"]++;
                        break;
                    default:
                        resultStats.overall.grades["F"]++;
                }
                
                // Count the overall pass and fail
                if(markHolder === null) {
                    resultStats.overall.fail.index.push(i);
                    resultStats.overall.fail.names.push(data[i].data.name);
                    resultStats.overall.fail.count++;
                } else {
                    resultStats.overall.pass.count++;
                }

                // Handling null values in the data with "-" and "F"
                markHolder === null ? markHolder = "-" : markHolder = markHolder;
                cpHolder === null ? cpHolder = "-" : cpHolder = cpHolder;
                gradeHolder === null ? gradeHolder = "F" : gradeHolder = gradeHolder;
                sgpaHolder === null ? sgpaHolder = "-" : sgpaHolder = sgpaHolder;

                results.overall.marks.push(markHolder);
                results.overall.cp.push(cpHolder);
                results.overall.grade.push(gradeHolder);
                results.overall.sgpa.push(sgpaHolder);

            }

            // Get the subject wise marks and grades
            for(let i = 0; i < data[0].data.result.subjects.length; i++) {
                
                let subject = {
                    marks : [],
                    isa : [],
                    esa : [],
                    grade : [],
                };

                resultStats.subjects[i] = {
                    name : null,
                    pass : {
                        count : 0,
                    },
                    fail : {
                        count : 0,
                        index : [],
                        names : [],
                    },
                    skip : {
                        count : 0,
                        index : [],
                        names : [],
                    },
                    grades: {
                        "S" : 0,
                        "A+" : 0,
                        "A" : 0,
                        "B+" : 0,
                        "B" : 0,
                        "C" : 0,
                        "D" : 0,
                        "F" : 0,
                    }
                };
                
                for(let j = 0; j < data.length; j++) {

                    let markHolder = data[j].data.result.subjects[i].total;
                    let isaHolder = data[j].data.result.subjects[i].internal.isa;
                    let esaHolder = data[j].data.result.subjects[i].external.esa;
                    let gradeHolder = data[j].data.result.subjects[i].grade;
                    let maxHolder = data[j].data.result.subjects[i].max;

                    // Count the subject wise grades
                    switch(gradeHolder) {
                        case "S":
                            resultStats.subjects[i].grades["S"]++;
                            break;
                        case "A+":
                            resultStats.subjects[i].grades["A+"]++;
                            break;
                        case "A":
                            resultStats.subjects[i].grades["A"]++;
                            break;
                        case "B+":
                            resultStats.subjects[i].grades["B+"]++;
                            break;
                        case "B":
                            resultStats.subjects[i].grades["B"]++;
                            break;
                        case "C":
                            resultStats.subjects[i].grades["C"]++;
                            break;
                        case "D":
                            resultStats.subjects[i].grades["D"]++;
                            break;
                        default:

                            if(markHolder === null && maxHolder !== null) {
                                resultStats.subjects[i].grades["F"]++;
                            }
                    }

                    resultStats.subjects[i].name = data[j].data.result.subjects[i].course;

                    // Count the subject wise pass and fail
                    if(markHolder === null) {

                        if(maxHolder === null) {
                            resultStats.subjects[i].skip.index.push(j);
                            resultStats.subjects[i].skip.names.push(data[j].data.name);
                            resultStats.subjects[i].skip.count++;
                        } else {
                            resultStats.subjects[i].fail.index.push(j);
                            resultStats.subjects[i].fail.names.push(data[j].data.name);
                            resultStats.subjects[i].fail.count++;
                        }

                    } else {
                        resultStats.subjects[i].pass.count++;
                    }
                    
                    // Handling null values in the data with "-" and "F"
                    markHolder === null ? markHolder = "-" : markHolder = markHolder;
                    isaHolder === null ? isaHolder = "-" : isaHolder = isaHolder;
                    esaHolder === null ? esaHolder = "-" : esaHolder = esaHolder;

                    gradeHolder === null ? (maxHolder === null ? gradeHolder = "-" : gradeHolder = "F") : gradeHolder = gradeHolder;

                    subject.marks.push(markHolder);
                    subject.isa.push(isaHolder);
                    subject.esa.push(esaHolder);
                    subject.grade.push(gradeHolder);

                }

                results.subjects.push(subject);

            }

            resolve({
                results : results,
                subjectList : subjectList,
            });

        });
    },






};


