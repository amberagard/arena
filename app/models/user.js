var userCollection = global.nss.db.collection('users');
var request = require('request');
var Mongo = require('mongodb');
var _ = require('lodash');
var bcrypt = require('bcrypt');

class User{
  static create(obj, fn){
    userCollection.findOne({email:obj.email}, (e,u)=>{
      if(u){
        fn(null);
      }else{
        var user = new User();
        user.email = obj.email;
        user.password = '';
        user.isValid = false;

        userCollection.save(user, ()=>{
          sendVerificationEmail(user, fn);
        });
      }
    });
  }

  static login(obj, fn){
    userCollection.findOne({email:obj.email}, (e,user)=>{
      if(user){
        var isGood = bcrypt.compareSync(obj.password, user.password);
        if(isGood && user.isValid){
          fn(user);
        }else{
          fn(null);
        }
      }else{
        fn(null);
      }
    });
  }

  static findById(id, fn){
    if(typeof id === 'string'){
      id = Mongo.ObjectID(id);
    }

    userCollection.findOne({_id:id}, (e,u)=>{
      if(u){
        u = _.create(User.prototype, u);
        fn(u);
      }else{
        fn(null);
      }
    });
  }

  changePassword(password, fn){
    this.password = bcrypt.hashSync(password, 8);
    this.isValid = true;

    userCollection.save(this, fn);
  }
}

function sendVerificationEmail(user, fn){
  'use strict';

  var key = process.env.MAILGUN;
  var url = 'https://api:' + key + '@api.mailgun.net/v2/sandbox7244.mailgun.org/messages';
  var post = request.post(url, function(err, response, body){
    console.log('SENDING MESSAGE***********');
    console.log(body);
    fn(user);
  });

  var form = post.form();
  form.append('from', 'admin@arena.com');
  form.append('to', user.email);
  form.append('subject', 'Please verify your email address on ARENA');
  form.append('html', `<a href="http://localhost:3000/verify/${user._id}">Click to Verify</a>`);
}

module.exports = User;
