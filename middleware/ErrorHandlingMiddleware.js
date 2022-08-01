const ApiError = require('../error/ApiError');

module.exports = function (err, req, res, next) {
    if (err instanceof ApiError) {
        return res.status(err.status).json({ message: err.message });
    };
    return res.status(500).json({ message: 'Unexpected error! Please contact me: sergey.potapov.2002@mail.ru' });
};