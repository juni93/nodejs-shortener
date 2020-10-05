require('dotenv').config()
const express = require('express')
const path = require('path')
const routes = require('./routes/')
const database = require('./db/database')
const fetch = require('isomorphic-fetch')

const app = express()
app.use(express.json())
app.use(express.static('./app/'))
//set template engine to ejs
app.set('view engine', 'ejs')

//set urlencoded extended to false to use querystring library
app.use(express.urlencoded({ extended: true}))

//set views
app.set('views', './app/views')

const port = process.env.PORT || 8080;

//set main route
app.get('/', (req, res) => {
    res.render('index')
})

//set recaptcha verify
app.post('/verify', (req, res) => {
    const token = req.body.token
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_V3_SECRET}&response=${token}`;
    fetch(url, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(google_response => res.json({ google_response }))
    .catch(error => res.json({ error }));
})

//set post view
//const baseUrl = process.env.LOCAL_BASE_URL
const baseUrl = process.env.PROD_BASE_URL
app.post('/', async (req, res) => {
    //verify google recaptcha
    const token = req.body.data.recaptcha
    if(token === undefined || token === '' || token === null){
        return res.json({'message': 'Qualcosa non è andato a buon fine'})
    }
    secKey = process.env.RECAPTCHA_V3_SECRET
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secKey}&response=${token}`;
    fetch(url, {
        method: 'POST'
    })
    .then((response) => response.json())
    .then(json => {
        if(json.success !== undefined && !json.success) {
            return res.json({"message" : "Failed captcha verification"});
        }
        //get user value and save in db and send response to client
        routes.shortener.insert(req, res, baseUrl)
        
    })
})

//redirect short url to long url route
app.get('/:shortcode', (req, res, next) => {
    //get the requested short url and check if exits in database and redirect, if not send 404
    routes.redirecter.shortToLong(req, res)
})


app.listen(port)

