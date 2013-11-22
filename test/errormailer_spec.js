
describe("error-mailer", function() {

  var transport;
  var transportSpy;
  var instance;
  var afterSend;

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
  });

  it("should send an email with a given to", function(done) {
    instance = errormailer(transport, { to: "hello@matteocollina.com" });

    instance("this is an error");

    afterSend = function() {
      verifyMailWithOpts({ to: "hello@matteocollina.com" });
      done();
    };
  });

  it("should send an email with a given to (bis)", function(done) {
    instance = errormailer(transport, { to: "buuu@matteocollina.com" });

    instance("this is an error");

    afterSend = function() {
      verifyMailWithOpts({ to: "buuu@matteocollina.com" });
      done();
    };
  });

  it("should select a default to if none are passed", function(done) {
    instance = errormailer(transport, {});

    instance("this is an error");

    afterSend = function() {
      verifyMailWithOpts({ to: "error@localhost" });
      done();
    };
  });

  it("should send an email with a given from", function(done) {
    instance = errormailer(transport, { from: "hello@matteocollina.com" });

    instance("this is an error");

    afterSend = function() {
      verifyMailWithOpts({ from: "hello@matteocollina.com" });
      done();
    };
  });

  it("should send an email with a given from (bis)", function(done) {
    instance = errormailer(transport, { from: "buuu@matteocollina.com" });

    instance("this is an error");

    afterSend = function() {
      verifyMailWithOpts({ from: "buuu@matteocollina.com" });
      done();
    };
  });

  it("should select a default from if none are passed", function(done) {
    instance = errormailer(transport, {});

    instance("this is an error");

    afterSend = function() {
      verifyMailWithOpts({ from: "error@localhost" });
      done();
    };
  });

  it("should send an email with a given subject", function(done) {
    instance = errormailer(transport, { subject: "my custom error" });

    instance("this is an error");

    afterSend = function() {
      verifyMailWithOpts({ subject: "my custom error this is an error" });
      done();
    };
  });

  it("should send an email with a given subject (bis)", function(done) {
    instance = errormailer(transport, { subject: "aaa" });

    instance("this is an error");

    afterSend = function() {
      verifyMailWithOpts({ subject: "aaa this is an error" });
      done();
    };
  });

  it("should select a default subject if none are passed", function(done) {
    instance = errormailer(transport, {});

    instance("this is an error");

    afterSend = function() {
      verifyMailWithOpts({ subject: "Error: this is an error" });
      done();
    };
  });

  it("should send emails with all the defaults", function(done) {
    instance = errormailer(transport);

    instance("this is an error");

    afterSend = function() {
      verifyMailWithOpts({ subject: "Error: this is an error", to: "error@localhost", from: "error@localhost" });
      done();
    };
  });

  it("should include the error message in the text if the error is a string", function(done) {
    instance = errormailer(transport, {});

    instance("this is an error");

    afterSend = function() {
      verifyMailWithOpts({ text: sinon.match("this is an error") });
      done();
    };
  });

  it("should include the error message in the text if the error is a string (bis)", function(done) {
    instance = errormailer(transport, {});

    instance("another error");

    afterSend = function() {
      verifyMailWithOpts({ text: sinon.match("another error") });
      done();
    };
  });

  it("should include the error message in the text if the error is an object", function(done) {
    instance = errormailer(transport, {});

    instance({ message: "an error" });

    afterSend = function() {
      verifyMailWithOpts({ text: sinon.match("an error") });
      done();
    };
  });

  it("should include the error message in the text if the error is an object (bis)", function(done) {
    instance = errormailer(transport, {});

    instance({ message: "an 2 error" });

    afterSend = function() {
      verifyMailWithOpts({ text: sinon.match("an 2 error") });
      done();
    };
  });

  it("should include the error no and code in the title if the error object has them", function(done) {
    instance = errormailer(transport, {});
    instance({ message: "an error with code", errno: 34, code: "ENOENT" });

    afterSend = function() {
      verifyMailWithOpts({ text: sinon.match("34") });
      verifyMailWithOpts({ text: sinon.match("ENOENT") });
      verifyMailWithOpts({ html: sinon.match(/Error \(Error code 34 = ENOENT\)<\/h2/)});
      done();
    };
  });

  it("should NOT include the error no and code in the title if the error no is undefined", function(done) {
    instance = errormailer(transport, {});
    instance({ message: "an error w/o no but code", errno: undefined, code: "ENOENT" });

    afterSend = function() {
      verifyMailWithOpts({ html: sinon.match(/Error<\/h2/)});
      done();
    };
  });

  it("should NOT include the error no and code in the title if the error code is undefined", function(done) {
    instance = errormailer(transport, {});
    instance({ message: "an error w/o code but no", errno: 34, code: undefined });

    afterSend = function() {
      verifyMailWithOpts({ html: sinon.match(/Error<\/h2/)});
      done();
    };
  });

  it("should include the error stack in the text if the error is an object", function(done) {
    instance = errormailer(transport, {});

    instance({ stack: "the stack" });

    afterSend = function() {
      verifyMailWithOpts({ text: sinon.match("the stack") });
      done();
    };
  });

  it("should include the error stack in the text if the error is an object (bis)", function(done) {
    instance = errormailer(transport, {});

    instance({ stack: "the 2 stack" });

    afterSend = function() {
      verifyMailWithOpts({ text: sinon.match("the 2 stack") });
      done();
    };
  });

  it("should send an email when not in production but sendAlways is on", function(done) {
    process.env.NODE_ENV = 'staging';

    instance = errormailer(transport, { to: "hello@matteocollina.com", sendAlways: true });

    instance("this is an error");

    afterSend = function() {
      verifyMailWithOpts({ to: "hello@matteocollina.com"});
      done();
    };
  });

  it("should skip error based on opts.ignore()", function(done) {
    instance = errormailer(transport, {
      to: "hello@matteocollina.com",
      sendAlways: true,
      ignore: function(err) {
        return !!err;
      }
    });

    instance("this is an error", null, null, function() {
      expect(transportSpy).not.to.have.been.called;
      done();
    });
  });
});

