const { Router, response } = require('express');
var express = require('express');
var router = express.Router();
const session = require('express-session');
var tutorHelpers = require('../helpers/tutorHelpers');
var studentHelpers = require('../helpers/studentHelpers');
const verifyLogin = (req, res, next) => {
     console.log(req.session.otpIn);
     if (req.session.studentLoggedIn) {
          next();
     } else if (req.session.otpIn) {
          next();
     } else {
          res.redirect('/Login');
     }
};

/* GET home page. */
router.get('/', function (req, res, next) {
     res.render('home');
});

router.get('/studentIn', verifyLogin, async (req, res) => {
     Student = req.session.student;
     otp = req.session.Student;

     let students = await studentHelpers.getStudents(req.session.student._id);
     let announcement = await tutorHelpers.getAnnouncement();
     let events = await tutorHelpers.getEvents();
     let assignmentCount = await studentHelpers.getAssignmentCount();
     console.log(assignmentCount);

     let Present = await studentHelpers.getAttendanceStatus(
          req.session.student._id
     );
     res.render('student/studentIn', {
          student: true,
          Student,
          students,
          announcement,
          Present,
          events,
          assignmentCount,
     });
});

router.get('/Login', (req, res) => {
     if (req.session.student) {
          res.redirect('/studentIn');
     } else {
          res.render('student/Login', {
               studentLogginErr: req.session.studentLogginErr,
          });
          req.session.studentLogginErr = false;
     }
});

router.post('/Login', (req, res) => {
     studentHelpers.StudentIn(req.body).then((response) => {
          if (response.status) {
               req.session.student = response.student;
               req.session.studentLoggedIn = true;
               res.redirect('/studentIn');
          } else {
               req.session.studentLogginErr = 'Invalid username or password';
               res.redirect('/Login');
          }
     });
});

router.get('/logout', (req, res) => {
     req.session.student = null;
     req.session.studentLoggedIn = false;
     req.session.otpIn = false;
     res.redirect('/');
});

router.get('/sendOtp', (req, res) => {
     if (req.session.student) {
          res.redirect('/studentIn');
     } else {
          res.render('student/sendOtp');
     }
});

router.get('/verify', (req, res) => {
     if (req.session.student) {
          res.redirect('/studentIn');
     } else {
          res.render('student/verify');
     }
});

router.post('/send-otp', (req, res) => {
     req.session.studentnum = req.body.mobile;
     studentHelpers.SendOtp(req.body.mobile).then((response) => {
          if (response.otp) {
               req.session.otpId = response.otp.otp_id;
               console.log(req.session.otpId);
               req.session.Student = response.Student;
               res.json(response);
          } else {
               res.json(response);
          }
     });
});

router.post('/verify-otp', (req, res) => {
     studentHelpers
          .VerifyOtp(req.body, req.session.otpId, req.session.Student)
          .then((response) => {
               if (response.otpVerified.status == 'success') {
                    req.session.otpIn = true;
                    req.session.student = response.Student;
               }
               res.json({ status: true });
          });
});
router.get('/Assignments', verifyLogin, async (req, res) => {
     Student = req.session.student;
     otp = req.session.Student;

     let assignment = await tutorHelpers.getAssignment();
     let students = await studentHelpers.getStudents(req.session.student._id);
     let Present = await studentHelpers.getAttendanceStatus(
          req.session.student._id
     );

     res.render('student/Assignments', {
          student: true,
          Student,
          students,
          Present,
          assignment,
     });
});

router.get('/SubmitAssignments', verifyLogin, async (req, res) => {
     Student = req.session.student;
     let students = await studentHelpers.getStudents(req.session.student._id);
     let Present = await studentHelpers.getAttendanceStatus(
          req.session.student._id
     );

     res.render('student/SubmitAssignments', {
          student: true,
          Student,
          students,
          Present,
     });
});

router.post('/SubmitAssignments', (req, res) => {
     studentHelpers.SubmitAssignment(
          req.body,
          req.session.student._id,
          (id) => {
               if (req.files.pdf) {
                    let pdf = req.files.pdf;

                    pdf.mv(
                         './public/Submitted-Assignments/' + id + '.pdf',
                         (err, done) => {
                              if (!err) {
                                   res.redirect('/Assignments');
                              } else {
                              }
                         }
                    );
               } else {
                    res.redirect('/Assignments');
               }
          }
     );
});

router.get('/Notes', verifyLogin, async (req, res) => {
     Student = req.session.student;
     let notes = await studentHelpers.getNotes();
     let students = await studentHelpers.getStudents(req.session.student._id);
     let Present = await studentHelpers.getAttendanceStatus(
          req.session.student._id
     );

     res.render('student/Notes', {
          student: true,
          Student,
          students,
          Present,
          notes,
     });
});

router.get('/Daily-task', verifyLogin, async (req, res) => {
     Student = req.session.student;
     let DailyTask = await studentHelpers.getDailyTask();
     let DailyAssignments = await studentHelpers.getDailyAssignment();
     let students = await studentHelpers.getStudents(req.session.student._id);
     let Present = await studentHelpers.getAttendanceStatus(
          req.session.student._id
     );

     res.render('student/Daily-task', {
          student: true,
          Student,
          students,
          DailyTask,
          Present,
          DailyAssignments,
     });
});

