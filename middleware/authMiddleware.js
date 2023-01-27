const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next();
    }
    try {
        const token = req.headers.authorization.split(" ")[1]; // Пример: "Bearer HJGHGUIFUFF*&G&^F&%F&%DFCT&G*G*B*N"
        if (!token) {
            return res.status(401).json({
                message: `Can't extract token from the BEARER field.`,
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: `You are not authorized.` });
    }
};
