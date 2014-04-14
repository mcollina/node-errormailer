node-errormailer
====================

[![Build
Status](https://travis-ci.org/mcollina/node-errormailer.png)](https://travis-ci.org/mcollina/node-errormailer)

Sending email for each error must be easy!
The most basic form of error notification is sending an email for each
error, and it must be super-easy to set up in node applications.

## Usage

__errormailer__ is based upon the awesome
[Nodemailer](https://github.com/andris9/Nodemailer), so you will have to
configure it before usage.

```
var nodemailer  = require("nodemailer");
var errormailer = require("errormailer");

// create reusable transport method (opens pool of SMTP connections)
var transport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "gmail.user@gmail.com",
        pass: "userpass"
    }
});

var errorHandler = errormailer(transport, {
  subject: "Testing errormailer!",
  to: "matteo.collina@gmail.com"
});

errorHandler("this is an error!");
```

Currently error emails are only sent for production environments. But if you want it to send always, use the option `sendAlways`. There is also an option `ignore` where you can specify your own logic when to ignore an error to be sent, for example:

```
var errorHandler = errormailer(transport, {
  subject: "Testing errormailer!",
  to: "matteo.collina@gmail.com",
  ignore: function(errorToBeSent) {
    // any errors won't be sent that have a code && it's below 400
    return errorToBeSent.code && errorToBeSent.code < 400;
  }
});
```

## Custom output

If you pass an genuine Error object onto __errormailer__, then `toString()` will be called to retrieve the error message. Like that, this enables the develope to customize the message output by overriding `toString()` in an error sub class.

## Connect/Express support

__errormailer__ fully supports Connect and Express, just use the
built function (`errorHandler` in the previous example) as a middleware.
See this ([Example](https://github.com/mcollina/node-errormailer/blob/master/examples/connect.js))
for more details.

## Install

```
npm install nodemailer --save
npm install node-errormailer --save
```

## Examples

__errormailer__ supports:
 * node standard callback system
([Example](https://github.com/mcollina/node-errormailer/blob/master/examples/simple.js));
 * connect and express
([Example](https://github.com/mcollina/node-errormailer/blob/master/examples/connect.js));
 * the [Domain](http://nodejs.org/api/domain.html) object, for better
error handling in node
([Example](https://github.com/mcollina/node-errormailer/blob/master/examples/domain.js));

## Contributing to node-errormailer

* Check out the latest master to make sure the feature hasn't been
  implemented or the bug hasn't been fixed yet
* Check out the issue tracker to make sure someone already hasn't
  requested it and/or contributed it
* Fork the project
* Start a feature/bugfix branch
* Commit and push until you are happy with your contribution
* Make sure to add tests for it. This is important so I don't break it
  in a future version unintentionally.
* Please try not to mess with the Makefile and package.json. If you
  want to have your own version, or is otherwise necessary, that is
  fine, but please isolate to its own commit so I can cherry-pick around
  it.

## HTML email template license

The html email template it is based on [MailChimp](http://mailchimp.com)'s
email blueprints: https://github.com/mailchimp/Email-Blueprints

The html email template is licensed under a Creative Commons
Attribution-ShareAlike 3.0 Unported License:
http://creativecommons.org/licenses/by-sa/3.0/

## LICENSE - "MIT License"

Copyright (c) 2013 Matteo Collina, http://matteocollina.com

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
