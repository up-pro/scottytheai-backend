import express, { Router } from "express";
import {
  createChatHistory,
  deleteChatHistory,
  getChatHistories,
  saveMessages,
  updateTitleOfChatHistory
} from "../controllers/chatController";

const router: Router = express.Router();

router.post("/create-history", createChatHistory);
router.post("/save-messages", saveMessages);
router.delete("/delete-history/:id", deleteChatHistory);
router.get("/get-histories/:creatorWalletAddress", getChatHistories);
router.put("/update-title/:id", updateTitleOfChatHistory);

module.exports = router;
