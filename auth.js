const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken');
const passport = require('passport');

require('./passport');

const generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: '7d',
    algorithm: 'HS256'
  });
};

module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      console.log('Passport authenticated:', user);
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        const token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
