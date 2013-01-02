var path           = require('path');
var templatesDir   = path.join(__dirname, 'templates');
var emailTemplates = require('email-templates');
var _ = require("underscore");

var env = process.env.NODE_ENV || 'development';

module.exports = function errormailer(transport, opts) {

  opts = opts || {};

  opts.from = opts.from || "error@localhost";
  opts.to = opts.to || "error@localhost";
  opts.subject = opts.subject || "Error";

  // four arguments are needed by connect
  return function(errorToBeSent, req, res, next) {

    // override to support both node callback style
    // and connect/express
    next = _.last(arguments);

    if(typeof next != 'function') {
      next = function() {}
    }

    if(env != 'production' || !errorToBeSent) {
      next();
      return;
    }

    var mail = _.clone(opts);

    emailTemplates(templatesDir, function(err, template) {
      
      if(err) {
        console.log(err);
        console.log(errorToBeSent.toString());
        return;
      }

      var locals = {
        subject: opts.subject
      };

      if(typeof errorToBeSent == "string") {
        locals.message = errorToBeSent;
        locals.stack = "";
      } else {
        locals.message = errorToBeSent.message;
        locals.stack = errorToBeSent.stack;
      }
      locals.req = req;
      locals._ = _;

      template('basic_error', locals, function(err, html, text) {

        mail.text = text;
        mail.html = html;

        transport.sendMail(mail, function(err) {
          next();
          if (err) console.log(err);
        });
      });

    });
  };
};
