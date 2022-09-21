const nodemailer = require("nodemailer");

const { SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_URL, SMTP_USER } =
    process.env;

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: true,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASSWORD,
            },
        });
    }

    async sendActivatonMail(to, link) {
        await this.transporter.sendMail({
            from: `JPOT sup <${SMTP_USER}>`,
            to,
            subject: "Активация аккаунта на " + SMTP_URL,
            html: `
                <div> 
                    <h1>Для активации перейдите по ссылке</h1> 
                    <a href="${link}">${link}</a>
                </div>
            `,
        });
    }
}

module.exports = new MailService();
