
var domain = require("domain");
var _ = require("underscore");

describe("errormailer domain support", function() {

  var transport;
  var transportSpy;
  var afterSend;
  var d;
  var uncaughtExceptionHandler;

  function verifyMailWithOpts(opts) {
    expect(transportSpy).to.have.been.calledWith(sinon.match(opts));
  }

  beforeEach(function() {
    // this is an hack to set errormailer
    // in production mode, as it is
    // how this package is to be used
    process.env.NODE_ENV = 'production';

    transport = {
      sendMail: function(opts) {
        afterSend();
      }
    };
    transportSpy = sinon.spy(transport, 'sendMail');

    d = domain.create();
    d.on("error", errormailer(transport));

    // override for a bug in mocha
    // https://github.com/visionmedia/mocha/issues/513
    uncaughtExceptionHandler = _.last(process.listeners("uncaughtException"));
    process.removeListener("uncaughtException", uncaughtExceptionHandler);
  });

  afterEach(function() {
    d.dispose();
    process.on("uncaughtException", uncaughtExceptionHandler);
  });

  it("should support Domain bindings", function(done) {
    afterSend = function() {
      verifyMailWithOpts({ text: sinon.match("this is an error") });
      done();
    };

    d.run(function() {
      process.nextTick(function() {
        throw new Error("this is an error"); 
      });
    });
  });

});
