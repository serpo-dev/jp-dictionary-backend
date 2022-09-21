const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const MailService = require("../service/mail-service");

const ApiError = require("../error/ApiError");
const { user, personalInfo, progress } = require("../models/models");

class UserController {
    async registration(req, res, next) {
        const { login, email, password } = req.body;

        if (!login || !email || !password) {
            return next(ApiError.badRequest(`Error! Some fields are empty.`));
        }
        const candidateEmail = await user.findOne({ where: { email } });
        const candidateLogin = await user.findOne({ where: { login } });
        const candidate = [candidateEmail, candidateLogin];
        let errorCollector = [];
        for (let i = 0; i < candidate.length; i++) {
            switch (i) {
                case 0:
                    candidate[i] ? errorCollector.push("EMAIL") : null;
                    break;
                case 1:
                    candidate[i] ? errorCollector.push("LOGIN") : null;
                    break;
            }
        }
        if (errorCollector.length !== 0) {
            errorCollector = errorCollector.map((i) => ` ${i}`);
            return next(
                ApiError.internal(
                    `Some fields are already exists: ${errorCollector}`
                )
            );
        }

        const hashPassword = await bcrypt.hash(password, 5);
        const newUser = await user.create({
            login,
            email,
            password: hashPassword,
        });
        await personalInfo.create({
            userId: newUser.id,
        });
        await progress.create({
            level: 0,
            coins: 0,
            userId: newUser.id,
        });

        const token = jwt.sign(
            {
                id: newUser.id,
                login,
                email,
                role: newUser.role,
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "24h" }
        );

        return res.status(201).json({ token });
    }

    async login(req, res, next) {
        await MailService.sendActivatonMail(process.env.SMTP_USER, "http://localhost:3000/auth/login");

        const { login, email, password } = req.body;

        if ((!login && !email) || !password) {
            return next(ApiError.badRequest(`Error! Some fields are empty.`));
        }
        let candidate;
        if (login) {
            candidate = await user.findOne({ where: { login } });
            if (!candidate) {
                return next(
                    ApiError.internal(`Error! This LOGIN doesn't exist.`)
                );
            }
        } else if (email) {
            candidate = await user.findOne({ where: { email } });
            if (!candidate) {
                return next(
                    ApiError.internal(`Error! This EMAIL doesn't exist.`)
                );
            }
        } else {
            return next(
                ApiError.internal(
                    `Error! Server can't find "LOGIN" or "EMAIL".`
                )
            );
        }

        let comparePassword = bcrypt.compareSync(password, candidate.password);
        if (!comparePassword) {
            return next(ApiError.internal(`Error! Invalid password.`));
        }

        const progressPart = await progress.findOne({
            where: { userId: candidate.id },
        });

        const token = jwt.sign(
            {
                id: candidate.id,
                login: candidate.login,
                email: candidate.email,
                role: candidate.role,
                level: progressPart.level,
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "24h" }
        );

        return res.status(200).json({ token });
    }

    async checkAuth(req, res, next) {
        const token = jwt.sign(
            {
                id: req.user.id,
                login: req.user.login,
                email: req.user.email,
                role: req.user.role,
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "24h" }
        );
        res.status(200).json({
            token,
            message: `Success! Token validated. You authorized.`,
        });
    }
}

module.exports = new UserController();
