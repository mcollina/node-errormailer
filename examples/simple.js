var nodemailer = require('nodemailer');
var errormailer = require("../");

// Create a SMTP transport object

var transport = nodemailer.createTransport("SMTP", {
  service: 'Sendgrid', // use well known service
  auth: {
    user: process.env.USERNAME,
    pass: process.env.PASSWORD
  }
});

console.log('SMTP Configured');

var errorHandler = errormailer(transport, {
  subject: "Testing errormailer!",
  to: "matteo.collina@gmail.com"
});

errorHandler("this is an error!");

setTimeout(function() {
  process.exit(0);
}, 5000);
