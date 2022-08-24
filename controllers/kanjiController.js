const { kanji } = require('../models/models');
const ApiError = require('../error/ApiError');

class kanjiController {
    async getAll(req, res, next) {
        const result = await kanji.findAndCountAll();
        return res.status(200).json(result);
    };
};

module.exports = new kanjiController();