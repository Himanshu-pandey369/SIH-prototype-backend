import User from "../models/User.js";
import { generateAccessToken, setTokenCookie, clearTokenCookie } from "../utils/token.js";

// @desc    Register a new worker
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, industry, preferredLanguage } = req.body;

    // Validate incoming data
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required fields."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters."
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    // Security rule: Public registration cannot create an admin
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "worker",
      industry: industry || "mining",
      preferredLanguage: preferredLanguage || "en"
    });

    const token = generateAccessToken(user._id);
    setTokenCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "Worker registered successfully",
      token,
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Registration failed due to a server error.",
      error: error.message
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password."
      });
    }

    // Explicitly query user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const token = generateAccessToken(user._id);
    setTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed due to a server error.",
      error: error.message
    });
  }
};

// @desc    Get currently authenticated user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: {
        user: req.user
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user profile.",
      error: error.message
    });
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    clearTokenCookie(res);
    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed.",
      error: error.message
    });
  }
};
