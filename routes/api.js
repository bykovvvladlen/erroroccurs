const express = require('express');
const user = require('../models/user.js');
const token = require('../models/token.js');
const question = require('../models/question.js');
const comment = require('../models/comment.js');
const vote = require('../models/vote.js');
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

router.post('/question/create', async function(req, res, next) {
  if (['token', 'title', 'body'].every(key => key in req.body && req.body[key].trim().length > 0)) {
    const { title, body } = req.body;
    const matchToken = await token.findOne({ token: req.body.token });

    if (matchToken) {
      const matchUser = await user.findOne({ _id: matchToken.owner });

      if (matchUser) {
        const newQuestion = new question({ owner: matchUser.id, created: Date.now(), title, body });
        await newQuestion.save();

        res.json({
          success: true
        });
      }

      else res.json({
        success: false,
        error: 'Сan\'t create a question, user not found.'
      });
    }

    else res.json({
      success: false,
      error: 'Сan\'t create a question, wrong token.'
    });
  }

  else res.json({
    success: false,
    error: 'Сan\'t create a question, not all parameters are specified.'
  });
});

router.post('/comment/create', async function(req, res, next) {
  if (['token', 'target', 'body'].every(key => key in req.body && req.body[key].trim().length > 0)) {
    const { target, body } = req.body;
    const matchToken = await token.findOne({ token: req.body.token });

    if (matchToken) {
      const matchUser = await user.findById(matchToken.owner);

      if (matchUser) {
        if (/^[0-9a-fA-F]{24}$/.test(target)) {
          let matchTarget = await question.findById(target);
          if (!matchTarget) matchTarget = await comment.findById(target);

          if (matchTarget) {
            const newComment = new comment({ owner: matchUser.id, created: Date.now(), target, body });
            await newComment.save();

            res.json({
              success: true
            });
          }

          else res.json({
            success: false,
            error: 'Сan\'t create a comment, target not found.'
          });
        }

        else res.json({
          success: false,
          error: 'Сan\'t create a comment, invalid target id.'
        });
      }

      else res.json({
        success: false,
        error: 'Сan\'t create a comment, user not found.'
      });
    }

    else res.json({
      success: false,
      error: 'Сan\'t create a comment, wrong token.'
    });
  }

  else res.json({
    success: false,
    error: 'Сan\'t create a comment, not all parameters are specified.'
  });
});

router.post('/vote/create', async function(req, res, next) {
  if (['token', 'target', 'good'].every(key => key in req.body)) {
    const { target, good } = req.body;
    const matchToken = await token.findOne({ token: req.body.token });

    if (matchToken) {
      const matchUser = await user.findById(matchToken.owner);

      if (matchUser) {
        if (/^[0-9a-fA-F]{24}$/.test(target)) {
          let matchTarget = await question.findById(target);
          if (!matchTarget) matchTarget = await comment.findById(target);

          if (matchTarget) {
            const matchVote = await vote.findOne({ target, owner: matchUser.id });

            if (matchVote) {
              if (matchVote.good != good) {
                matchVote.good = good;
                await matchVote.save();

                res.json({
                  success: true
                });
              }

              else res.json({
                success: false,
                error: 'Сan\'t create a vote, it\'s already exists.'
              });
            }

            else {
              const newVote = new vote({ owner: matchUser.id, target, good });
              await newVote.save();

              res.json({
                success: true
              });
            }
          }

          else res.json({
            success: false,
            error: 'Сan\'t create a vote, target not found.'
          });
        }

        else res.json({
          success: false,
          error: 'Сan\'t create a vote, invalid target id.'
        });
      }

      else res.json({
        success: false,
        error: 'Сan\'t create a vote, user not found.'
      });
    }

    else res.json({
      success: false,
      error: 'Сan\'t create a vote, wrong token.'
    });
  }

  else res.json({
    success: false,
    error: 'Сan\'t create a vote, not all parameters are specified.'
  });
});

module.exports = router;
