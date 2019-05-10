const express = require('express')
const router = express.Router()

const pool = require('../database')

router.get('/', async (req, res) =>{
  const association = await pool.query('SELECT * FROM association')
  res.render('index', {association})
})

router.get('/a_propos', (req,res)=>{
  res.render('a_propos')
})
module.exports = router
