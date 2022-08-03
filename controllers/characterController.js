const { character, kanji, kanji_component_link, translation, example, component } = require('../models/models');
const ApiError = require('../error/ApiError');
const { splitColumns, splitRows } = require('../handlers/textHandler');

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

        const result = await character.findOne({ where: { id } });
        if (!result) {
            return next(ApiError.badRequest(`Error! The character with id='${id}' doesn't exist.`));
        };
        return res.status(200).json({ result });
    };

    async getAll(req, res) {

    };

    async create(req, res) {
        const {
            associations,

            title,
            type,
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
                if (associations) {
                    const linkedComponents = associations.split(splitColumns);
                    const componentsCount = linkedComponents.length;
                    let l_c = 0;
                    while (l_c < componentsCount) {
                        const componentId = Number(linkedComponents[l_c]);
                        await kanji_component_link.create({
                            componentId: componentId,
                            kanjiId: newKanji.id
                        });
                        l_c++;
                    };
                };
                if (translations) {
                    const dividedTranslations = translations.split(splitRows);
                    const translationsCount = dividedTranslations.length;
                    let t = 0;
                    while (t < translationsCount) {
                        const dividedTranslationLanguages = dividedTranslations[t].split(splitColumns);
                        await translation.create({
                            jpNormalText: dividedTranslationLanguages[0],
                            jpFuriganaText: dividedTranslationLanguages[1],
                            enText: dividedTranslationLanguages[2],
                            ruText: dividedTranslationLanguages[3],
                            kanjiId: newKanji.id
                        });
                        t++;
                    };
                };
                if (examples) {
                    const dividedExamples = examples.split(splitRows);
                    const examplesCount = dividedExamples.length;
                    let e = 0;
                    while (e < examplesCount) {
                        const dividedExamplesLanguages = dividedExamples[e].split(splitColumns);
                        await example.create({
                            jpNormalText: dividedExamplesLanguages[0],
                            jpFuriganaText: dividedExamplesLanguages[1],
                            enText: dividedExamplesLanguages[2],
                            ruText: dividedExamplesLanguages[3],
                            kanjiId: newKanji.id
                        });
                        e++;
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