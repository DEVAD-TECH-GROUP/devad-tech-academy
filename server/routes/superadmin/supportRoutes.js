import express from "express";
import {
  getAllTickets, getTicket, respondToTicket, closeTicket,
  getKnowledgeBase, createKBArticle, updateKBArticle,
} from "../../controllers/superadmin/supportController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/tickets", getAllTickets);
router.get("/tickets/:id", getTicket);
router.put("/tickets/:id/respond", respondToTicket);
router.put("/tickets/:id/close", closeTicket);
router.get("/knowledge-base", getKnowledgeBase);
router.post("/knowledge-base", createKBArticle);
router.put("/knowledge-base/:id", updateKBArticle);

export default router;