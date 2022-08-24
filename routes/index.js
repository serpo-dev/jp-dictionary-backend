const Router = require('express');
const router = new Router();

const userRouter = require('./userRouter');
const characterRouter = require('./characterRouter');
const kanjiRouter = require('./kanjiRouter');
const componentRouter = require('./componentRouter');
const commentRouter = require('./commentRouter');

router.use('/user', userRouter);
router.use('/character', characterRouter);
router.use('/kanji', kanjiRouter);
router.use('/component', componentRouter);
router.use('/comment', commentRouter);

module.exports = router;