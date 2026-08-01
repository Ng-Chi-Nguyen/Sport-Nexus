import express from "express";
import emailController from "../../controllers/email/email.controller.js";

const sendEmailRoute = express.Router();

sendEmailRoute

    .post("/welcome", emailController.sendWelcome)
    .post("/support", emailController.sendSupport)

export default sendEmailRoute;