const { Router, response } = require('express');
var express = require('express');
var router = express.Router();
const session = require('express-session');
var tutorHelpers = require('../helpers/tutorHelpers');
var studentHelpers = require('../helpers/studentHelpers');

const verifyLogin = (req, res, next) => {
     if (req.session.tutorLoggedIn) {
          next();
     } else {
          res.redirect('/tutor/Login');
     }
};

/* GET users listing. */
router.get('/', function (req, res, next) {
     res.render('home', { tutor: true, Tutor });
});

router.get('/tutorIn', verifyLogin, async (req, res) => {
     let Tutor = req.session.tutor;
     let announcement = await tutorHelpers.getAnnouncement();
     let events = await tutorHelpers.getEvents();
     tutorHelpers.getProfile().then((Profile) => {
          res.render('tutor/tutorIn', {
               tutor: true,
               Tutor,
               Profile,
               announcement,
               events,
          });
     });
});

router.get('/Login', (req, res) => {
     if (req.session.tutor) {
          res.redirect('/tutor/tutorIn');
     } else {
          res.render('tutor/Login', {
               tutor: true,
               tutorLogginErr: req.session.tutorLogginErr,
          });
          req.session.tutorLogginErr = false;
     }
});

router.post('/Login', (req, res) => {
     tutorHelpers.tutorIn(req.body).then((response) => {
          if (response.status) {
               req.session.tutor = response.tutor;
               req.session.tutorLoggedIn = true;

               res.redirect('/tutor/tutorIn');
          } else {
               req.session.tutorLogginErr = 'Invalid username or password';
               res.redirect('/tutor/Login');
          }
     });
});

router.get('/logout', (req, res) => {
     req.session.tutor = null;
     req.session.tutorLoggedIn = false;
     res.redirect('/');
});

router.get('/Profile', verifyLogin, (req, res) => {
     let Tutor = req.session.tutor;
     tutorHelpers.getProfile().then((Profile) => {
          res.render('tutor/Profile', { tutor: true, Tutor, Profile });
     });
});

router.get('/UpdateProfile', verifyLogin, (req, res) => {
     let Tutor = req.session.tutor;

     res.render('tutor/UpdateProfile', { tutor: true, Tutor });
});
router.post('/UpdateProfile', verifyLogin, (req, res) => {
     tutorHelpers.UpdateProfile(req.body, (id) => {
          let image = req.files.image;
          if (image) {
               image.mv('./public/Profile-Pic/' + id + '.jpg', (err, done) => {
                    if (!err) {
                         res.redirect('/tutor/Profile');
                    } else {
                    }
               });
          } else {
               res.redirect('/tutor/Profile');
          }
     });
});

router.get('/EditProfile/:id', verifyLogin, async (req, res) => {
     let Profile = await tutorHelpers.getProfile();
     let Tutor = req.session.tutor;
     let ProfileDetails = await tutorHelpers.getProfileDetails(req.params.id);

     res.render('tutor/EditProfile', {
          tutor: true,
          Tutor,
          Profile,
          ProfileDetails,
     });
});

router.post('/EditProfile/:id', verifyLogin, (req, res) => {
     tutorHelpers.EditProfile(req.params.id, req.body).then(() => {
          res.redirect('/tutor/Profile');
          if (req.files.image) {
               let image = req.files.image;
               let id = req.params.id;
               image.mv('./public/Profile-Pic/' + id + '.jpg');
          }
     });
});

router.get('/StudentList', verifyLogin, async (req, res) => {
     let Profile = await tutorHelpers.getProfile();
     let Tutor = req.session.tutor;
     let students = await tutorHelpers.getStudents();
     res.render('tutor/StudentList', { tutor: true, Tutor, Profile, students });
});

router.get('/AddStudents', verifyLogin, async (req, res) => {
     let Profile = await tutorHelpers.getProfile();
     let Tutor = req.session.tutor;
     res.render('tutor/AddStudents', { tutor: true, Profile, Tutor });
});

router.post('/AddStudents', (req, res) => {
     tutorHelpers.AddStudents(req.body).then((id) => {
          if (req.files.img) {
               let image = req.files.img;

               image.mv('./public/Student-Pic/' + id + '.jpg');
          }
          res.json(response);
     });
});

