
var connect = require("connect");
var http = require("http");
var URL = require("url");

describe("errormailer connect support", function() {

  var transport;
  var transportSpy;
  var server;
  var errorSeenByConnect;

  function verifyMailWithOpts(opts) {
    expect(transportSpy).to.have.been.calledWith(sinon.match(opts));
  }

  beforeEach(function(done) {
    // this is an hack to set errormailer
    // in production mode, as it is
    // how this package is to be used
    process.env.NODE_ENV = 'production';

    transport = {
      sendMail: function(opts, callback) {
        callback();
      }
    };

    transportSpy = sinon.spy(transport, 'sendMail');

    var errorFunc = function(req, res, next) {
      if(req.url == "/index.html") {
        throw "my custom error";
        return;
      }
      next();
    };

    server = http.createServer(connect().
      use(errorFunc).
      use(errormailer(transport)).
      use(function(err, req, res, next) {
        errorSeenByConnect = err;
        next();
      }));

    server.listen(8283, done);
  });

  afterEach(function(done) {
    server.close(done);
  });

  function get(url, callback) {
    var options = URL.parse(url);
    options.agent = null;
    options.method = 'GET';
    http.get(options, function(res) {
      res.resume();
      callback(res);
    });
  }

  it("should send an email if an exception is raised inside connect", function(done) {
    get("http://localhost:8283/index.html", function(res) {
      expect(transportSpy).to.have.been.called;
      done();
    })
  });

  it("should not send an email if an exception was not raised", function(done) {
    get("http://localhost:8283/aaaa.html", function(res) {
      expect(transportSpy).not.to.have.been.called;
      done();
    })
  });

  it("should send an email including the client ip (text)", function(done) {
    get("http://localhost:8283/index.html", function(res) {
      verifyMailWithOpts({ text: sinon.match("127.0.0.1") });
      done();
    })
  });

  it("should send an email including the path (text)", function(done) {
    get("http://localhost:8283/index.html", function(res) {
      verifyMailWithOpts({ text: sinon.match("/index.html") });
      done();
    })
  });

  it("should send an email including the client ip (html)", function(done) {
    get("http://localhost:8283/index.html", function(res) {
      verifyMailWithOpts({ html: sinon.match("127.0.0.1") });
      done();
    })
  });

  it("should send an email including the path (html)", function(done) {
    get("http://localhost:8283/index.html", function(res) {
      verifyMailWithOpts({ html: sinon.match("/index.html") });
      done();
    })
  });

  it("should send an email including the connection header (text)", function(done) {
    get("http://localhost:8283/index.html", function(res) {
      verifyMailWithOpts({ text: sinon.match("connection") });
      done();
    })
  });

  it("should send an email including the connection header (html)", function(done) {
    get("http://localhost:8283/index.html", function(res) {
      verifyMailWithOpts({ html: sinon.match("connection") });
      done();
    })
  });

  it("should forward the error to the next middleware", function(done) {
    get("http://localhost:8283/index.html", function(res) {
      expect(errorSeenByConnect).to.not.be.undefined;
      done();
    })
  });
});
