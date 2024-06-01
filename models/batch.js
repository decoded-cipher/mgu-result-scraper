
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const BatchSchema = new mongoose.Schema({
    batch_id: {
        type: String,
        required: true,
        unique: true,
        default: () => nanoid()
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    programme: {
        type: String,
        required: false
    },
    prn: {
        type: Array,
        required: true,
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
}, { collection: 'batch' });

module.exports = mongoose.model('Batch', BatchSchema);