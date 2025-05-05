const mongoose = require('mongoose');

// User Schema Description
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
});

// Model Generation
const User = mongoose.model('User', userSchema);

module.exports = User;