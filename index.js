const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
let mongoose = require('mongoose')
require('dotenv').config()

const mySecret = process.env['MONGO_URI']

mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true })

let userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: Number(0)
  },
  log: [{
    description: String,
    duration: Number,
    date: Date,
    _id: false
  }]
})

let User = mongoose.model('User', userSchema)

app.use(cors())
app.use(express.static('public'))
app.use('/', bodyParser.urlencoded({extended: false}))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// const createAndSaveUser = () => {  
// }

// let testUser = new User({
//     name: 'Arere'
// })    
// testUser.save()
//   .then(doc => {
//     console.log(doc)
//   })
//   .catch(err => {
//     console.log(err)
//   })

app.get('/api/users', function(req, res) {
  let fetch = User.find({}, '_id username __v', (err, data) => {
    if(err) return console.log(err)    
    res.json(data)
  })
});


app.post('/api/users', function(req, res) {
  console.log(req.body.username) 
  let novoUsuario = new User({
    username: req.body.username,    
  })
  novoUsuario.save((err, data) => {
    if(err) return console.log(err)    
    return res.json({
      'username': data.username,
      '_id': data._id
    })
  })    
})

app.post('/api/users/:_id/exercises', function(req, res) {
  console.log(req.params._id, typeof req.params._id)
  // console.log(req.body)
  let handleDate = ''
  if(typeof req.params._id == 'undefined' || typeof req.body._id == 'undefined') return res.json({'error': 'undefined user'})
  if(req.body.date === '') {
    handleDate = new Date().toDateString()
    console.log(handleDate)
  } else {
    let splitDate = req.body.date.split('-')
    handleDate = new Date(splitDate[0], splitDate[1], splitDate[2]).toDateString()
  }
  console.log(req.body['_id'])
  console.log(typeof req.body.date)
  let user = User.findById({_id: req.body['_id']}, (err, data) => {
    if(err) return console.log(err, req.body)
    // console.log(data)
    data.count += 1
    data.log.push({
      description: req.body.description,
      duration: Number(req.body.duration),
      date:  handleDate
    })
    data.save((err, update) => {
      if(err) return console.log(err)
      // console.log(update)
      res.json({
        '_id': update._id,
        'username': update.username,
        'date': handleDate,
        'duration': Number(req.body.duration),
        'description': req.body.description           
      })
    })
  })
})

app.get('/api/users/:_id/logs', handleLogs);

function handleLogs(req, res) {
  console.log(req.params._id)
  let exerciseLog = User.findById({'_id': req.params._id}, '_id username count log', (err, data) => {
    if(err) return console.log(err)
    console.log(data.username)
    res.json({
      '_id': data._id,
      'username': data.username,
      'count': data.count,
      'log': data.log
    })
  })
  // res.json({'alo': 'mae'})
}

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
