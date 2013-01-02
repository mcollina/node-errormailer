
var errormailer = require("../");
var connect = require("connect");
var http = require("http");

describe("errormailer connect support", function() {

  var transport;
  var transportSpy;
  var instance;
  var server;

  function verifyMailWithOpts(opts) {
    expect(transportSpy).to.have.been.calledWith(sinon.match(opts));
  }

  beforeEach(function(done) {
    transport = {
      sendMail: function(opts, callback) {
        callback();
      }
    };
    transportSpy = sinon.spy(transport, 'sendMail');

    instance = errormailer(transport);

    var errorFunc = function(req, res, next) { 
      if(req.originalUrl == "/index.html")
        throw "my custom error";
      next();
    };
    server = connect().use(errorFunc).use(instance).listen(8283, done);
  });

  afterEach(function(done) {
    server.close(done);
  });

  it("should send an email if an exception is raised inside connect", function(done) {
    http.get("http://localhost:8283/index.html", function(res) {
      expect(transportSpy).to.have.been.called;
      done();
    })
  });

  it("should not send an email if an exception was not raised", function(done) {
    http.get("http://localhost:8283/aaaa.html", function(res) {
      expect(transportSpy).not.to.have.been.called;
      done();
    })
  });
});
