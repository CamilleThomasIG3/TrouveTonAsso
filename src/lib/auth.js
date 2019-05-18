const pool = require('../database')


module.exports = {
  isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
      return next()
    }
    return res.redirect('/connexion')
  },

  isNotLoggedIn(req, res, next){
    if(!req.isAuthenticated()){
      return next()
    }
    return res.render('erreur/acces_interdit')
  },

  isAdmin(req, res, next) {
    if(global.variable_globale === 1 || global.variable_globale === 2){
      return next()
    }
    return res.redirect('/connexion_association')
  },

  isNotAdmin(req, res, next) {
    if(global.variable_globale === 0){
      return next()
    }
    return res.render('erreur/acces_interdit')
  },

  isSuperAdmin(req, res, next) {
    if(global.variable_globale === 2){
      return next()
    }
    return res.redirect('/association/connexion')
  },

  isNotSuperAdmin(req, res, next) {
    if(global.variable_globale === 0){
      return next()
    }
    return res.render('erreur/acces_interdit')
  },

  isGoodAsso(req, res, next) {
    const { numSIREN_asso } = req.params
    if(global.variable_globale === 1 && req.user.numSIREN_asso == numSIREN_asso){
      return next()
    }
    return res.render('erreur/acces_interdit')
  }
}
