const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  
  //create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });

 
  //define the email option
  const mailOptions = {
    from: 'prakashnegi668@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
 
  //send the email

(await transporter.sendMail(mailOptions));

};

module.exports=sendEmail;

