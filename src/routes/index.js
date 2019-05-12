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

//Display one association card
router.get('/fiche/:numSIREN_asso', async (req, res) =>{
  const { numSIREN_asso } = req.params
  const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])
  console.log(association)
  res.render('association/fiche', {association: association[0]})
})

module.exports = router
