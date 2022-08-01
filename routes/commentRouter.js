const Router = require('express');
const router = new Router();
const commentController = require('../controllers/commentController');

router.get('/character/:id', commentController.getListOfCharacter);
router.get('/user/:id', commentController.getListOfUser);
router.patch('/:id', commentController.rate);
router.post('/', commentController.create);
router.put('/:id', commentController.update);
router.delete('/:id', commentController.delete);

module.exports = router;