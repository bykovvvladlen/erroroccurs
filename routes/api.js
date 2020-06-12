const express = require('express');
const user = require('../models/user.js');
const router = express.Router();

router.post('/user/create', async function(req, res, next) {
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

module.exports = router;
