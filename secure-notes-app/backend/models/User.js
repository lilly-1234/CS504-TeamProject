const mongoose = require('mongoose');

// User Schema Description
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    totpSecret: { type: String }, // Store TOTP secret for MFA
});

// Model Generation
const User = mongoose.model('User', userSchema);

module.exports = User;

// //TODO: Seting UP MFA
// Sign Up

// //
// Login -> Validate 
//     generate secret
//     show QR (generation of code)
//     open GA app
//     verify the code