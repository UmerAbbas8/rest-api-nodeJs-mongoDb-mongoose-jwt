const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');

//Load Models
const Subscriber = require('../models/subscriber')

/*************** JWT AUTHENTICATION ******************/
// verifyToken
function verifyToken(req, resp, next) {

  console.log('verify token middleware')

  //Get the auth header value 
  const bearerHeader = req.headers['authorization'];
  //Check if bearer is undefined
  if (typeof bearerHeader != 'undefined') {
    //Split at the space
    const bearer = bearerHeader.split(' ');
    //Get token from array
    const bearerToken = bearer[1];
    //Set the token
    req.token = bearerToken;
    //Next middlleware
    next();
  } else {
    //Forbidden
    resp.sendStatus(403);
  }

}
/*************** END JWT AUTHENTICATION **************/

/*************** Login *******************************/
router.post('/subscribers/login', loginSubscriber, (req, res) => {
  let authenticatedSubscriber = res.subscriber;
  jwt.sign({
    authenticatedSubscriber
  }, 'secretkey', {
    expiresIn: '8h'
  }, (err, token) => {
    res.json({
      token
    });
  });
});
/*************** End Login ***************************/

/*************** SUBSCRIBER CALLS ********************/
// Subscriber Middleware functions
async function getSubscriber(req, res, next) {

  console.log('getSubscriber middleware')

  let subscriber;
  try {
    subscriber = await Subscriber.findById(req.params.id)
    if (subscriber == null) {
      return res.status(404).json({
        message: "Subscriber not found"
      })
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }

  res.subscriber = subscriber
  next()
}

async function loginSubscriber(req, res, next) {
  let subscriber;
  try {
    subscriber = await Subscriber.findOne({
      username: req.body.username,
      password: req.body.password
    })
    if (subscriber == null) {
      return res.status(404).json({
        message: "Invalid credentials"
      })
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }

  res.subscriber = subscriber
  next()
}
//End Middleware functions

router.get('/subscribers/test', (req, res) => {
  res.send('hello world')
})

//TODO: create subscriber
router.post('/subscribers/', async (req, res) => {
  let request = req.body
  const subscriber = new Subscriber({
    username: request.username,
    password: request.password,
    name: request.name,
    subscribedToChannel: request.subscribedToChannel
  })

  subscriber.customFields = request.customFields.map(obj => (obj));
  try {
    const newSubscriber = await
    subscriber.save()
    res.status(201).json(newSubscriber);
  } catch (error) {
    res.status(400).json({
      message: error.message
    })
  }
})

//TODO: get subscriber
router.get('/subscribers/:id', getSubscriber, (req, res) => {
  res.send(res.subscriber)
})

//TODO: update subscriber
router.patch('/subscribers/:id', verifyToken, getSubscriber, async (req, res) => {

  console.log('update function')
  console.log('req.token', req.token)

  jwt.verify(req.token, 'secretkey', async (err, token) => {

    if (err) {
      res.sendStatus(403);
    } else {
      console.log(req.params.id)
      console.log(token.authenticatedSubscriber._id)
      if (req.params.id == token.authenticatedSubscriber._id) {

        if (req.body.name != null) {
          res.subscriber.name = req.body.name
        }
        if (req.body.subscribedToChannel != null) {
          res.subscriber.subscribedToChannel = req.body.subscribedToChannel
        }
        try {
          const updatedSubscriber = await res.subscriber.save()
          res.json(updatedSubscriber)
        } catch (error) {
          res.status(400).json({
            message: error.message
          })
        }
      } else {
        console.log('ID mismatch', req.params.id)
        res.sendStatus(403);
      }
    }
  })
})

//TODO: delete subscriber
router.delete('/subscribers/:id', getSubscriber, async (req, res) => {
  try {
    await res.subscriber.remove()
    res.json({
      message: "Deleted Subscriber"
    })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
})

//TODO: get all subscribers
router.get('/subscribers/', async (req, res) => {
  try {
    const subscribers = await Subscriber.find()
    res.json(subscribers)
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
})
/*************** END SUBSCRIBER CALLS ****************/

module.exports = router