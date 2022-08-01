const ApiError = require("../error/ApiError");

class checkRoleMiddleware {
    constructor(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;
    };

    static admin(req, res, next) {
        if (req.user.role === 'ADMIN') {
            next();
        } else {
            next(ApiError.forbidden(`The action is avaliable only for users with 'ADMIN' role.`))
        };
    };
};

module.exports = checkRoleMiddleware;