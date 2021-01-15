var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var logger = require('morgan');
var hbs=require('express-handlebars')
var studentRouter = require('./routes/student');
var tutorRouter = require('./routes/tutor');
var db=require('./config/connection')
var fileUpload=require('express-fileupload')
var session=require('express-session')
const MongoStore = require('connect-mongo')(session);
const MongoClient=require('mongodb').MongoClient
const swtal=require('sweetalert')
var cors = require('cors')




var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
//template engin
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',
partialsDir:__dirname+'/views/partials/'}));

app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret:'key',
  cookie:{maxAge:6000000},
  store: new MongoStore({
     url:'mongodb://localhost:27017',
     dbName:'My-class'
  }

  )
  
}));
app.use(fileUpload());
app.use(cors())




db.connect((err)=>{
  if (err)
  console.log('Connection Error'+err);
  else
  console.log('Database Connected Port 27017');
})

app.use('/', studentRouter);
app.use('/tutor', tutorRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
