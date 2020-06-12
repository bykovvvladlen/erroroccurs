const express = require('express');
const user = require('../models/user.js');
const token = require('../models/token.js');
const router = express.Router();

function generateToken(length = 38) {
    const chars = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM0123456789';
    let token = '';

    for (let i = 0; i < length; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }

    return token;
}

router.post('/signup', async function(req, res, next) {
  if (['login', 'email', 'password'].every(key => key in req.body && req.body[key].trim().length > 0)) {
    const { login, email, password } = req.body;
    const similarLogin = await user.findOne({ login });
    const similarEmail = await user.findOne({ email });

    if (!similarLogin) {
      if (!similarEmail) {
        const newUser = new user({ login, email, password });
        await newUser.save();

        res.json({
          success: true
        });
      }

      else res.json({
        success: false,
        error: 'Сan\'t register, the user with this e-mail already exists.'
      });
    }

    else res.json({
      success: false,
      error: 'Сan\'t register, the user with this login already exists.'
    });
  }

  else res.json({
    success: false,
    error: 'Сan\'t register, not all options are specified.'
  });
});

router.post('/signin', async function(req, res, next) {
  if (['login', 'password'].every(key => key in req.body && req.body[key].trim().length > 0)) {
    const { login, password } = req.body;
    const matchUser = await user.findOne({ login });

    if (matchUser) {
      if (matchUser.password == password) {
        const authToken = generateToken();
        const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
        const writeToken = new token({ owner: matchUser.id, token: authToken, expires });
        await writeToken.save();

        res.json({
          success: true,
          token: authToken
        });
      }

      else res.json({
        success: false,
        error: 'Сan\'t login, wrong password.'
      });
    }

    else res.json({
      success: false,
      error: 'Сan\'t login, the user with this login does not exist.'
    });
  }

  else res.json({
    success: false,
    error: 'Сan\'t login, not all options are specified.'
  });
});

module.exports = router;
