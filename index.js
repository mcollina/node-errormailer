var path           = require('path');
var templatesDir   = path.join(__dirname, 'templates');
var emailTemplates = require('email-templates');
var _              = require("underscore");
var async          = require("async");

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
      next(errorToBeSent);
      return;
    }

    var mail = _.clone(opts);

    async.waterfall([
      async.apply(emailTemplates, templatesDir),
      function(template, callback) {
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

        template('basic_error', locals, callback);
      },
      function(html, text, callback) {
        mail.text = text;
        mail.html = html;
        transport.sendMail(mail, callback);
      }
    ], function(err) {
      if(err) {
        console.log(err);
        console.log(errorToBeSent.toString());
      }
      next(errorToBeSent);
    });
  };
};
