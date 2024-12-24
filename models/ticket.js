const mongoose = require('mongoose');

// Define Schema
const ticketSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    ticketType: { type: String, required: true },
    transactionId: { type: Number, required: true },
    mobile: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    isScanned: { type: Boolean, default: false }, // Add this field
    totalAmount: { type: Number, required: true },
    quantity: { type: Number, required: true }
});

// Define Model
const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
