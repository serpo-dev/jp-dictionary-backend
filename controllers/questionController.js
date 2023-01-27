const {
    question,
    question_rate,
    question_tag,
    answer,
    answer_rate,
    question_question_tag,
} = require("../models/models");
const ApiError = require("../error/ApiError");

class QuestionHandler {
    async matchTags(question) {
        if (!question.id) return undefined;

        const tagIds = await question_question_tag.findAll({
            where: { questionId: question.id },
        });

        const tags = await Promise.all(
            tagIds.map(async (tag) => {
                const id = tag.questionTagId;
                const { name } = await question_tag.findOne({ where: { id } });
                return name;
            })
        );
        return { tags, ...question.dataValues };
    }

    async doesExist(questionId, next) {
        const result = await question.findOne({
            where: { id: questionId },
        });
        if (!result) {
            return next(ApiError.badRequest("The question does not exist"));
        }
    }
}

class QuestionController {
    async getQuestions(req, res, next) {
        const reqBody = req.body;
        const amount = Number(reqBody.amount);
        const page = Number(reqBody.page);

        if (amount !== 5 && amount !== 15 && amount !== 25) {
            return next(
                ApiError.badRequest(
                    "Amount of receiving items must be 5, 15 or 25."
                )
            );
        }

        try {
            const total = await question.count();
            const findQuestions = await question.findAll({
                limit: amount * page,
                order: [["createdAt", "DESC"]],
            });

            const start = amount * (page - 1);
            const questions = findQuestions.splice(start, amount);
            const questionsWithTags = await Promise.all(
                questions.map(async (question) =>
                    new QuestionHandler().matchTags(question)
                )
            );

            return res
                .status(200)
                .json({ amount, page, total, rows: questionsWithTags });
        } catch (err) {
            next(ApiError.internalServerError(err));
        }
    }

    async getUserQuestions(req, res, next) {
        try {
            const { id } = req.user;
            const questionsWithCount = await question.findAndCountAll({
                where: { userId: id },
            });
            const questionsWithTags = await Promise.all(
                questionsWithCount.rows.map(async (question) =>
                    new QuestionHandler().matchTags(question)
                )
            );
            const questions = {
                rows: questionsWithTags,
                count: questionsWithCount.count,
            };

            return res.status(200).json({ ...questions });
        } catch (err) {
            next(ApiError.badRequest(err));
        }
    }

    async getQuestionById(req, res, next) {
        try {
            const { questionId } = req.params;

            const questionWithoutTags = await question.findOne({
                where: { id: questionId },
            });

            const foundOne = await new QuestionHandler().matchTags(
                questionWithoutTags
            );

            return res.status(200).json(foundOne);
        } catch (err) {
            return next(ApiError.badRequest(err));
        }
    }

    async getQuestionsByTag(req, res, next) {
        try {
            const { tagName } = req.params;

            const tagId = await question_tag.findOne({
                where: { name: tagName },
            });
            const questionQuestionTagIds =
                await question_question_tag.findAndCountAll({
                    where: { questionTagId: tagId.id },
                });
            const questionIds = questionQuestionTagIds.rows.map(
                (item) => item.questionId
            );
            const questions = await Promise.all(
                questionIds.map(async (questionId) => {
                    const foundOne = await question.findOne({
                        where: { id: questionId },
                    });
                    const resultWithTags =
                        await new QuestionHandler().matchTags(foundOne);
                    return resultWithTags;
                })
            );

            return res
                .status(200)
                .json({ count: questionQuestionTagIds.count, rows: questions });
        } catch (err) {
            return next(ApiError.badRequest(err));
        }
    }

    async createQuestion(req, res, next) {
        try {
            const { title, text, tags } = req.body;
            const newQuestion = await question.create({
                title,
                text,
                userId: req.user.id,
            });

            const tagsIds = await Promise.all(
                tags.map(async (tagName) => {
                    const [{ id }, isCreated] = await question_tag.findOrCreate(
                        {
                            where: {
                                name: tagName,
                            },
                        }
                    );
                    return id;
                })
            );
            const question_tags_linked = await Promise.all(
                tagsIds.map(async (tagId) => {
                    const [{ id }, isCreated] =
                        await question_question_tag.findOrCreate({
                            where: {
                                questionId: newQuestion.id,
                                questionTagId: tagId,
                            },
                        });
                    return id;
                })
            );

            return res.status(201).json({
                message: "The new question has been created",
                questionId: newQuestion.dataValues.id,
            });
        } catch (err) {
            return next(ApiError.badRequest(err));
        }
    }