router.get('/EditStudent/:id', verifyLogin, async (req, res) => {
     let Profile = await tutorHelpers.getProfile();
     let Tutor = req.session.tutor;
     let student = await tutorHelpers.getStudentDetails(req.params.id);
     res.render('tutor/EditStudent', { tutor: true, Tutor, Profile, student });
});

router.post('/EditStudent/:id', (req, res) => {
     tutorHelpers.EditStudents(req.params.id, req.body).then(() => {
          if (req.files.image) {
               let image = req.files.image;

               image.mv('./public/Student-Pic/' + id + '.jpg');
          }
          res.redirect('/tutor/StudentList');
     });
});

router.get('/DeleteStudent/:id', (req, res) => {
     tutorHelpers.DeleteStudent(req.params.id).then((response) => {
          res.redirect('/tutor/StudentList');
     });
});

router.get('/Assignment', verifyLogin, async (req, res) => {
     let Profile = await tutorHelpers.getProfile();
     let Tutor = req.session.tutor;
     let assignment = await tutorHelpers.getAssignment();
     res.render('tutor/Assignment', {
          tutor: true,
          Tutor,
          Profile,
          assignment,
     });
});

router.get('/AddAssignment', verifyLogin, async (req, res) => {
     let Profile = await tutorHelpers.getProfile();
     let Tutor = req.session.tutor;

     res.render('tutor/AddAssignment', { tutor: true, Tutor, Profile });
});

router.post('/AddAssignment', (req, res) => {
     tutorHelpers.AddAssignment(req.body, (id) => {
          if (req.files.pdf) {
               let pdf = req.files.pdf;

               pdf.mv('./public/Assignments/' + id + '.pdf', (err, done) => {
                    if (!err) {
                         res.redirect('/tutor/Assignment');
                    } else {
                    }
               });
          } else {
               res.redirect('/tutor/');
          }
     });
});

router.get('/deleteAssignment/:id', (req, res) => {
     tutorHelpers.deleteAssignment(req.params.id).then(() => {
          res.redirect('/tutor/Assignment');
     });
});

router.get('/StudentDetails/:id', verifyLogin, async (req, res) => {
     let Profile = await tutorHelpers.getProfile();
     let Tutor = req.session.tutor;
     let student = await tutorHelpers.getStudent(req.params.id);
     let assignmentSubmitted = await tutorHelpers.getSubmittedAssignments(
          req.params.id
     );
     let attendance = await tutorHelpers.getAttendance(req.params.id);
     res.render('tutor/StudentDetails', {
          tutor: true,
          Tutor,
          Profile,
          student,
          assignmentSubmitted,
          attendance,
     });
});

router.post('/AttendanceDetails', (req, res) => {
     let date = req.body.date;
     tutorHelpers.getAttendanceDetails(req.body.date).then((response) => {
          req.session.attendanceDetails = response;
          req.session.date = date;
          res.json(response);
     });
});

router.post('/SaveMark/:id', (req, res) => {
     tutorHelpers.SaveMark(req.params.id, req.body).then((response) => {
          res.redirect('/tutor/StudentList');
     });
});

router.get('/Notes', verifyLogin, async (req, res) => {
     let Profile = await tutorHelpers.getProfile();
     let Tutor = req.session.tutor;
     let dailyClass = await tutorHelpers.dailyClass();
     res.render('tutor/Notes', { tutor: true, Tutor, Profile, dailyClass });
});

router.get('/AddNotes', verifyLogin, async (req, res) => {
     let Profile = await tutorHelpers.getProfile();
     let Tutor = req.session.tutor;
     res.render('tutor/AddNotes', { tutor: true, Tutor, Profile });
});

router.post('/AddNotes', (req, res) => {
     tutorHelpers.AddNotes(req.body, (id) => {
          if (req.files.pdf && req.files.video) {
               let pdf = req.files.pdf;
               let video = req.files.video;

               pdf.mv('./public/Notes/' + id + '.pdf', (err, done) => {
                    if (!err) {
                    }
               });
               video.mv('./public/Class/' + id + '.mp4', (err, done) => {
                    if (!err) {
                    }
               });
               res.redirect('/tutor/Notes');
          }
     });
});

router.get('/deleteNote/:id', (req, res) => {
     tutorHelpers.deleteNote(req.params.id).then(() => {
          res.json();
     });
});

