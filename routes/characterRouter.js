const Router = require("express");
const router = new Router();
const characterController = require("../controllers/characterController");
const authMiddleware = require("../middleware/authMiddleware");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware");

router.get("/:URI", characterController.getOne);
router.get("/", characterController.getAll);
router.post("/", authMiddleware, characterController.create);
router.put("/:id", authMiddleware, characterController.update);
router.delete("/:id", authMiddleware, characterController.delete);

module.exports = router;
