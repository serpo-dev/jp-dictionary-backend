const { message, message_status, chat, roster } = require("../models/models");

class ChatController {
    async getOne(req, res, next) {
        const data = req.body;
        console.log(data);
    }

    async getMany(req, res, next) {
        const data = req.body;
        console.log(data);
    }

    async create(req, res, next) {}

    async update(req, res, next) {}

    async delete(req, res, next) {}
}

module.exports = new ChatController();
