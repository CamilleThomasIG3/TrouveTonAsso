const express = require('express')
const router = express.Router()

const pool = require('../database')

router.get('/', async (req, res) =>{
  const association = await pool.query('SELECT * FROM association')
  const type_association = await pool.query('SELECT * FROM type_association')
  const arrondissement = await pool.query('SELECT DISTINCT arrondissement_asso FROM association WHERE arrondissement_asso is not null')
  const pays = await pool.query('SELECT * FROM pays')
  res.render('index', {association, type_association, arrondissement, pays})
})

router.get('/a_propos', (req,res)=>{
  res.render('a_propos')
})

//Display view "fiche association"
router.get('/fiche/:numSIREN_asso', async (req, res)=> {
  const { numSIREN_asso } = req.params
  const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])

  //Recuperation action countries
  const agir_pays = await pool.query('SELECT * FROM agir_pays WHERE numSIREN_asso=?', [numSIREN_asso])
  var i, id
  var pays_action = new Array()

  for (i = 0; i < agir_pays.length; i++) {
    id = await pool.query('SELECT * FROM pays WHERE id_pays=?', [agir_pays[i].id_pays])
    pays_action[i] = id[0]
  }

  //Recuperation asso types
  const type_asso = await pool.query('SELECT * FROM asso_de_type WHERE numSIREN_asso=?', [numSIREN_asso])
  var type_association = new Array()

  for (i = 0; i < type_asso.length; i++) {
    id = await pool.query('SELECT * FROM type_association WHERE id_type_asso=?', [type_asso[i].id_type_asso])
    type_association[i] = id[0]
  }

  res.render('association/fiche', {association: association[0], pays: pays_action,type: type_association})
})



//Display associations search
router.post('/recherche', async (req, res) =>{
  var {recherche} = req.body
  const association_recherche = await pool.query("SELECT * FROM association WHERE lower(nom_asso) LIKE lower('%"+recherche+"%')")

  const association = await pool.query('SELECT * FROM association')
  const type_association = await pool.query('SELECT * FROM type_association')
  const arrondissement = await pool.query('SELECT DISTINCT arrondissement_asso FROM association WHERE arrondissement_asso is not null')
  const pays = await pool.query('SELECT * FROM pays')
  res.render('association/recherche', {association_recherche, association, recherche, type_association, arrondissement, pays})
})


//Display associations with association type criteria chosen
router.post('/criteres_type_association', async (req, res) =>{
  const criteres = req.body
  if(criteres === undefined){
    req.flash('message',"Vous n'avez coché aucun type d'association")
    res.redirect('/')
  }
  else{
    var array = Object.keys(criteres)
    var i
    var chaine =""
    for(i=0;i<array.length;i++){
      chaine=chaine+parseInt(array[i])
      if(i != array.length-1){
        chaine=chaine+","
      }
    }

    const recherche = await pool.query("SELECT * FROM asso_de_type WHERE id_type_asso in (?)", [chaine])

    chaine =""
    for(i=0;i<recherche.length;i++){
      chaine=chaine+parseInt(recherche[i].numSIREN_asso)
      if(i != array.length-1){
        chaine=chaine+","
      }
    }

    const association_recherche = await pool.query("SELECT * FROM association WHERE numSIREN_asso in (?)", [chaine])

    const association = await pool.query('SELECT * FROM association')
    const type_association = await pool.query('SELECT * FROM type_association')
    const arrondissement = await pool.query('SELECT DISTINCT arrondissement_asso FROM association WHERE arrondissement_asso is not null')
    const pays = await pool.query('SELECT * FROM pays')
    res.render('association/criteres_type_association', {association_recherche, association, type_association, arrondissement, pays})
  }
})

//Display associations with arrondissement criteria chosen
router.post('/criteres_arrondissement', async (req, res) =>{
  const criteres = req.body

  if(criteres === undefined){
    req.flash('message',"Vous n'avez coché aucun arrondissement")
    res.redirect('/')
  }
  else{
    var array = Object.keys(criteres)
    var i
    var chaine =""
    for(i=0;i<array.length;i++){
      chaine=chaine+parseInt(array[i])
      if(i != array.length-1){
        chaine=chaine+","
      }
    }

    const association_recherche = await pool.query("SELECT * FROM association WHERE arrondissement_asso in (?)", [chaine])

    const association = await pool.query('SELECT * FROM association')
    const type_association = await pool.query('SELECT * FROM type_association')
    const arrondissement = await pool.query('SELECT DISTINCT arrondissement_asso FROM association WHERE arrondissement_asso is not null')
    const pays = await pool.query('SELECT * FROM pays')
    res.render('association/criteres_arrondissement', {association_recherche, association, type_association, arrondissement, pays})
  }
})


//Display associations with action country criteria chosen
router.post('/criteres_pays', async (req, res) =>{
  const criteres = req.body
  console.log(criteres)
  if(criteres === undefined){
    req.flash('message',"Vous n'avez coché aucun pays d'action")
    res.redirect('/')
  }
  else{
    var array = Object.keys(criteres)
    var i
    var chaine =""
    for(i=0;i<array.length;i++){
      chaine=chaine+parseInt(array[i])
      if(i != array.length-1){
        chaine=chaine+","
      }
    }
    console.log(chaine)

    const recherche = await pool.query("SELECT DISTINCT numSIREN_asso FROM agir_pays WHERE id_pays in (?)", [chaine])
    console.log(recherche)

    chaine =""
    for(i=0;i<recherche.length;i++){
      chaine=chaine+parseInt(recherche[i].numSIREN_asso)
      if(i != array.length-1){
        chaine=chaine+","
      }
    }
    console.log(chaine)
    const association_recherche = await pool.query("SELECT DISTINCT * FROM association WHERE numSIREN_asso in (?)", [chaine])
    console.log(association_recherche)

    const association = await pool.query('SELECT * FROM association')
    const type_association = await pool.query('SELECT * FROM type_association')
    const arrondissement = await pool.query('SELECT DISTINCT arrondissement_asso FROM association WHERE arrondissement_asso is not null')
    const pays = await pool.query('SELECT * FROM pays')
    res.render('association/criteres_pays', {association_recherche, association, type_association, arrondissement, pays})
  }
})


module.exports = router
