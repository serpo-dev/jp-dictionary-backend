const { character, kanji, kanji_component_link, translation, example, component } = require('../models/models');
const ApiError = require('../error/ApiError');

class CharacterController {
    async getOne(req, res, next) {
        const requestBody = req.params;
        const id = Number(requestBody.id);
        if (!id) {
            return next(ApiError.badRequest(`Error! The 'id' field is empty.`));
        };
        if (typeof (id) !== 'number') {
            return next(ApiError.badRequest(`Error! The 'id' isn't a 'number' type.`));
        };

        let result;
        const characterPart = await character.findOne({ where: { id } });
        if (characterPart) {
            result = {
                characterPart
            };
        } else {
            return next(ApiError.badRequest(`Error! The character with id='${id}' doesn't exist.`));
        };
        if (characterPart.type === 'KANJI') {
            const kanjiPart = await kanji.findOne({ where: { characterId: id } });
            result = {
                ...result,
                kanjiPart
            };
        };
        return res.status(200).json({ ...result });
    };

    async getAll(req, res) {

    };

    async create(req, res) {
        const {
            type,
            associations,

            title,
            meaning,
            img,
            description,
            mnemoImg,
            mnemoDisc,

            translations,
            examples,
            examLevel
        } = req.body;

        const newCharacter = await character.create({
            title,
            type,
            meaning,
            img,
            description,
            mnemoImg,
            mnemoDisc
        });
        newCharacter.URI = `${newCharacter.id}-${meaning}`;
        await newCharacter.save();

        switch (type) {
            case 'KANJI':
                const newKanji = await kanji.create({
                    translations,
                    examples,
                    examLevel,
                    characterId: newCharacter.id
                });
                if (examLevel) {
                    newKanji.examLevel = examLevel;
                    await newKanji.save();
                };
                if (associations[0]) {
                    let i = 0;
                    while (i < associations.length) {
                        const componentId = Number(associations[i]);
                        if (componentId) {
                            await kanji_component_link.create({
                                componentId: associations[i],
                                kanjiId: newKanji.id
                            });
                        };
                        i++;
                    };
                };
                if (translations) {
                    let i = 0;
                    while (i < translations.length) {
                        await translation.create({
                            jpNormalText: translations[i].jpNormalText,
                            jpFuriganaText: translations[i].jpFuriganaText,
                            enText: translations[i].enText,
                            ruText: translations[i].ruText,
                            kanjiId: newKanji.id
                        });
                        i++;
                    };
                };
                if (examples) {
                    let i = 0;
                    while (i < examples.length) {
                        await translation.create({
                            jpNormalText: examples[i].jpNormalText,
                            jpFuriganaText: examples[i].jpFuriganaText,
                            enText: examples[i].enText,
                            ruText: examples[i].ruText,
                            kanjiId: newKanji.id
                        });
                        i++;
                    };
                };
                return res.status(201).json({ message: 'Successful! The new kanji created.' });

            case 'COMPONENT':
                const newComponent = await component.create({
                    characterId: newCharacter.id
                });
                const linkedKanjis = associations.split(splitColumns);
                const kanjiCount = linkedKanjis.length;
                let l_k = 0;
                while (l_k < kanjiCount) {
                    const kanjiId = Number(linkedKanjis[l_k]);
                    await kanji_component_link.create({
                        componentId: newComponent.id,
                        kanjiId: kanjiId
                    });
                    l_k++;
                };
                return res.status(201).json({ message: 'Successful! The new component created.' });

            default:
                return res.status(500).json(`The request didn't have an exist type of character ("KANJI" or "COMPONENT")`);
        };
    };

    async update(req, res) {

    };

    async delete(req, res) {

    };
};

module.exports = new CharacterController();