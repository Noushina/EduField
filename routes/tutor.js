const { Router, response } = require('express');
var express = require('express');
var router = express.Router();
const session = require('express-session');
var tutorHelpers=require('../helpers/tutorHelpers')
const verifyLogin = (req, res, next) => {
  if (req.session.tutorLoggedIn) {
    next()
  } else {
    res.redirect('/tutor/tutor-login')
  }
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  

  res.render('home',{tutor:true});
});


router.get('/tutorIn',verifyLogin,(req,res)=>{
  let Tutor=req.session.tutor
  res.render('tutor/tutorIn',{tutor:true,Tutor})
})



router.get('/tutor-login',(req,res)=>{
  if (req.session.tutor) {
    res.redirect('/tutor/tutorIn')
  } else {

    res.render('tutor/tutor-login', { tutor: true, 'tutorLogginErr': req.session.tutorLogginErr})
    req.session.tutorLogginErr = false
  }

})
router.post('/tutor-login',(req,res)=>{
  console.log(req.body);
  tutorHelpers.tutorIn(req.body).then((response)=>{
    if(response.status){
      req.session.tutor = response.tutor
      req.session.tutorLoggedIn = true

      res.redirect('/tutor/tutorIn')
    }else{
      req.session.tutorLogginErr = 'Invalid username or password'
      res.redirect('/tutor/tutor-login')
    }
    
  })

})
router.get('/tutor-logout',(req,res)=>{
  req.session.tutor = null
  req.session.tutorLoggedIn = false
  res.redirect('/')
})

module.exports = router;
