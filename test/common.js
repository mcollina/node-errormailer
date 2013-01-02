
var chai = require("chai");
chai.use(require("sinon-chai"));

global.expect = chai.expect;
global.sinon = require("sinon");

// this is an hack to set errormailer
// in production mode, as it is
// how this package is to be used
process.env.NODE_ENV = 'production';
