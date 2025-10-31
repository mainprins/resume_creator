import User from "../models/User.model.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const generateToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return token;
}

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Required data cannot be empty." })
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists." })
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name, email, password: hashedPassword
    })
    const token = generateToken(newUser._id);
    newUser.password = undefined;

    return res.status(201).json({ message: "New user registered successfully", token, user: newUser });
  } catch (error) {
    console.log("Error in registerUser controller", error);
    return res.status(400).json({ message: "Internal Server Error" })
  }
}

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Required data cannot be empty." })
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Either your email or password is incorrect." })
    }

    if (!user.comparePassword(password)) {
      return res.status(400).json({ message: "Either your email or password is incorrect." })
    }

    const token = generateToken(user._id);
    user.password = undefined;

    return res.status(200).json({ message: "Logged in successfully", token, user });
  } catch (error) {
    console.log("Error in loginUser controller", error);
    return res.status(400).json({ message: "Internal Server Error" })
  }
}

export const getUserById = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(400).json({ message: "User not found." })
    }
    return res.status(200).json({ user });

  } catch (error) {
    console.log("Error in getUserById controller", error);
    return res.status(400).json({ message: "Internal Server Error" })
  }
}