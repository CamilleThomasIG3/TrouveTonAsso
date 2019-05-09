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
    return res.redirect('/profil')
  }
}
