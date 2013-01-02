
// errormailer works only in production mode
process.env.NODE_ENV = 'production';

var nodemailer = require('nodemailer');
var errormailer = require("../");
var connect = require("connect");

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

var funcErr = function(req, res) { throw "AHAHH"; };

var app = connect().
  use(funcErr).
  use(errorHandler).
  listen(process.env.PORT || 3000, 
         function() {
           console.log("ErrorMailer connect demo started at port 3000");
         });

