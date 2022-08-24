const { component } = require('../models/models');
const ApiError = require('../error/ApiError');

class ComponentController {
    async getAll(req, res, next) {
        const result = await component.findAndCountAll();
        return res.status(200).json(result);
    };
};

module.exports = new ComponentController();