    async updateQuestion(req, res, next) {
        const newQuestion = req.body;
        const userId = req.user.id;
        const { questionId } = req.params;

        const foundOne = await question.findOne({
            where: { id: questionId },
        });
        if (!foundOne)
            return next(ApiError.badRequest("The question does not exist"));
        if (foundOne.userId !== userId)
            return next(
                ApiError.forbidden(
                    "You do not have permission to delete this question because you are not the owner"
                )
            );

        try {
            const oldTags = await question_question_tag.findAll({
                where: { questionId },
            });
            const oldTagsIds = oldTags
                .map((item) => item.questionTagId)
                .sort((a, b) => a - b);
            const newTags = await Promise.all(
                newQuestion.tags.map(async (tagName) => {
                    const [result] = await question_tag.findOrCreate({
                        where: { name: tagName },
                    });
                    return result;
                })
            );
            const newTagsIds = newTags
                .map((item) => item.id)
                .sort((a, b) => a - b);
            await Promise.all(
                newTagsIds.map(async (tagId) => {
                    const result = await question_question_tag.findOrCreate({
                        where: { questionId, questionTagId: tagId },
                    });
                    return result;
                })
            );
            const oldTagsToDelete = [];
            for (let i = 0; i < oldTagsIds.length; i++) {
                let isToDelete = true;
                for (let j = 0; j < newTagsIds.length; j++) {
                    if (i === j) {
                        isToDelete = false;
                        break;
                    }
                }
                if (isToDelete === true) {
                    oldTagsToDelete.push(oldTagsIds[i]);
                }
            }
            await Promise.all(
                oldTagsToDelete.map(
                    async (questionTagId) =>
                        await question_question_tag.destroy({
                            where: { questionTagId },
                        })
                )
            );
            const newTagsNames = newTags.map((item) => item.name);

            await foundOne.set({
                title: req.body.title,
                text: req.body.text,
            });
            await foundOne.save();

            return res.status(200).json({
                message: "The question has been updated",
                ...foundOne.dataValues,
                tags: newTagsNames,
            });
        } catch (err) {
            return next(ApiError.internal(err));
        }
    }

    async deleteQuestion(req, res, next) {
        const userId = req.user.id;
        const { questionId } = req.params;

        const foundOne = await question.findOne({
            where: { id: questionId },
        });
        if (!foundOne)
            return next(ApiError.badRequest("The question does not exist"));
        if (foundOne.userId !== userId)
            return next(
                ApiError.forbidden(
                    "You do not have permission to delete this question because you are not the owner"
                )
            );

        await question.destroy({ where: { id: questionId } });

        return res
            .status(200)
            .json({ message: "The question has been deleted" });
    }

    async getQuestionRating(req, res, next) {
        try {
            const { questionId } = req.params;
            const ratingRows = await question_rate.findAll({
                where: { questionId },
            });
            if (!ratingRows) {
                const rating = 0;
                return res.json({ rating, questionId });
            }
            const ratingValues = ratingRows.map((item) => item.value);
            const rating = ratingValues.reduce((a, b) => a + b);
            return res.json({ rating, questionId });
        } catch (err) {
            return next(ApiError.badRequest(err));
        }
    }

    async setLikeQuestion(req, res, next) {
        const userId = req.user.id;
        const { questionId } = req.params;

        const foundOne = await question
            .findOne({
                where: { id: questionId },
            })
            .then((question) => question == null);
        if (foundOne) {
            return next(ApiError.badRequest("The question does not exist"));
        }

        try {
            const [rate] = await question_rate.findOrCreate({
                where: { questionId, userId },
            });
            rate.set({ value: 1 });
            await rate.save();

            return res
                .status(200)
                .json({ message: "The question has been liked" });
        } catch (err) {
            next(ApiError.internal(err));
        }
    }

    async dropLikeQuestion(req, res, next) {
        const userId = req.user.id;
        const { questionId } = req.params;

        const foundOne = await question
            .findOne({
                where: { id: questionId },
            })
            .then((question) => question == null);
        if (foundOne) {
            return next(ApiError.badRequest("The question does not exist"));
        }

        try {
            const [rate] = await question_rate.findOrCreate({
                where: { questionId, userId },
            });
            rate.set({ value: 0 });
            await rate.save();

            return res
                .status(200)
                .json({ message: "The question has been unliked" });
        } catch (err) {
            next(ApiError.internal(err));
        }
    }

    async setDislikeQuestion(req, res, next) {
        const userId = req.user.id;
        const { questionId } = req.params;

        const foundOne = await question
            .findOne({
                where: { id: questionId },
            })
            .then((question) => question == null);
        if (foundOne) {
            return next(ApiError.badRequest("The question does not exist"));
        }

        try {
            const [rate] = await question_rate.findOrCreate({
                where: { questionId, userId },
            });
            rate.set({ value: -1 });
            await rate.save();

            return res
                .status(200)
                .json({ message: "The question has been disliked" });
        } catch (err) {
            next(ApiError.internal(err));
        }
    }

    async dropDislikeQuestion(req, res, next) {
        const userId = req.user.id;
        const { questionId } = req.params;

        const foundOne = await question
            .findOne({
                where: { id: questionId },
            })
            .then((question) => question == null);
        if (foundOne) {
            return next(ApiError.badRequest("The question does not exist"));
        }

        try {
            const [rate] = await question_rate.findOrCreate({
                where: { questionId, userId },
            });
            rate.set({ value: 0 });
            await rate.save();

            return res
                .status(200)
                .json({ message: "The question has been undisliked" });
        } catch (err) {
            next(ApiError.internal(err));
        }
    }

