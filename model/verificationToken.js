const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const verificationTokenSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        expires: 3600, // Expires in 3600 seconds (1 hour)
        default: Date.now
    }
});

verificationTokenSchema.pre('save', async function (next) {
    if (this.isModified('token')) {
        const hash = await bcrypt.hash(this.token, 8);
        this.token = hash;
    }
    next();
});

verificationTokenSchema.methods.compareToken = async function (token) {
    try {
        const result = await bcrypt.compare(token, this.token);
        return result;
    } catch (error) {
        throw error;
    }
};

module.exports = mongoose.model('VerificationToken', verificationTokenSchema);
