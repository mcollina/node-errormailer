
describe("error-mailer", function() {

  var transport;
  var transportSpy;
  var instance;
  var afterSend;

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

  it("should include the error no, code and the status in the title if the error object has them", function(done) {
    instance = errormailer(transport, {});
    instance({ message: "an error with code and status", errno: 34, code: "ENOENT", status: 413 });

    afterSend = function() {
      verifyMailWithOpts({ text: sinon.match("34") });
      verifyMailWithOpts({ text: sinon.match("ENOENT") });
      verifyMailWithOpts({ html: sinon.match(/Error \(Error code 34 = ENOENT, Error status code 413\)<\/h2/)});
      done();
    };
  });

  it("should NOT include the error no and code in the title if the error no is undefined", function(done) {
    instance = errormailer(transport, {});
    instance({ message: "an error w/o no but code", code: "ENOENT" });

    afterSend = function() {
      verifyMailWithOpts({ html: sinon.match(/Error<\/h2/)});
      done();
    };
  });

  it("should NOT include the error no and code in the title but status code if only the status code is given", function(done) {
    instance = errormailer(transport, {});
    instance({ message: "an error with status only", status: 422 });

    afterSend = function() {
      verifyMailWithOpts({ html: sinon.match(/Error \(Error status code 422\)<\/h2/)});
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

  it("should include the error message from error's native toString", function(done) {
    instance = errormailer(transport, {});

    instance(new Error("another error, beep!"));

    afterSend = function() {
      verifyMailWithOpts({ text: sinon.match("Error: another error, beep!") });
      done();
    };
  });

  it("should have truncated subject line on very long messages", function(done) {
    instance = errormailer(transport, {});

    instance({ message: "this is a very long message line that will cause the subject to be truncated" });

    afterSend = function() {
      verifyMailWithOpts({ subject: sinon.match("Error: this is a very long message l...") });
      done();
    };
  });

  it("should print additional error properties when in debug mode", function(done) {
    instance = errormailer(transport, {
      debugProperties: true
    });

    instance({ message: "debug me", limit: 4353456345, expected: 9848234, some_context: 'some context' });

    afterSend = function() {
      verifyMailWithOpts({ html: sinon.match(/Error properties \(debug\)<\/h2>/)});
      verifyMailWithOpts({ html: sinon.match(/<strong>limit\:<\/strong> 4353456345<br>/)});
      verifyMailWithOpts({ html: sinon.match(/<strong>expected\:<\/strong> 9848234<br>/)});
      verifyMailWithOpts({ html: sinon.match(/<strong>some_context\:<\/strong> some context<br>/)});
      done();
    };
  });
});

