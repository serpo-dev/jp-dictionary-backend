const Router = require("express");
const router = new Router();

const userRouter = require("./userRouter");
const characterRouter = require("./characterRouter");
const kanjiRouter = require("./kanjiRouter");
const componentRouter = require("./componentRouter");
const commentRouter = require("./commentRouter");
const chatRouter = require("./chatRouter");
const questionRouter = require("./questionRouter");

router.use("/user", userRouter);

router.use("/character", characterRouter);
router.use("/kanji", kanjiRouter);
router.use("/component", componentRouter);

router.use("/comment", commentRouter);
router.use("/chat", chatRouter);

router.use("/question", questionRouter);

module.exports = router;
