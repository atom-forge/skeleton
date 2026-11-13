import nodemailer, { type Transporter } from 'nodemailer';
import { defineService } from '../layers';

export type EmailConfig = {
	email: {
		/** SMTP connection URL (smtp://user:pass@host:587); empty logs mails to the console. */
		smtpUrl: string;
		from: string;
	};
};

export type MailMessage = {
	to: string | string[];
	subject: string;
	html: string;
	text?: string;
};

export const emailService = defineService((config) => {
	const { smtpUrl, from } = config.email;
	const transporter: Transporter | null = smtpUrl ? nodemailer.createTransport(smtpUrl) : null;

	return {
		async send(message: MailMessage) {
			const to = Array.isArray(message.to) ? message.to.join(', ') : message.to;
			if (!transporter) {
				console.log(`[email] to=${to} subject=${message.subject}\n${message.text ?? message.html}`);
				return;
			}
			await transporter.sendMail({ from, to, subject: message.subject, html: message.html, text: message.text });
		}
	};
});
