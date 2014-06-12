'use strict';

var traceur = require('traceur');
var dbg = traceur.require(__dirname + '/route-debugger.js');
var initialized = false;

module.exports = (req, res, next)=>{
  if(!initialized){
    initialized = true;
    load(req.app, next);
  }else{
    next();
  }
};

function load(app, fn){
  var home = traceur.require(__dirname + '/../routes/home.js');
  var users = traceur.require(__dirname + '/../routes/users.js');

  app.all('*', users.lookup);

  app.get('/', dbg, home.index);

  app.get('/register', dbg, users.register);
  app.post('/register', dbg, users.validate);

  app.get('/verify/:id', dbg, users.verify);
  app.post('/verify/:id', dbg, users.password);

  app.get('/login', dbg, users.login);
  app.post('/login', dbg, users.authenticate);

  app.all('*', users.bounce);

  app.post('/logout', dbg, users.logout);
  app.get('/play', dbg, users.play);

  console.log('Routes Loaded');
  fn();
}
