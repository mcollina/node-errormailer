
var domain = require("domain");
var _ = require("underscore");

describe("errormailer domain support", function() {

  var transport;
  var transportSpy;
  var afterSend;
  var d;

  function verifyMailWithOpts(opts) {
    expect(transportSpy).to.have.been.calledWith(sinon.match(opts));
  }

  beforeEach(function() {
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
    process.removeListener("uncaughtException", _.last(process.listeners("uncaughtException")));
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
