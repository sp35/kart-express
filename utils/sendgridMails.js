const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');

dotenv.config();

const sendMail = async function sendMail(to, subject, text){
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);;

  const msg = {
    to: to,
    from: process.env.SENDGRID_FROM_MAIL,
    subject: subject,
    text: text,
    html: `${text}<strong>Kart Express</strong>`,
  };

  await sgMail.send(msg).then(() => {
    }).catch((error) => {
        console.log('error', error);
    });
}

module.exports = sendMail