router.post('/registerAttendance', (req, res) => {
     Student = req.session.student;
     studentHelpers
          .registerAttendence(req.body, req.session.student)
          .then((response) => {
               res.json(response);
          });
});

router.get('/Announcement', async (req, res) => {
     Student = req.session.student;
     let announcement = await tutorHelpers.getAnnouncement();
     let students = await studentHelpers.getStudents(req.session.student._id);
     let Present = await studentHelpers.getAttendanceStatus(
          req.session.student._id
     );

     res.render('student/Announcement', {
          student: true,
          Student,
          students,
          Present,
          announcement,
     });
});

router.get('/AnnouncementDetails', async (req, res) => {
     Student = req.session.student;
     let announcement = await tutorHelpers.getAnnouncement();
     let students = await studentHelpers.getStudents(req.session.student._id);
     let Present = await studentHelpers.getAttendanceStatus(
          req.session.student._id
     );

     res.render('student/AnnouncementDetails', {
          student: true,
          Student,
          students,
          Present,
          announcement,
     });
});
router.get('/Attendance', async (req, res) => {
     Student = req.session.student;
     let students = await studentHelpers.getStudents(req.session.student._id);
     let Present = await studentHelpers.getAttendanceStatus(
          req.session.student._id
     );
     let attendance = req.session.attendance;

     res.render('student/Attendance', {
          student: true,
          Student,
          students,
          Present,
          attendance,
     });
});
router.post('/Attendance', (req, res) => {
     let date = req.body.date;
     Student = req.session.student;

     studentHelpers.getAttendance(date, Student).then((response) => {
          req.session.attendance = response;
          res.json(response);
     });
});
router.get('/Profile', async (req, res) => {
     Student = req.session.student;
     let Present = await studentHelpers.getAttendanceStatus(
          req.session.student._id
     );

     let students = await studentHelpers.getStudents(req.session.student._id);
     res.render('student/Profile', {
          student: true,
          Student,
          Present,
          students,
     });
});
router.get('/EventDetails/:id', verifyLogin, async (req, res) => {
     Student = req.session.student;
     let students = await studentHelpers.getStudents(req.session.student._id);
     let Present = await studentHelpers.getAttendanceStatus(
          req.session.student._id
     );

     let events = await studentHelpers.getEvents(req.params.id);

     res.render('student/EventDetails', {
          student: true,
          Student,
          students,
          Present,
          events,
     });
});

router.get('/RegisterEvents/:id', verifyLogin, async (req, res) => {
     Student = req.session.student;
     let students = await studentHelpers.getStudents(req.session.student._id);
     let events = await studentHelpers.getEvents(req.params.id);
     let Present = await studentHelpers.getAttendanceStatus(
          req.session.student._id
     );

     res.render('student/RegisterEvents', {
          student: true,
          Student,
          Present,
          students,
          events,
     });
});

router.post('/RegisterEvents', async (req, res) => {
     let events = await studentHelpers.getEvents(req.body.eventId);
     req.session.amount = events.amount;
     studentHelpers.registerEvents(req.body).then((registerId) => {
          if (events['amount'] === '0') {
               res.json({ freeEvent: true });
          } else {
               if (req.body['paymentmode'] === 'razorpay') {
                    console.log('hghjgfjhfdxgvjhgkhgsdh');
                    studentHelpers
                         .generateRazorpay(registerId, events.amount)
                         .then((response) => {
                              res.json(response);
                         });
               } else if (req.body['paymentmode'] === 'paypal') {
                    studentHelpers
                         .generatePaypal(events.amount)
                         .then((response) => {
                              res.json(response);
                         });
               }
          }
     });
});

router.post('/verify-payment', (req, res) => {
     studentHelpers
          .verifyPayments(req.body)
          .then(() => {
               studentHelpers
                    .changePaymentStatus(req.body.order.receipt)
                    .then(() => {
                         res.json({ status: true });
                    });
          })
          .catch((err) => {
               console.log(err);
               res.json({ status: false, errMsg: '' });
          });
});

router.get('/success', verifyLogin, async (req, res) => {
     Student = req.session.student;
     let amount = req.session.amount;
     const payerId = req.query.PayerID;
     const paymentId = req.query.paymentId;
     studentHelpers
          .exicutePaypalPayment(payerId, paymentId, amount)
          .then(() => {});
     let students = await studentHelpers.getStudents(req.session.student._id);
     res.render('student/success', { student: true, Student, students });
});
router.get('/cancel', verifyLogin, async (req, res) => {
     Student = req.session.student;
     let students = await studentHelpers.getStudents(req.session.student._id);
     res.render('student/success', { student: true, Student, students });
});

router.get('/gallary', verifyLogin, async (req, res) => {
     Student = req.session.student;
     let students = await studentHelpers.getStudents(req.session.student._id);
     let Photos = await tutorHelpers.getPhotos();
     let Present = await studentHelpers.getAttendanceStatus(
          req.session.student._id
     );

     res.render('student/gallary', {
          student: true,
          Student,
          Present,
          students,
          Photos,
     });
});

module.exports = router;
