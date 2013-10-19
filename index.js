var path           = require('path');
var templatesDir   = path.join(__dirname, 'templates');
var emailTemplates = require('email-templates');
var _              = require("underscore");
var async          = require("async");

module.exports = function errormailer(transport, opts) {

  // mh: I moved this inside that block so that I can test properly with different environments
  var env = process.env.NODE_ENV || 'development';

  opts = opts || {};

  opts.from       = opts.from || "error@localhost";
  opts.to         = opts.to || "error@localhost";
  opts.subject    = opts.subject || "Error:";

  // https://github.com/mcollina/node-errormailer/issues/9
  opts.sendAlways = opts.sendAlways || false;

  // four arguments are needed by connect
  return function(errorToBeSent, req, res, next) {

    // override to support both node callback style
    // and connect/express
    next = _.last(arguments);

    if (typeof next != 'function') {
      next = function() {};
    }

    // mh: do not process any further under three conditions:
    // - errorToBeSent is empty
    // - opts.sendAlways is false && environment is not production
    if (!errorToBeSent || (!opts.sendAlways && env != 'production')) {
      next(errorToBeSent);
      return;
    }

    var mail = _.clone(opts);

    async.waterfall([
      async.apply(emailTemplates, templatesDir),
      function(template, callback) {
        var locals = {
          subject: opts.subject,
          title:   'Error'
        };

        if (typeof errorToBeSent == "string") {
          locals.message = errorToBeSent;
          locals.stack = "";
        } else {
          locals.message = errorToBeSent.message;
          locals.stack = errorToBeSent.stack;

          // append error number and code to title
          if (typeof errorToBeSent.errno !== 'undefined' && errorToBeSent.errno != "" &&
              typeof errorToBeSent.code !== 'undefined' && errorToBeSent.code != "") {

            locals.title += ' (Error code ' + errorToBeSent.errno
                         + ' = ' + errorToBeSent.code
                         + ')';
          }
        }
        locals.req = req;
        locals._ = _;

        mail.subject = mail.subject + " " + locals.message;

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
