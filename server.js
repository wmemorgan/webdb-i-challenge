const express = require('express');
const server = express();
const logger = require('morgan')

const db = require('./data/accounts-model')

//==== Global middleware ==== //
server.use(express.json())
server.use(logger(`dev`))

//===== GET ===== //
server.get('/api/accounts', async (req, res) => {
  try {
    let data = await db.find()
    res.send(data)
  }

  catch (err) {
    res.status(500).json({ message: `Error retrieving records`})
  }
})

server.get('/api/accounts/:id', validateAccountId, (req, res) => {
  res.send(req.data)
})

//===== POST ===== //
server.post('/api/accounts', async (req, res) => {
  try {
    let data = await db.add(req.body)
    if (data) {
      res.status(201).send(data)
    } else throw err
  }

  catch (err) {
    res.status(500).json({ message: `Error writing to database: `, err })
  }
})

//===== PUT ===== //
server.put('/api/accounts/:id', validateAccountId, async (req, res) => {
  try {
    let updateDataCount = await db.update(req.data.id, req.body)
    if (updateDataCount) {
      let data = await db.findById(req.data.id)
      res.send(data)
    } else throw err
  }

  catch (err) {
    res.status(500).json({ message: `Error updating record: `, err })
  }
})

//===== DELETE ===== //
server.delete('/api/accounts/:id', validateAccountId, async (req, res) => {
  try {
    let deleteDataCount = await db.remove(req.data.id)
    if(deleteDataCount) {
      res.json({ message: `Delete record ${req.data.id} successfully.` })
    } else throw err
  }

  catch (err) {
    res.status(500).json({ message: `Error deleting record: `, err })
  }
})

//===== Default Route ==== //
server.use(`/`, (req, res) => {
  res.send(`<h1>Accounts API microservices</h1>`)
})

// ===== Custom Middleware ==== //
async function validateAccountId(req, res, next) {
  try {
    const data = await db.findById(req.params.id)
    if (data) {
      req.data = data
      next()
    } else {
      res.status(404).json({ message: `Record id does not exist.` })
    }
  }
  catch (err) {
    res.status(500).json({ message: `Failed to process request` })
  }
}

function requiredContent(req, res, next) {
  if (!req.body || !Object.keys(req.body).length) {
    res.status(400).json({ message: "Missing data" })
  } else if (!req.body.name || !req.body.budget) {
    res.status(400).json({ message: "Missing required name or budget field." })
  } else {
    next()
  }
}

module.exports = server;