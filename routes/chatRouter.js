const Router = require("express");
const router = new Router();
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware");

router.get("/:id", authMiddleware, chatController.getOne);
router.get("/", authMiddleware, chatController.getMany);
router.post("/", authMiddleware, chatController.create);
router.put("/:id", authMiddleware, chatController.update);
router.delete("/:id", authMiddleware, chatController.delete);

module.exports = router;
