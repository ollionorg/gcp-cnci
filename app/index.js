const express = require('express')
const controllers = require('./src/controllers')

const app = express()
const port = 8080

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index', {hello: controllers.hello()})
});

app.get('/hello', (req, res) => {
    res.status(200).json(controllers.hello())
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
})