const {
    character,
    kanji,
    kanji_component_link,
    translation,
    example,
    component,
} = require("../models/models");
const ApiError = require("../error/ApiError");

class CharacterController {
    async getOne(req, res, next) {
        const requestBody = req.params;
        const URI = requestBody.URI;
        if (!URI) {
            return next(
                ApiError.badRequest(`Error! The URI parameter doesn't exist.`)
            );
        }
        const stringId = URI.split("-")[0];
        const id = Number(stringId);
        if (!id) {
            return next(
                ApiError.badRequest(
                    `Error! The error could happen because of: 1) 'id' param is empty; 2) 'id' param didn't read (it wasn't separated by the dash in the high order URI param).`
                )
            );
        }
        if (typeof id !== "number") {
            return next(
                ApiError.badRequest(`Error! The 'id' isn't a 'number' type.`)
            );
        }
        let result;
        const characterPart = await character.findOne({ where: { id } });
        if (characterPart) {
            result = {
                characterPart,
            };
        } else {
            return next(
                ApiError.badRequest(
                    `Error! The character with id='${id}' doesn't exist.`
                )
            );
        }

        if (characterPart.type === "KANJI") {
            const kanjiPart = await kanji.findOne({
                where: { characterId: id },
            });
            const kanji_id = kanjiPart.id;
            const examples = await example.findAll({
                where: { kanjiId: kanji_id },
            });
            const translations = await translation.findAll({
                where: { kanjiId: kanji_id },
            });
            const associations = await kanji_component_link.findAll({
                where: { kanjiId: kanji_id },
            });
            result = {
                ...result,
                kanjiPart: {
                    ...kanjiPart,
                    examples,
                    translations,
                },
                associations,
            };
        } else {
            const compo = await component.findOne({
                where: { characterId: id },
            });
            const component_id = compo.id;
            const associations = await kanji_component_link.findAll({
                where: { componentId: component_id },
            });
            result = {
                ...result,
                associations,
            };
        }
        return res.status(200).json({ ...result });
    }

    async getAll(req, res, next) {
        const result = await character.findAndCountAll();
        return res.status(200).json(result);
    }

    async create(req, res, next) {
        const {
            associations,
            type,

            title,
            meaning,
            img,
            description,
            mnemoImg,
            mnemoDisc,
            variants,

            translations,
            examples,
            examLevel,
        } = req.body;

        const newCharacter = await character.create({
            title,
            type,
            meaning,
            img,
            description,
            mnemoImg,
            mnemoDisc,
            variants,
        });
        newCharacter.URI = `${newCharacter.id}-${meaning}`;
        await newCharacter.save();

        switch (type) {
            case "KANJI":
                const newKanji = await kanji.create({
                    translations,
                    examples,
                    examLevel,
                    characterId: newCharacter.id,
                });
                if (examLevel) {
                    newKanji.examLevel = examLevel;
                    await newKanji.save();
                }
                if (associations[0]) {
                    for (let i = 0; i < associations.length; i++) {
                        const componentId = Number(associations[i]);
                        if (componentId) {
                            await kanji_component_link.create({
                                componentId: associations[i],
                                kanjiId: newKanji.id,
                            });
                        }
                    }
                }
                if (translations) {
                    for (let i = 0; i < translations.length; i++) {
                        await translation.create({
                            jpNormalText: translations[i].jpNormalText,
                            jpFuriganaText: translations[i].jpFuriganaText,
                            enText: translations[i].enText,
                            ruText: translations[i].ruText,
                            kanjiId: newKanji.id,
                        });
                    }
                }
                if (examples) {
                    let i = 0;
                    while (i < examples.length) {
                        await translation.create({
                            jpNormalText: examples[i].jpNormalText,
                            jpFuriganaText: examples[i].jpFuriganaText,
                            enText: examples[i].enText,
                            ruText: examples[i].ruText,
                            kanjiId: newKanji.id,
                        });
                        i++;
                    }
                }
                return res
                    .status(201)
                    .json({ message: "Successful! The new kanji created." });

            case "COMPONENT":
                const newComponent = await component.create({
                    characterId: newCharacter.id,
                });
                if (associations[0]) {
                    for (let i = 0; i < associations.length; i++) {
                        const kanjiId = Number(associations[i]);
                        if (kanjiId) {
                            await kanji_component_link.create({
                                kanjiId: associations[i],
                                componentId: newComponent.id,
                            });
                        }
                    }
                }
                return res.status(201).json({
                    message: "Successful! The new component created.",
                });

            default:
                return res
                    .status(500)
                    .json(
                        `The request didn't have an exist type of character ("KANJI" or "COMPONENT")`
                    );
        }
    }

