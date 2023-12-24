const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: '',
  },
  verified: {
    type: Boolean,
    default: false,
    required: true,
    }
    
});

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
      const hash =  await bcrypt.hash(this.password, 8)
        this.password = hash

    }
    next();
})

userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
      const isMatch = await bcrypt.compare(candidatePassword, this.password);
      return isMatch;
    } catch (error) {
      throw error;
    }
  };

module.exports = mongoose.model('User', userSchema);
