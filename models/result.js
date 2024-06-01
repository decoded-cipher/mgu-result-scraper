
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const ResultSchema = new mongoose.Schema({
    result_id: {
        type: String,
        required: true,
        unique: true,
        default: () => nanoid()
    },
    batch_id: {
        type: String,
        required: true
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