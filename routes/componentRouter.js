const Router = require('express');
const router = new Router();
const componentController = require('../controllers/componentController');

router.get('/', componentController.getAll);

module.exports = router;