    async getAnswers(req, res, next) {
        const { questionId } = req.params;
        try {
            const { rows, count } = await answer.findAndCountAll({
                where: { questionId },
            });
            const answers = rows || [];
            return res.status(200).json({ questionId, count, answers });
        } catch (err) {
            return next(ApiError.internal("Something went wrong"));
        }
    }

    async createAnswer(req, res, next) {
        const userId = req.user.id;
        const { questionId } = req.params;
        const { text } = req.body;

        new QuestionHandler().doesExist(questionId, next);

        const { id } = await answer.create({
            userId,
            questionId,
            text,
        });

        return res
            .status(201)
            .json({ id, message: "The answer has been created" });
    }

    async updateAnswer(req, res, next) {
        const userId = req.user.id;
        const { answerId, questionId } = req.params;
        const { text } = req.body;

        new QuestionHandler().doesExist(questionId, next);

        const foundOne = await answer.findOne({
            where: {
                id: answerId,
            },
        });
        if (!foundOne) {
            return next(ApiError.badRequest("The answer does not exist"));
        }
        if (foundOne.userId !== userId) {
            return next(
                ApiError.badRequest("You are not allowed to update this answer")
            );
        }

        try {
            await foundOne.update({
                text,
            });
            return res
                .status(200)
                .json({ id: answerId, message: "The answer has been updated" });
        } catch (err) {
            return next(ApiError.internal("Something went wrong"));
        }
    }

    async deleteAnswer(req, res, next) {
        const userId = req.user.id;
        const { answerId, questionId } = req.params;

        new QuestionHandler().doesExist(questionId, next);

        const foundOne = await answer.findOne({
            where: {
                id: answerId,
            },
        });
        if (!foundOne) {
            return next(ApiError.badRequest("The answer does not exist"));
        }
        if (foundOne.userId !== userId) {
            return next(
                ApiError.badRequest("You are not allowed to update this answer")
            );
        }

        try {
            await foundOne.destroy();
            return res
                .status(200)
                .json({ message: "The answer has been deleted" });
        } catch (err) {
            return next(
                ApiError.internal(
                    "Something went wrong while deleting the answer"
                )
            );
        }
    }

    async getAnswerRating(req, res, next) {
        try {
            const { answerId } = req.params;
            const ratingRows = await answer_rate.findAll({
                where: { answerId },
            });
            if (!ratingRows) {
                const rating = 0;
                return res.json({ rating, questionId });
            }
            const ratingValues = ratingRows.map((item) => item.value);
            const rating = ratingValues.reduce((a, b) => a + b);
            return res.json({ rating, questionId });
        } catch (err) {
            return next(ApiError.badRequest(err));
        }
    }

    async setLikeAnswer(req, res, next) {
        const userId = req.user.id;
        const { answerId } = req.params;

        const foundOne = await answer
            .findOne({
                where: { id: answerId },
            })
            .then((answer) => answer == null);
        if (foundOne) {
            return next(ApiError.badRequest("The answer does not exist"));
        }

        try {
            const [rate] = await question_rate.findOrCreate({
                where: { answerId, userId },
            });
            rate.set({ value: 1 });
            await rate.save();

            return res
                .status(200)
                .json({ message: "The answer has been liked" });
        } catch (err) {
            next(ApiError.internal(err));
        }
    }

    async dropLikeAnswer(req, res, next) {
        const userId = req.user.id;
        const { answerId } = req.params;

        const foundOne = await answer
            .findOne({
                where: { id: answerId },
            })
            .then((answer) => answer == null);
        if (foundOne) {
            return next(ApiError.badRequest("The answer does not exist"));
        }

        try {
            const [rate] = await question_rate.findOrCreate({
                where: { answerId, userId },
            });
            rate.set({ value: 0 });
            await rate.save();

            return res
                .status(200)
                .json({ message: "The answer has been liked" });
        } catch (err) {
            next(ApiError.internal(err));
        }
    }

    async setDislikeAnswer(req, res, next) {
        const userId = req.user.id;
        const { answerId } = req.params;

        const foundOne = await answer
            .findOne({
                where: { id: answerId },
            })
            .then((answer) => answer == null);
        if (foundOne) {
            return next(ApiError.badRequest("The answer does not exist"));
        }

        try {
            const [rate] = await question_rate.findOrCreate({
                where: { answerId, userId },
            });
            rate.set({ value: -1 });
            await rate.save();

            return res
                .status(200)
                .json({ message: "The answer has been liked" });
        } catch (err) {
            next(ApiError.internal(err));
        }
    }

    async dropDislikeAnswer(req, res, next) {
        const userId = req.user.id;
        const { answerId } = req.params;

        const foundOne = await answer
            .findOne({
                where: { id: answerId },
            })
            .then((answer) => answer == null);
        if (foundOne) {
            return next(ApiError.badRequest("The answer does not exist"));
        }

        try {
            const [rate] = await question_rate.findOrCreate({
                where: { answerId, userId },
            });
            rate.set({ value: 1 });
            await rate.save();

            return res
                .status(200)
                .json({ message: "The answer has been liked" });
        } catch (err) {
            next(ApiError.internal(err));
        }
    }
}

module.exports = new QuestionController();
