import express from "express";
const router = express.Router();

import { loginUser, registerUser, getAllUsers, getUserById } from "../controllers/userController.js";

router.post("/register",registerUser);

router.post("/login", loginUser);

router.get("/:userId", getUserById);


router.get("/", getAllUsers);



export default router;