router.get('/Attendance', verifyLogin, async (req, res) => {
     let Profile = await tutorHelpers.getProfile();
     let Tutor = req.session.tutor;
     let student = await tutorHelpers.getStudents();
     let attendance = req.session.attendanceDetails;
     let date = req.session.date;

     res.render('tutor/Attendance', {
          tutor: true,
          Tutor,
          Profile,
          student,
          attendance,
          date,
     });
});

router.get('/Announcement', verifyLogin, async (req, res) => {
     let Profile = await tutorHelpers.getProfile();
     let Tutor = req.session.tutor;
     let announcement = await tutorHelpers.getAnnouncement();
     res.render('tutor/Announcement', {
          tutor: true,
          Tutor,
          Profile,
          announcement,
     });
});

router.post('/Announcement', (req, res) => {
     tutorHelpers.AddAnnouncement(req.body, (id) => {
          if ((req.files.pdf, req.files.image && req.files.video)) {
               let pdf = req.files.pdf;
               let video = req.files.video;
               let image = req.files.image;

               pdf.mv('./public/Announcement/' + id + '.pdf', (err, done) => {
                    if (!err) {
                    }
               });

               image.mv('./public/Announcement/' + id + '.jpg', (err, done) => {
                    if (!err) {
                    }
               });
               video.mv('./public/Announcement/' + id + '.mp4', (err, done) => {
                    if (!err) {
                    }
               });
               res.redirect('/tutor/Announcement');
          }
     });
});

router.get('/deleteAnnouncement/:id', (req, res) => {
     console.log(req.params.id);
     tutorHelpers.deleteAnnouncement(req.params.id).then(() => {
          res.redirect('/tutor/Announcement');
     });
});

router.get('/AddEvents', async (req, res) => {
     let Profile = await tutorHelpers.getProfile();
     let Tutor = req.session.tutor;
     res.render('tutor/AddEvents', { tutor: true, Tutor, Profile });
});

router.post('/AddEvents', (req, res) => {
     tutorHelpers.addEvents(req.body).then((id) => {
          if (req.files === null) {
               res.json();
          } else {
               let video = req.files.video;
               let image = req.files.image;
               if (image && video) {
                    image.mv('./public/events/' + id + '.jpg', (err, done) => {
                         if (!err) {
                         }
                    });
                    video.mv('./public/events/' + id + '.mp4', (err, done) => {
                         if (!err) {
                         }
                    });
               } else if (!video) {
                    image.mv('./public/events/' + id + '.jpg', (err, done) => {
                         if (!err) {
                         }
                    });
               } else if (!image) {
                    video.mv('./public/events/' + id + '.mp4', (err, done) => {
                         if (!err) {
                         }
                    });
               }
               res.json();
          }
     });
});

router.get('/Events/:id', verifyLogin, async (req, res) => {
     let Profile = await tutorHelpers.getProfile();
     let Tutor = req.session.tutor;

     let events = await studentHelpers.getEvents(req.params.id);

     res.render('tutor/Events', { tutor: true, Tutor, Profile, events });
});

router.get('/deleteEvents/:id', (req, res) => {
     tutorHelpers.deleteEvent(req.params.id).then(() => {
          res.redirect('/tutor/tutorIn');
     });
});

router.get('/gallary', async (req, res) => {
     let Profile = await tutorHelpers.getProfile();
     let Tutor = req.session.tutor;
     res.render('tutor/gallary', { tutor: true, Tutor, Profile });
});

router.post('/gallary', (req, res) => {
     let image = req.files.image;
     tutorHelpers.addPhotos(req.body).then((id) => {
          if (image) {
               image.mv('./public/gallary/' + id + '.jpg', (err, done) => {
                    if (!err) {
                         res.redirect('/tutor/tutorIn');
                    }
               });
          }
     });
});

router.get('/eventRegistery/:id', verifyLogin, async (req, res) => {
     let Profile = await tutorHelpers.getProfile();
     let Tutor = req.session.tutor;
     let eventRegistery = await tutorHelpers.eventRegistery(req.params.id);
     res.render('tutor/eventRegistery', {
          tutor: true,
          Tutor,
          Profile,
          eventRegistery,
     });
});

module.exports = router;
