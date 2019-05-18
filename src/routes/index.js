const express = require('express')
const router = express.Router()
var mailer = require('nodemailer')

var smtpTransport = mailer.createTransport("SMTP", {
  service: "Gmail",
  auth:{
    user: "trouve.ton.asso.projet.2019@gmail.com",
    pass: "trouvetonasso12"
  }
})

const pool = require('../database')
const { isLoggedIn, isNotLoggedIn, isNotAdmin} = require('../lib/auth')

router.get('/', isNotAdmin, async (req, res) =>{
  const association = await pool.query('SELECT * FROM association')
  const type_association = await pool.query('SELECT * FROM type_association')
  const arrondissement = await pool.query('SELECT DISTINCT arrondissement_asso FROM association WHERE arrondissement_asso is not null')
  const pays = await pool.query('SELECT * FROM pays')
  res.render('index', {association, type_association, arrondissement, pays})
})

router.get('/a_propos', isNotAdmin, (req,res)=>{
  res.render('a_propos')
})

//Display view "fiche association"
router.get('/fiche/:numSIREN_asso', isNotAdmin, async (req, res)=> {
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


router.get('/adherer/:numSIREN_asso/:email_personne', isLoggedIn, isNotAdmin, async (req,res)=>{
  const { numSIREN_asso, email_personne } = req.params

  const association = await pool.query('SELECT * FROM association WHERE numSIREN_asso=?', [numSIREN_asso])
  const personne = await pool.query('SELECT * FROM personne WHERE email_personne=?', [email_personne])

  var mail = {
    from: "trouve.ton.asso.projet.2019@gmail.com",
    to: ""+association[0].email_asso,
    subject: "[Trouve Ton Asso] Demande d'adhésion",
    html: "Bonjour "+association[0].nom_asso+",\n"+personne[0].prenom_personne+" "+personne[0].nom_personne
    +" souhaite adhérer à votre association. \nVoici son email afin que vous puissiez échanger : "+personne[0].email_personne
  }

  smtpTransport.sendMail(mail, function(error, response){
    if(error){
      console.log(error);
    }else {
      console.log("Email envoyé")
    }
    smtpTransport.close()
  })

  req.flash('success', "Votre demande d'adhésion a été envoyée, l'association vous contactera par email")
  res.redirect('/')
})

//send an email
router.post('/envoie_email', isNotAdmin, async (req,res)=>{
  const { objet, message, email_personne } = req.body

  var mail = {
    from: "trouve.ton.asso.projet.2019@gmail.com",
    to: "trouve.ton.asso.projet.2019@gmail.com",
    subject: "[Trouve Ton Asso] Remarques/questions : "+objet,
    html: "Remarque/question de : "+email_personne+".\n"+message
  }

  smtpTransport.sendMail(mail, function(error, response){
    if(error){
      console.log(error);
    }else {
      console.log("Email envoyé")
    }
    smtpTransport.close()
  })

  req.flash('success', "Votre remarque/question a été envoyée, si nécessaire Trouve Ton Asso vous contactera par email")
  res.redirect('/')
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
router.post('/criteres_type_association', isNotAdmin, async (req, res) =>{
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
router.post('/criteres_arrondissement', isNotAdmin, async (req, res) =>{
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
router.post('/criteres_pays', isNotAdmin, async (req, res) =>{
  const criteres = req.body

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

    const recherche = await pool.query("SELECT DISTINCT numSIREN_asso FROM agir_pays WHERE id_pays in (?)", [chaine])

    var association_recherche = []
    var tmp

    for(i=0;i<recherche.length;i++){
      tmp = await pool.query("SELECT * FROM association WHERE numSIREN_asso=?", [recherche[i].numSIREN_asso])
      association_recherche[i] = tmp[0]
    }

    const association = await pool.query('SELECT * FROM association')
    const type_association = await pool.query('SELECT * FROM type_association')
    const arrondissement = await pool.query('SELECT DISTINCT arrondissement_asso FROM association WHERE arrondissement_asso is not null')
    const pays = await pool.query('SELECT * FROM pays')
    res.render('association/criteres_pays', {association_recherche, association, type_association, arrondissement, pays})
  }
})

module.exports = router
