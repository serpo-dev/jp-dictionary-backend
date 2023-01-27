const Router = require("express");
const router = new Router();
const questionController = require("../controllers/questionController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", questionController.getQuestions);
router.get("/user", authMiddleware, questionController.getUserQuestions);
router.get("/:questionId", questionController.getQuestionById);
router.get("/tag/:tagName", questionController.getQuestionsByTag);
router.post("/", authMiddleware, questionController.createQuestion);
router.put("/:questionId", authMiddleware, questionController.updateQuestion);
router.delete(
    "/:questionId",
    authMiddleware,
    questionController.deleteQuestion
);
router.get("/:questionId/answers", questionController.getAnswers);
router.post(
    "/:questionId/answer",
    authMiddleware,
    questionController.createAnswer
);
router.put(
    "/:questionId/answer/:answerId",
    authMiddleware,
    questionController.updateAnswer
);
router.delete(
    "/:questionId/answer/:answerId",
    authMiddleware,
    questionController.deleteAnswer
);

router.get("/:questionId/rating", questionController.getQuestionRating);
router.get(
    "/:questionId/answer/:answerId/rating",
    questionController.getAnswerRating
);
router.post(
    "/:questionId/answer",
    authMiddleware,
    questionController.createAnswer
);
router.put(
    "/:questionId/:answerId",
    authMiddleware,
    questionController.updateAnswer
);
router.delete(
    "/:questionId/:answerId",
    authMiddleware,
    questionController.deleteAnswer
);

router.post(
    "/:questionId/setLike",
    authMiddleware,
    questionController.setLikeQuestion
);
router.post(
    "/:questionId/dropLike",
    authMiddleware,
    questionController.dropLikeQuestion
);
router.post(
    "/:questionId/setDislike",
    authMiddleware,
    questionController.setDislikeQuestion
);
router.post(
    "/:questionId/dropDislike",
    authMiddleware,
    questionController.dropDislikeQuestion
);

router.post(
    "/:questionId/:answerId/setLike",
    authMiddleware,
    questionController.setLikeAnswer
);
router.post(
    "/:questionId/:answerId/dropLike",
    authMiddleware,
    questionController.dropLikeAnswer
);
router.post(
    "/:questionId/:answerId/setDislike",
    authMiddleware,
    questionController.setDislikeAnswer
);
router.post(
    "/:questionId/:answerId/dropDislike",
    authMiddleware,
    questionController.dropDislikeAnswer
);

module.exports = router;
