
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

    var errorFunc = function(req, res) { 
      throw "my custom error";
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
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
  });
});
