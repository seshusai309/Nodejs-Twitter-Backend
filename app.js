const express = require('express')
const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const dbpath = path.join(__dirname, 'twitterClone.db')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

let db = null

const initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http:/localhost:3000/')
    })
  } catch (e) {
    console.log(`Error in db : ${e.message}`)
    process.exit(1)
  }
}

initializeDbServer()

const authenticate = () => {}

//API-1 regester user
app.post('/register/', async (request, response) => {
  console.log('hello')
  const {username, password, name, gender} = request.body
  let sqlquery = `SELECT * FROM user WHERE name LIKE '${username}' ;`
  let dbresponse = await db.get(sqlquery)
  console.log(username, password, name, gender)
  console.log(dbresponse)
  if (dbresponse === undefined) {
    if (password.length < 6) {
      response.status(400)
      response.send('Password is too short')
    } else {
      const hashedPassword = await bcrypt.hash(password, 10)
      sqlquery = `INSERT INTO 
                user (name, username, password, gender)
            VALUES(
                '${name}',
                '${username}',
                '${hashedPassword}',
                '${gender}'
            )    
         ;`
      await db.run(sqlquery)
      response.status(200)
      response.send('User created successfully')
    }
  } else {
    response.status(400)
    response.send('User already exits')
  }
})

//API-2 login user
app.post('/login/', async (request, response) => {
  const {username, password} = request.body
  console.log(username, password)
  let sqlquery = `SELECT * FROM user WHERE username LIKE '${username}';`
  const dbresponse = await db.get(sqlquery)
  if (dbresponse === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const passwordMatched = await bcrypt.compare(password, dbresponse.password)
    if (passwordMatched === true) {
      const payload = {
        username: username,
      }
      const jwtToken = jwt.sign(payload, 'SECREATE_KEY')
      response.send({jwtToken})
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})

//API 3
