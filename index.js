const path          = require('path');
const EmailTemplate = require('email-templates').EmailTemplate;
const _             = require('underscore');
const waterfall     = require('async/waterfall');

const basicErrorTemplatesDir = path.join(__dirname, 'templates', 'basic_error');

function truncateString(str, n) {
    return str.length > n ? str.substr(0, n - 1) + '...' : str;
}

module.exports = function errormailer(transport, opts) {

  // mh: I moved this inside that block so that I can test properly with different environments
  const env = process.env.NODE_ENV || 'development';

  opts = opts || {};

  opts.from       = opts.from || "error@localhost";
  opts.to         = opts.to || "error@localhost";
  opts.subject    = opts.subject || "Error:";

  // https://github.com/mcollina/node-errormailer/issues/9
  opts.sendAlways = opts.sendAlways || false;

  // https://github.com/mcollina/node-errormailer/issues/12
  opts.ignore     = opts.ignore || false;

  opts.debugProperties = opts.debugProperties || false;

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
    // - custom function in opts.ignore tells to ignore the error
    if (!errorToBeSent ||
       (!opts.sendAlways && env != 'production') ||
       (opts.ignore && typeof opts.ignore == 'function' && opts.ignore(errorToBeSent))) {

      next(errorToBeSent);
      return;
    }

    const mail = _.clone(opts);

    waterfall([
      function(callback) {

        const basicErrorEmail = new EmailTemplate(basicErrorTemplatesDir)

        const locals = {
          subject:          opts.subject,
          title:            'Error',
          errorProperties:  undefined
        };

        if (typeof errorToBeSent == 'string') {
          locals.message = errorToBeSent;
          locals.stack = "";
        } else {

          // mh: it is better to call toString() because it enables
          // developoers to customize the message output by
          // overriding toString() in an error sub class
          if (errorToBeSent instanceof Error) {
            locals.message = errorToBeSent.toString();
          } else {
            locals.message = errorToBeSent.message;
          }

          locals.stack = errorToBeSent.stack;

          const errorNumber = errorToBeSent.errno && errorToBeSent.errno !== "" ? errorToBeSent.errno : null,
                errorCode   = errorToBeSent.code && errorToBeSent.code !== "" ? errorToBeSent.code : null,
                errorStatus = errorToBeSent.status && errorToBeSent.status !== "" ? errorToBeSent.status : null,

                errorContext = []

          if (errorNumber || errorCode || errorStatus) {

            if (errorCode && errorNumber) {
              errorContext.push('Error code ' + errorNumber + ' = ' + errorCode);
            }

            if (errorStatus) {
              errorContext.push('Error status code ' + errorStatus)
            }
          }

          if (errorContext.length > 0) {
            locals.title += ' (' + errorContext.join(', ') + ')'
          }

          // mh: this will collect all error properties if debug mode is wanted
          if (opts.debugProperties) {
            var property

            locals.errorProperties = {}

            for (property in errorToBeSent) {
                if (errorToBeSent.hasOwnProperty(property)) {
                    locals.errorProperties[property] = errorToBeSent[property].toString()
                }
            }
          }
        }

        locals.req = req;
        locals._ = _;

        if (locals.message)
          mail.subject += " " + truncateString(locals.message, 30);

        basicErrorEmail.render(locals, function(err, result) {
          if (err) {
            callback(err)
          } else {
            callback(null, result.html, result.text)
          }
        });
      },
      function(html, text, callback) {
        mail.text = text;
        mail.html = html;
        transport.sendMail(mail, callback);
      }
    ], function(err) {
      if (err) {
        console.error(err);
        console.error(errorToBeSent.toString());
      }
      next(errorToBeSent);
    });
  };
};
