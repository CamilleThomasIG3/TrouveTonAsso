const express = require('express')
const router = express.Router()

const pool = require('../database')

router.get('/add', (req, res)=> {
  res.render('association/add')
})

router.post('/add', async (req, res)=> {
  const { numSIREN_asso, nom_asso, description_asso, adresse_asso, arrondissement_asso,
     CP_asso, ville_asso, email_asso, tel_asso, facebook_asso, site_asso, logo_asso } = req.body
  const newLink = {
    numSIREN_asso,
    nom_asso,
    description_asso,
    adresse_asso,
    arrondissement_asso,
    CP_asso,
    ville_asso,
    email_asso,
    tel_asso,
    facebook_asso,
    site_asso,
    logo_asso
  }
  console.log(newLink)
  await pool.query('INSERT INTO association set ?', [newLink])
  res.send('received')
})

module.exports = router
