const express = require('express')
const router = express.Router()

const pool = require('../database')

router.get('/', async (req, res) =>{
  const association = await pool.query('SELECT * FROM association')
  const type_association = await pool.query('SELECT * FROM type_association')
  const arrondissement = await pool.query('SELECT DISTINCT arrondissement_asso FROM association')
  const pays = await pool.query('SELECT * FROM pays')
  res.render('index', {association, type_association, arrondissement, pays})
})

router.get('/a_propos', (req,res)=>{
  res.render('a_propos')
})

//Display one association card
router.get('/fiche/:numSIREN_asso', async (req, res) =>{
  const { numSIREN_asso } = req.params
  const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])
  res.render('association/fiche', {association: association[0]})
})

//Display associations with criteria chosen
router.get('/recherche/?recherche=:mot', async (req, res) =>{
  const mot = req.params
  console.log(mot)
  const mot2 = await pool.query('SELECT * FROM association WHERE nom_asso=?', [mot])
  console.log(mot2)
  res.render('fait')
})

module.exports = router
