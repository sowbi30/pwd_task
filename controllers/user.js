const User = require('../model/user');
const ResetToken = require('../model/resetToken');
const VerificationToken = require('../model/verificationToken');
const { sendError, createRandomBytes } = require('../utils/helper');
const jwt = require('jsonwebtoken');
const { generateOTP, mailTransport, generateEmailTemplate, plainEmailTemplate, generatePasswordResetTemplate } = require('../utils/mail');
const { isValidObjectId } = require('mongoose');


exports.createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findOne({ email });

        if (user) {
            return sendError(res, 'This email is already in use.');
        }

        const newUser = new User({
            name,
            email,
            password,
        });

        const OTP = generateOTP();
        const verificationToken = new VerificationToken({
            owner: newUser._id,
            token: OTP
        });

        await verificationToken.save();
        await newUser.save();

        mailTransport().sendMail({
            from: 'emailverification@email.com',
            to: newUser.email,
            subject: 'Verify your email account',
            html: generateEmailTemplate(OTP),
        });
        res.json({
            success: true, user: { name: newUser.name, email: newUser.email, id: newUser._id, verified: newUser.verified },
        });
    } catch (error) {
        console.error(error);
        sendError(res, 'Internal Server Error');
    }
};

exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email.trim() || !password.trim()) {
            return sendError(res, 'Email or password is missing.');
        }

        const user = await User.findOne({ email });

        if (!user) {
            return sendError(res, 'User not found.');
        }

        const isMatched = await user.comparePassword(password);

        if (!isMatched) {
            return sendError(res, 'Email or password does not match.');
        }

        const token = jwt.sign({ userid: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.json({
            success: true,
            user: { name: user.name, email: user.email, id: user._id, token },
        });
    } catch (error) {
        console.error(error);
        sendError(res, 'Internal Server Error');
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        if (!userId || !otp.trim()) return sendError(res, 'Invalid request, missing parameters!');

        if (!isValidObjectId(userId)) return sendError(res, 'Invalid user id!');

        const user = await User.findById(userId);
        if (!user) return sendError(res, 'Sorry user not found!');

        if (user.verified) return sendError(res, 'This account is already verified!');

        const token = await VerificationToken.findOne({ owner: user._id });
        if (!token) return sendError(res, 'Token not found!');

        const isMatched = await token.compareToken(otp);
        if (!isMatched) return sendError(res, 'Please provide a valid token');

        user.verified = true;
        await user.save();

        await VerificationToken.findByIdAndDelete(token._id);

        mailTransport().sendMail({
            from: 'emailverification@email.com',
            to: user.email,
            subject: 'Welcome Mail',
            html: plainEmailTemplate(
                'Email verified Successfully', 'Thanks for connecting with us'),
        });

        res.json({
            success: true,
            message: "Your email is verified",
            user: { name: user.name, email: user.email, id: user._id }
        });
    } catch (error) {
        console.error(error);
        sendError(res, 'Internal Server Error');
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return sendError(res, 'Please provide a valid email id!')
    
    const user = await User.findOne({ email });
    if (!user) return sendError(res, 'user not found!')

    const token = await ResetToken.findOne({ owner: user._id })
    if (token) return sendError(res, 'Only after one hour you can request for another token!')

    const RandomBytes = await createRandomBytes()
    const resetToken = new ResetToken({ owner: user._id, token: RandomBytes })
    await resetToken.save()
    
    mailTransport().sendMail({
        from: 'security@email.com',
        to: user.email,
        subject: 'password reset Mail',
        html: generatePasswordResetTemplate(
            `http://localhost:3000/reset-password?token=${RandomBytes}&id=${user._id}`),
    });
    res.json({success: true, message: "password reset link is sent to your mail!"})


}

exports.resetPassword = async (req, res) => {
    try {
        const { password } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) return sendError(res, "User not found");

        const isSamePassword = await user.comparePassword(password);
        if (isSamePassword) return sendError(res, "New password must be different");

        if (password.trim().length < 8 || password.trim().length > 20)
            return sendError(res, "Password must be 8 - 20 characters long");

        user.password = password.trim();
        await user.save();

        await ResetToken.findOneAndDelete({ owner: user._id });

        mailTransport().sendMail({
            from: 'security@email.com',
            to: user.email,
            subject: 'Password reset successfully',
            html: plainEmailTemplate(
                'Password reset successfully',
                'Now you can login with a new password'),
        });

        res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        console.error(error);
        sendError(res, 'Internal Server Error');
    }
};