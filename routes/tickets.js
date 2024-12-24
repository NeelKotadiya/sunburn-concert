const express = require('express');
const mongoose = require('mongoose');
const QRCode = require('qrcode'); // Import the QRCode library
const router = express.Router();
const path = require('path'); // Import path module

// Define Schema
const ticketSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    ticketType: { type: String, required: true },
    transactionId: { type: Number, required: true },
    mobile: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    isScanned: { type: Boolean, default: false } ,// Add this field
    totalAmount: { type: Number, required: true },
    quantity: { type: Number, required: true }
});

// Define Model
const Ticket = mongoose.model('Ticket', ticketSchema);

// POST route to submit ticket data
router.post('/submit', async (req, res) => {
    const { name, email, ticketType,transactionId,mobile,isScanned ,totalAmount,quantity} = req.body.data;
   
    try {
        const newTicket = new Ticket({ name, email, ticketType,transactionId,mobile,isScanned,totalAmount,quantity});
        await newTicket.save();
        res.status(200).json({ message: 'Data submitted successfully!'  });
    } catch (error) {
        res.status(500).json('Error saving data to MongoDB: ' + error.message);
    }
});


router.get('/verify-ticket', async (req, res) => {
    const { transactionId } = req.query; // Get the ticket ID from the query parameters
      // Ensure transactionId is provided
      if (!transactionId) {
        return res.status(400).json({ message: 'Transaction ID is required.' });
    }
    // Check the database for the ticket
    const ticket = await Ticket.findOne({ transactionId: transactionId });
    
    if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.isScanned) {
        res.sendFile(path.join(__dirname, '..', 'public', 'scannedticket.html'));
    }
    else{
        // Mark the ticket as scanned
    ticket.isScanned = true;
    await ticket.save();

    res.sendFile(path.join(__dirname, '..', 'public', 'ticket.html')); // Adjust path if necessary

    }

    
});
router.get('/get-ticket', async (req, res) => {
    const { transactionId } = req.query; // Get the transaction ID from query parameters
    
    // Check the database for the ticket
    const ticket = await Ticket.findOne({ transactionId: transactionId });

    if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
    }

    // If ticket is found, return the ticket details
    res.json({ message: 'Ticket found', ticket });
});




module.exports = router;
