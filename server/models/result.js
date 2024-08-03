
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const ResultSchema = new mongoose.Schema({
    result_id: {
        type: String,
        required: true,
        unique: true,
        default: () => nanoid()
    },
    mode: {
        type: String,
        required: true,
        default: 'batch',
        enum: ['batch', 'single']
    },
    batch_id: {
        type: String,
        required: false
    },
    prn: {
        type: String,
        required: false
    },
    exam_id: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    requested_by: {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: false,
        default: 'pending',
        enum: ['pending', 'in-progress', 'completed', 'failed']
    },
    jobs: {
        type: Array,
        required: false,
        default: []
    },
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
}, { collection: 'result' });

module.exports = mongoose.model('Result', ResultSchema);