const userModel = require('../models/user.model');
const userService = require('../services/user.service');
const { validationResult } = require('express-validator');
const blackListTokenModel = require('../models/blacklistToken.model');

// registerUser function
// this function is used to register a user
module.exports.registerUser = async (req, res, next) => {
    // checking the validation result
    // if there are errors, return 400 with the errors array
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    // destructuring the request body
    // getting the fullname, email and password from the request body
    const { fullname, email, password } = req.body;


    // finding the user by email
    // if the user already exists, return 400 with the message 'User already exist'
    const isUserAlready = await userModel.findOne({ email });

    if (isUserAlready) {
        return res.status(400).json({ message: 'User already exist' });
    }
    // hashing the password using bcrypt before storing it into the database
    const hashedPassword = await userModel.hashPassword(password);

    // adding the user to the database
    // creating the user using the user service in which all inputs are checked and then user is created into the database
    // if the user is created successfully, return 201 with the user object and token
    const user = await userService.createUser({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword
    });

    const token = user.generateAuthToken();

    res.status(201).json({ token, user });
}

// loginUser function  
// this function is used to login a user
module.exports.loginUser = async (req, res, next) => {
    // checking the validation result
    // if there are errors, return 400 with the errors array
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select('+password');
    // checking if user exists or not
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    // checking if password is correct or not
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    // generating token using the user model method

    const token = user.generateAuthToken();
    // setting token into the cookie
    res.cookie('token', token);
    // sending the token and user object in the response
    res.status(200).json({ token, user });
}

// getUserProfile function
// this function is used to get the user profile
module.exports.getUserProfile = async (req, res, next) => {
    // getting the user from the request object
    const user = req.user;
    // sending the user object in the response
    res.status(200).json({ user });
}


// to logout the user
// this will add current token to the blacklist and clear the cookie
// this will make the token invalid if he tries to access the protected route again with the same token
// this will also remove the token from the cookie
module.exports.logoutUser = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization.split(' ')[1];
    res.clearCookie('token');

    await blackListTokenModel.create({ token });

    res.status(200).json({ message: 'Logged out' });

}