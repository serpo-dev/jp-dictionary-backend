const sequelize = require('../db');
const { DataTypes } = require('sequelize');


const user = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    login: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: 'USER' },
    lang: { type: DataTypes.STRING, defaultValue: 'RU' }
});

const personalInfo = sequelize.define('personalInfo', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    avatarUrl: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING(100) },
    name: { type: DataTypes.STRING },
    surname: { type: DataTypes.STRING },
    birth: { type: DataTypes.DATE },
    city: { type: DataTypes.STRING },
    aboutMe: { type: DataTypes.TEXT(1000) }
});

const progress = sequelize.define('progress', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    level: { type: DataTypes.INTEGER },
    coins: { type: DataTypes.INTEGER }
});

const character = sequelize.define('character', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    img: { type: DataTypes.STRING },
    URI: { type: DataTypes.STRING },
    title: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING },
    meaning: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    mnemoImg: { type: DataTypes.STRING },
    mnemoDisc: { type: DataTypes.TEXT },
    variants: { type: DataTypes.STRING },
});
 
const kanji = sequelize.define('kanji', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    examLevel: { type: DataTypes.INTEGER },
});

const component = sequelize.define('component', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false }
});

const translation = sequelize.define('translation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    jpNormalText: { type: DataTypes.TEXT },
    jpFuriganaText: { type: DataTypes.TEXT },
    enText: { type: DataTypes.TEXT },
    ruText: { type: DataTypes.TEXT }
});

const example = sequelize.define('example', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    jpNormalText: { type: DataTypes.TEXT },
    jpFuriganaText: { type: DataTypes.TEXT },
    enText: { type: DataTypes.TEXT },
    ruText: { type: DataTypes.TEXT }
});

const comment = sequelize.define('comment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.TEXT },
    rating: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const commentRate = sequelize.define('commentRate', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rate: { type: DataTypes.INTEGER, allowNull: false }
});

const kanji_component_link = sequelize.define('kanji_component_link', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }
});


user.hasOne(personalInfo);
personalInfo.belongsTo(user);

user.hasOne(progress);
progress.belongsTo(user);

user.hasMany(comment);
comment.belongsTo(user);

user.hasMany(commentRate);
commentRate.belongsTo(user);

comment.hasMany(commentRate);
commentRate.belongsTo(comment);

character.hasMany(comment);
comment.belongsTo(character);

character.hasMany(kanji);
kanji.belongsTo(character);

character.hasMany(component);
component.belongsTo(character);

kanji.hasMany(example);
example.belongsTo(kanji);

kanji.hasMany(translation);
translation.belongsTo(kanji);

component.belongsToMany(kanji, { through: kanji_component_link });
kanji.belongsToMany(component, { through: kanji_component_link });


sequelize.sync({ alter: true });


module.exports = {
    user,
    personalInfo,
    progress,

    comment,
    commentRate,

    character,
    example,
    translation,
    kanji,
    component,
    kanji_component_link
};