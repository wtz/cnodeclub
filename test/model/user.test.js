/**
 * Module dependencies
 */
var should = require('should'),
  async = require('async'),
  db = require('../db'),
  models = db.models;
var User = models.User;
var shared = require('./shared');

describe('Model#User', function() {
  beforeEach(shared.createUser);
  afterEach(shared.removeUsers);

  describe('Validators', function() {
    describe('User#email', function() {
      it('email required', function(done) {
        var user = new User({
          email: '',
          username: 'heroic',
          password: '111111'
        });
        user.validate(function(err) {
          should.exist(err);
          err.name.should.eql('ValidationError');
          done();
        });
      });

      it('invalid email should throw an error', function(done) {
        var user = new User({
          email: 'heroic@email',
          username: 'heroic',
          password: '111111'
        });
        user.validate(function(err) {
          should.exist(err);
          err.name.should.eql('ValidationError');
          done();
        });
      });

      it('email is unique', function(done) {
        User.create({
          email: 'me@heroicyang.com',
          username: 'heroicyang',
          password: '111111'
        }, function(err) {
          should.exist(err);
          err.name.should.eql('ValidationError');
          done();
        });
      });
    });

    describe('User#username', function() {
      it('username required', function(done) {
        var user = new User({
          email: 'heroicyang@gmail.com',
          username: '',
          password: '111111'
        });
        user.validate(function(err) {
          should.exist(err);
          err.name.should.eql('ValidationError');
          done();
        });
      });

      it('non-alphanumeric username shoud throw an error', function(done) {
        var user = new User({
          email: 'heroicyang@gmail.com',
          username: 'heroic*=&^',
          password: '111111'
        });
        user.validate(function(err) {
          should.exist(err);
          err.name.should.eql('ValidationError');
          done();
        });
      });

      it('length is too short or too long should throw an error', function(done) {
        var usernames = ['hero', 'heroicyang1234567'],
          user;
        async.each(usernames, function(username, next) {
          user = new User({
            email: 'heroicyang@gmail.com',
            username: username,
            password: '111111'
          });
          user.validate(function(err) {
            should.exist(err);
            err.name.should.eql('ValidationError');
            next(null);
          });
        }, done);
      });

      it('username is unique', function(done) {
        User.create({
          email: 'heroicyang@gmail.com',
          username: 'heroic',
          password: '111111'
        }, function(err) {
          should.exist(err);
          err.name.should.eql('ValidationError');
          done();
        });
      });
    });

    describe('User#password', function() {
      it('when creating user password can not be blank', function(done) {
        User.create({
          email: 'heroicyang@gmail.com',
          username: 'heroicyang',
          password: ''
        }, function(err) {
          should.exist(err);
          err.name.should.eql('ValidationError');
          done();
        });
      });

      it('length is too short or too long should throw an error', function(done) {
        var passwords = ['hero', 'heroicyang1234567heroicyang1234567'],
          user;
        async.each(passwords, function(password, next) {
          user = new User({
            email: 'heroicyang@gmail.com',
            username: 'heroicyang',
            password: password
          });
          user.validate(function(err) {
            should.exist(err);
            err.name.should.eql('ValidationError');
            next(null);
          });
        }, done);
      });
    });

    describe('User#website', function() {
      it('invalid website should throw an error', function(done) {
        var user = new User({
          email: 'heroicyang@gmail.com',
          username: 'heroicyang',
          password: '111111',
          website: 'asdasdsadasdasd'
        });
        user.validate(function(err) {
          should.exist(err);
          err.name.should.eql('ValidationError');
          done();
        });
      });
    });
  });

  describe('Hooks', function() {
    describe('pre/user.js', function() {
      it('processing user data before validation', function(done) {
        var user = new User({
          email: 'heroicyang@gmail.com',
          username: 'heroicyang',
          password: '111111',
          tagline: '<script>alert(\'xss\');</script>'
        });
        user.validate(function() {
          user.nickname.should.eql(user.username);
          user.tagline.should.eql('[removed]alert&#40;\'xss\'&#41;;[removed]');
          done();
        });
      });
    });
  });

  describe('Methods', function() {
    describe('User#authenticate(plainText)', function() {
      it('correct password should return true', function(done) {
        var success = this.user.authenticate('111111'),
          failure = this.user.authenticate('123');
        success.should.be.true;
        failure.should.be.false;
        done();
      });
    });

    describe('User.findOneByUsername(username, callback)', function() {
      it('should return the user if the username matches', function(done) {
        User.findOneByUsername('heroic', function (err, user) {
          should.exist(user);
          user.username.should.eql('heroic');
          done();
        });
      });

      it('should return null if the username does not match', function(done) {
        User.findOneByUsername('heroicyang', function (err, user) {
          should.not.exist(user);
          done();
        });
      });
    });

    describe('User.findOneByEmail(email, callback)', function() {
      it('should return the user if the email matches', function(done) {
        User.findOneByEmail('me@heroicyang.com', function (err, user) {
          should.exist(user);
          user.username.should.eql('heroic');
          user.email.should.eql('me@heroicyang.com');
          done();
        });
      });

      it('should return null if the email does not match', function(done) {
        User.findOneByEmail('heroicyang@gmail.com', function (err, user) {
          should.not.exist(user);
          done();
        });
      });
    });

    describe('User.changePassword(userData, callback)', function() {
      it('password changed', function(done) {
        User.changePassword({
          id: this.user.id,
          oldPassword: '111111',
          newPassword: '123456'
        }, function(err, user) {
          should.not.exist(err);
          should.exist(user);
          user.authenticate('111111').should.be.false;
          user.authenticate('123456').should.be.true;
          done();
        });
      });
    });

    describe('User.edit(userData, callback)', function() {
      it('edit user', function(done) {
        User.edit({
          id: this.user.id,
          nickname: 'Heroic Yang',
          website: 'heroicyang.com'
        }, function(err, user) {
          should.exist(user);
          user.nickname.should.eql('Heroic Yang');
          user.website.should.eql('http://heroicyang.com');
          done();
        });
      });
    });

    describe('User.isUsernameExist(username, callback)', function() {
      it('username is already exist', function(done) {
        User.isUsernameExist('heroic', function(err, exist) {
          if (err) {
            return done(err);
          }
          exist.should.be.true;
          done();
        });
      });

      it('username does not exist', function(done) {
        User.isUsernameExist('heroicyang', function(err, exist) {
          if (err) {
            return done(err);
          }
          exist.should.be.false;
          done();
        });
      });
    });

    describe('User.isEmailExist(email, callback)', function() {
      it('email is already exist', function(done) {
        User.isEmailExist('me@heroicyang.com', function(err, exist) {
          if (err) {
            return done(err);
          }
          exist.should.be.true;
          done();
        });
      });

      it('email does not exist', function(done) {
        User.isEmailExist('heroicyang@gmail.com', function(err, exist) {
          if (err) {
            return done(err);
          }
          exist.should.be.false;
          done();
        });
      });
    });
  });
});