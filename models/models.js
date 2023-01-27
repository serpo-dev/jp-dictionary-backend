const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const user = sequelize.define("user", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    login: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: "USER" },
    lang: { type: DataTypes.STRING, defaultValue: "RU" },
});

const personalInfo = sequelize.define("personalInfo", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    avatarUrl: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING(100) },
    name: { type: DataTypes.STRING },
    surname: { type: DataTypes.STRING },
    birth: { type: DataTypes.DATE },
    city: { type: DataTypes.STRING },
    aboutMe: { type: DataTypes.TEXT(1000) },
});

const progress = sequelize.define("progress", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    level: { type: DataTypes.INTEGER },
    coins: { type: DataTypes.INTEGER },
});

const character = sequelize.define("character", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
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

const kanji = sequelize.define("kanji", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    examLevel: { type: DataTypes.INTEGER },
});

const component = sequelize.define("component", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
});

const translation = sequelize.define("translation", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    jpNormalText: { type: DataTypes.TEXT },
    jpFuriganaText: { type: DataTypes.TEXT },
    enText: { type: DataTypes.TEXT },
    ruText: { type: DataTypes.TEXT },
});

const example = sequelize.define("example", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    jpNormalText: { type: DataTypes.TEXT },
    jpFuriganaText: { type: DataTypes.TEXT },
    enText: { type: DataTypes.TEXT },
    ruText: { type: DataTypes.TEXT },
});

const comment = sequelize.define("comment", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.TEXT },
    rating: { type: DataTypes.INTEGER, defaultValue: 0 },
});

const commentRate = sequelize.define("commentRate", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rate: { type: DataTypes.INTEGER, allowNull: false },
});

const kanji_component_link = sequelize.define("kanji_component_link", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});

const message = sequelize.define("message", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.TEXT(1000), allowNull: false },
});

const message_status = sequelize.define("message_status", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    isRead: { type: DataTypes.BOOLEAN },
    isNotified: { type: DataTypes.BOOLEAN },
});

const chat = sequelize.define("chat", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    isDialog: { type: DataTypes.BOOLEAN },
    name: { type: DataTypes.STRING(100), allowNull: false },
});

const roster = sequelize.define("roster", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    users: { type: DataTypes.ARRAY(DataTypes.INTEGER) },
});

const user_chat = sequelize.define("user_chat", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});

const question = sequelize.define("question", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(100), allowNull: false },
    text: { type: DataTypes.TEXT(), allowNull: false },
    views: { type: DataTypes.INTEGER, defaultValue: 0 },
});

const question_rate = sequelize.define("question_rate", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    value: { type: DataTypes.INTEGER, defaultValue: 0 },
});

const question_tag = sequelize.define("question_tag", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
});

const question_question_tag = sequelize.define("question_question_tag", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});

const answer = sequelize.define("answer", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.TEXT(), allowNull: false },
});

const answer_rate = sequelize.define("answer_rate", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    value: { type: DataTypes.INTEGER, defaultValue: 0 },
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

message.hasOne(message_status);
message_status.belongsTo(message);

chat.hasMany(message);
message.belongsTo(chat);

chat.hasMany(roster);
roster.belongsTo(chat);

chat.hasMany(roster);
roster.belongsTo(chat);

chat.belongsToMany(user, { through: user_chat });
user.belongsToMany(chat, { through: user_chat });

question.hasMany(answer);
answer.belongsTo(question); 

question.belongsToMany(question_tag, { through: question_question_tag });
question_tag.belongsToMany(question, { through: question_question_tag });

user.hasMany(question);
question.belongsTo(user);

question.hasMany(question_rate);
question_rate.belongsTo(question);

user.hasMany(answer);
answer.belongsTo(user);

answer.hasMany(answer_rate);
answer_rate.belongsTo(answer);

user.hasMany(question_rate);
question_rate.belongsTo(user);

user.hasMany(answer_rate);
answer_rate.belongsTo(user);

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
    kanji_component_link,

    message,
    message_status,
    chat,
    roster,
    user_chat,

    question,
    question_rate,
    question_tag,
    question_question_tag,
    answer,
    answer_rate,
};
