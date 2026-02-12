import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { docClient } from "../utils/db.js";
import { ScanCommand } from "@aws-sdk/client-dynamodb";
import bcrypt from "bcryptjs";
import helper from "../helper/helper.js";

const USERS_TABLE = process.env.USERS_TABLE;

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "All fields (name, email, password) are required" });
  }

  const emailExists = await helper(email);
  console.log("emailExists:", emailExists);
  if (emailExists !== null) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(String(password), 10);
  const newUser = { userId: uuidv4(), name, email, password: hashedPassword };
  const params = { TableName: USERS_TABLE, Item: newUser };
  try {
    const command = new PutCommand(params);
    await docClient.send(command);
    res.json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Could not register user" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Both email and password are required" });
  }
  try {
    const emailExists = await helper(email);
    if (emailExists !== email) {
      return res.status(500).json({ error: "Invalid Credentials" });
    }

    return res.status(200).json({
      message: "User logged in successfully",
      userId: Item.userId,
      email: Item.email,
      name: Item.name,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: error.message || "Could not retrieve user" });
  }
};

export const getAllUsers = async (req, res) => {
  const params = { TableName: USERS_TABLE };
  try {
    const command = new ScanCommand(params);
    const { Items } = await docClient.send(command);
    const User = Items.map((item) => ({
      userId: item.userId,
      name: item.name,
      email: item.email,
    }));
    res.status(200).json(User);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: error.message || "Could not retrieve users" });
  }
};

export const getUserById = async (req, res) => {
  const { userId } = req.params;
  const params = { TableName: USERS_TABLE, Key: { userId } };
  try {
    const command = new GetCommand(params);
    const { Item } = await docClient.send(command);
    if (Item) {
      res
        .status(200)
        .json({ userId: Item.userId, name: Item.name, email: Item.email });
    } else {
      res
        .status(404)
        .json({ error: 'Could not find user with provided "userId"' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message || "Could not retrieve user" });
  }
};