    async update(req, res, next) {
        const {
            id,
            URI,
            associations,
            type,

            title,
            meaning,
            img,
            description,
            mnemoImg,
            mnemoDisc,
            variants,

            translations,
            examples,
            examLevel,
        } = req.body;

        const currentCharacter = await character.findOne({ where: { id: id } });
        currentCharacter.set({
            title,
            type,
            meaning,
            img,
            description,
            mnemoImg,
            mnemoDisc,
            variants,
        });
        currentCharacter.URI = `${id}-${meaning}`;
        await currentCharacter.save();

        switch (type) {
            case "KANJI":
                const curKanji = await kanji.findOne({
                    where: { characterId: id },
                });
                curKanji.set({
                    translations,
                    examples,
                    examLevel,
                });
                await curKanji.save();

                if (associations) {
                    const prevAssociations = await kanji_component_link.findAll(
                        { where: { kanjiId: curKanji.id } }
                    );
                    for (let i = 0; i < associations.length; i++) {
                        if (!associations[i].id) {
                            await kanji_component_link.create({
                                componentId: associations[i].componentId,
                                kanjiId: curKanji.id,
                            });
                        } else {
                            let toDelete = true;
                            for (let j = 0; j < prevAssociations.length; j++) {
                                if (
                                    prevAssociations[j].id ===
                                    associations[i].id
                                ) {
                                    const curAss =
                                        await kanji_component_link.findOne({
                                            where: { id: associations[i].id },
                                        });
                                    curAss.set({
                                        componentId:
                                            associations[i].componentId,
                                    });
                                    await curAss.save();
                                    toDelete = false;
                                }
                            }
                            if (toDelete) {
                                await kanji_component_link.destroy({
                                    where: { id: associations[i].id },
                                });
                            }
                        }
                    }
                } else {
                    await kanji_component_link.destroy({
                        where: { kanjiId: curKanji.id },
                    });
                }

                if (translations) {
                    const prevTranslations = await translation.findAll({
                        where: { kanjiId: curKanji.id },
                    });
                    for (let i = 0; i < translations.length; i++) {
                        if (!translations[i].id) {
                            await translation.create({
                                jpNormalText: translations[i].jpNormalText,
                                jpFuriganaText: translations[i].jpFuriganaText,
                                enText: translations[i].enText,
                                ruText: translations[i].ruText,
                                kanjiId: curKanji.id,
                            });
                        } else {
                            let toDelete = true;
                            for (let j = 0; j < prevTranslations.length; j++) {
                                if (
                                    prevTranslations[j].id ===
                                    translations[i].id
                                ) {
                                    const curTrans = await translation.findOne({
                                        where: { id: translations[i].id },
                                    });
                                    curTrans.set({
                                        jpNormalText:
                                            translations[i].jpNormalText,
                                        jpFuriganaText:
                                            translations[i].jpFuriganaText,
                                        enText: translations[i].enText,
                                        ruText: translations[i].ruText,
                                    });
                                    await curTrans.save();
                                    toDelete = false;
                                }
                            }
                            if (toDelete) {
                                await translation.destroy({
                                    where: { id: translations[i].id },
                                });
                            }
                        }
                    }
                } else {
                    await translation.destroy({
                        where: { kanjiId: curKanji.id },
                    });
                }

                if (examples) {
                    const prevExamples = await example.findAll({
                        where: { kanjiId: curKanji.id },
                    });
                    for (let i = 0; i < examples.length; i++) {
                        if (!examples[i].id) {
                            await example.create({
                                jpNormalText: examples[i].jpNormalText,
                                jpFuriganaText: examples[i].jpFuriganaText,
                                enText: examples[i].enText,
                                ruText: examples[i].ruText,
                                kanjiId: curKanji.id,
                            });
                        } else {
                            let toDelete = true;
                            for (let j = 0; j < prevExamples.length; j++) {
                                if (prevExamples[j].id === examples[i].id) {
                                    const curExmp = await example.findOne({
                                        where: { id: examples[i].id },
                                    });
                                    curExmp.set({
                                        jpNormalText: examples[i].jpNormalText,
                                        jpFuriganaText:
                                            examples[i].jpFuriganaText,
                                        enText: examples[i].enText,
                                        ruText: examples[i].ruText,
                                    });
                                    await curExmp.save();
                                    toDelete = false;
                                }
                            }
                            if (toDelete) {
                                await example.destroy({
                                    where: { id: examples[i].id },
                                });
                            }
                        }
                    }
                } else {
                    await example.destroy({ where: { kanjiId: curKanji.id } });
                }

                return res
                    .status(201)
                    .json({ message: "Successful! The new kanji created." });

            case "COMPONENT":
                const curComponent = await component.findOne({
                    where: { characterId: id },
                });

                if (associations) {
                    const prevAssociations = await kanji_component_link.findAll(
                        { where: { componentId: curComponent.id } }
                    );
                    for (let i = 0; i < associations.length; i++) {
                        if (!associations[i].id) {
                            await kanji_component_link.create({
                                kanjiId: associations[i].kanjiId,
                                componentId: curComponent.id,
                            });
                        } else {
                            let toDelete = true;
                            for (let j = 0; j < prevAssociations.length; j++) {
                                if (
                                    prevAssociations[j].id ===
                                    associations[i].id
                                ) {
                                    const curAss =
                                        await kanji_component_link.findOne({
                                            where: { id: associations[i].id },
                                        });
                                    curAss.set({
                                        kanjiId: associations[i].kanjiId,
                                    });
                                    await curAss.save();
                                    toDelete = false;
                                }
                            }
                            if (toDelete) {
                                await kanji_component_link.destroy({
                                    where: { id: associations[i].id },
                                });
                            }
                        }
                    }
                } else {
                    await kanji_component_link.destroy({
                        where: { componentId: curComponent.id },
                    });
                }
                return res.status(201).json({
                    message: "Successful! The new component created.",
                });

            default:
                return res
                    .status(500)
                    .json(
                        `The request didn't have an exist type of character ("KANJI" or "COMPONENT")`
                    );
        }
    }

    async delete(req, res, next) {
        const characterId = req.params.id;
        if (!characterId) {
            return next(
                ApiError.badRequest(`Error! The ID parameter doesn't exist.`)
            );
        }
        const foundCharacter = await character.findOne({
            where: { id: characterId },
        });
        if (!foundCharacter) {
            return next(
                ApiError.badRequest(
                    `Error! The character with this ID doesn't exist.`
                )
            );
        }
        if (foundCharacter.type === "KANJI") {
            const { id } = await kanji.findOne({
                where: { characterId: characterId },
            });
            await kanji_component_link.destroy({ where: { kanjiId: id } });
            await kanji.destroy({ where: { characterId: characterId } });
        } else if (foundCharacter.type === "COMPONENT") {
            const { id } = await component.findOne({
                where: { characterId: characterId },
            });
            await kanji_component_link.destroy({ where: { componentId: id } });
            await component.destroy({ where: { characterId: characterId } });
        }
        await character.destroy({ where: { id: characterId } });
        return res
            .status(200)
            .json(`Character with ID = ${req.params.id} deleted successfully!`);
    }
}

module.exports = new CharacterController();
