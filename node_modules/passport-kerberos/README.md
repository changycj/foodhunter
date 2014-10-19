passport-kerberos
=================

Kerberos authentication strategy for Passport.

[Passport](http://passportjs.org/) strategy for authenticating with a username
and password against a kerberos server.

This module lets you authenticate using a username and password in your Node.js
applications.  By plugging into Passport, kerberos authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Installing the required headers on Ubuntu

    sudo apt-get install libkrb5-dev

## Install

    $ npm install passport-kerberos

## Usage

#### Configure Strategy

The kerberos authentication strategy authenticates users using a username and
password.  The strategy requires a `verify` callback, which accepts these
credentials and calls `done` providing a user.

    // The realm used for kerberos authentication.
    var REALM="EXAMPLE.COM"
    
    passport.use(new KerberosStrategy(
      function(username, done) {
        User.findOne({ username: username }, function (err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          return done(null, user, REALM);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'kerberos'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.post('/login', 
      passport.authenticate('kerberos', { failureRedirect: '/login' }),
      function(req, res) {
        res.redirect('/');
      });

## Examples

(To be added.)


## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

[The MIT License](http://opensource.org/licenses/MIT)
passport-kerberos - Copyright (c) 2013 Joshua Heiks
Passport-Local - Copyright (c) 2011-2013 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>