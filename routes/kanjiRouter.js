const Router = require('express');
const router = new Router();
const kanjiController = require('../controllers/kanjiController');

router.get('/', kanjiController.getAll);

module.exports = router;