
const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
    exam_id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: false
    },
    mode: {
        type: String,
        required: true,
        default: 'UG',
        enum: ['UG', 'PG']
    },

    // programme: {
    //     type: String,
    //     required: false
    // },
    
    created_at: {
        type: Date,
        required: false,
        default: Date.now
    },
    updated_at: {
        type: Date,
        required: false,
        default: Date.now
    }
}, { collection: 'exam' });

module.exports = mongoose.model('Exam', ExamSchema);