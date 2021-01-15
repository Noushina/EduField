var db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { response } = require('express');
const { StudentIn } = require('./studentHelpers');
var objectId = require('mongodb').ObjectID;
const saltRounds = 10;
const myPlaintextPassword = '123';
const someOtherPlaintextPassword = 'not_bacon';

module.exports = {
     tutorIn: (tutorData) => {
          return new Promise(async (resolve, reject) => {
               let loginStatus = false;
               let response = {};
               let tutor = await db
                    .get()
                    .collection(collection.TUTOR_COLLECTION)
                    .findOne({ username: tutorData.username });

               if (tutor) {
                    let match = await db
                         .get()
                         .collection(collection.TUTOR_COLLECTION)
                         .findOne({ password: tutorData.password });
                    if (match) {
                         console.log('login success');
                         response.tutor = tutor;
                         response.status = true;
                         resolve(response);
                    } else {
                         console.log('loginfailed');
                         resolve({ status: false });
                    }
               } else {
                    console.log('login failed, user not found');
                    resolve({ status: false });
               }
          });
     },
     UpdateProfile: (profileData, callback) => {
          db.get()
               .collection(collection.TUTOR_PROFILE)
               .insertOne(profileData)
               .then((data) => {
                    callback(data.ops[0]._id);
               });
     },
     getProfile: () => {
          return new Promise(async (resolve, reject) => {
               let Profile = await db
                    .get()
                    .collection(collection.TUTOR_PROFILE)
                    .find()
                    .toArray();
               resolve(Profile);
          });
     },
     getProfileDetails: (ProfId) => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.TUTOR_PROFILE)
                    .findOne({ _id: objectId(ProfId) })
                    .then((Profile) => {
                         resolve(Profile);
                    });
          });
     },
     EditProfile: (profId, profileDetails) => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.TUTOR_PROFILE)
                    .updateOne(
                         { _id: objectId(profId) },
                         {
                              $set: {
                                   Name: profileDetails.Name,
                                   Subject: profileDetails.Subject,
                                   Mobile: profileDetails.Mobile,
                                   Email: profileDetails.Email,
                                   Institutions: profileDetails.Institutions,
                                   Years: profileDetails.Years,
                                   Description: profileDetails.Description,
                                   Courses: profileDetails.Courses,
                              },
                         }
                    )
                    .then((response) => {
                         resolve();
                    });
          });
     },
     AddStudents: (studentData) => {
          return new Promise(async (resolve, reject) => {
               studentData.Spassword = await bcrypt.hash(
                    studentData.Spassword,
                    10
               );

               db.get()
                    .collection(collection.STUDENT_COLLECTION)
                    .insertOne(studentData)
                    .then((data) => {
                         resolve(data.ops[0]._id);
                    });
          });
     },
     getStudents: () => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.STUDENT_COLLECTION)
                    .find()
                    .toArray()
                    .then((students) => {
                         resolve(students);
                    });
          });
     },
     getStudentDetails: (studentData) => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.STUDENT_COLLECTION)
                    .findOne({ _id: objectId(studentData) })
                    .then((student) => {
                         resolve(student);
                    });
          });
     },
     EditStudents: (student, studentData) => {
          return new Promise(async (resolve, reject) => {
               studentData.Spassword = await bcrypt.hash(
                    studentData.Spassword,
                    10
               );

               db.get()
                    .collection(collection.STUDENT_COLLECTION)
                    .updateOne(
                         { _id: objectId(student) },
                         {
                              $set: {
                                   Regno: studentData.Regno,
                                   Sname: studentData.Sname,
                                   Smobile: studentData.Smobile,
                                   Semail: studentData.Semail,
                                   gender: studentData.gender,
                                   Spassword: studentData.Spassword,
                                   Username: studentData.Username,
                                   Saddress: studentData.Saddress,
                              },
                         }
                    )
                    .then((response) => {
                         resolve();
                    });
          });
     },
     DeleteStudent: (studentId) => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.STUDENT_COLLECTION)
                    .removeOne({ _id: objectId(studentId) })
                    .then((response) => {
                         resolve(response);
                    });
          });
     },
     AddAssignment: (assignment, callback) => {
          let today = new Date();
          var d = today.getDate();
          var m = today.getMonth() + 1;
          var y = today.getFullYear();

          var dateString = d + '/' + m + '/' + y;
          let asgnmnt = {
               topic: assignment.topic,
               Date: assignment.Date,
               date: dateString,
          };
          db.get()
               .collection(collection.ASSIGNMENT_COLLECTION)
               .insertOne(asgnmnt)
               .then((data) => {
                    callback(data.ops[0]._id);
               });
     },
     getAssignment: () => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.ASSIGNMENT_COLLECTION)
                    .find()
                    .toArray()
                    .then((assignment) => {
                         resolve(assignment);
                    });
          });
     },
     deleteAssignment: (assignment) => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.ASSIGNMENT_COLLECTION)
                    .removeOne({ _id: objectId(assignment) })
                    .then((response) => {
                         resolve(response);
                    });
          });
     },
     getSubmittedAssignments: (studentId) => {
          return new Promise(async (resolve, reject) => {
               db.get()
                    .collection(collection.STUDENT_ASSIGNMENT_COLLECTION)
                    .find({ id: studentId })
                    .toArray()
                    .then((assignment) => {
                         resolve(assignment);
                    });
          });
     },
     getStudent: (id) => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.STUDENT_COLLECTION)
                    .findOne({ _id: objectId(id) })
                    .then((response) => {
                         resolve(response);
                    });
          });
     },
     SaveMark: (id, Mark) => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.STUDENT_ASSIGNMENT_COLLECTION)
                    .updateOne(
                         { _id: objectId(id) },
                         {
                              $set: {
                                   mark: Mark,
                              },
                         }
                    )
                    .then((data) => {
                         resolve(data);
                    });
          });
     },

     AddNotes: (notes, callback) => {
          let today = new Date();
          var d = today.getDate();
          var m = today.getMonth() + 1;
          var y = today.getFullYear();

          var dateString = d + '/' + m + '/' + y;
          let note = {
               topic: notes.topic,
               youtube: 'https://www.youtube.com/embed/' + notes.youtube,
               date: dateString,
          };
          db.get()
               .collection(collection.NOTE_COLLECTION)
               .insertOne(note)
               .then((data) => {
                    callback(data.ops[0]._id);
               });
     },
     dailyClass: () => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.NOTE_COLLECTION)
                    .find()
                    .toArray()
                    .then((note) => {
                         resolve(note);
                    });
          });
     },
     deleteNote: (note) => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.NOTE_COLLECTION)
                    .removeOne({ _id: objectId(note) })
                    .then((response) => {
                         resolve(response);
                    });
          });
     },
     AddAnnouncement: (data, callback) => {
          let today = new Date();
          var d = today.getDate();
          var m = today.getMonth() + 1;
          var y = today.getFullYear();

          var dateString = d + '/' + m + '/' + y;
          let announcement = {
               message: data.message,
               description: data.description,
               date: dateString,
          };
          db.get()
               .collection(collection.ANNOUNCEMENT_COLLECTION)
               .insertOne(announcement)
               .then((data) => {
                    callback(data.ops[0]._id);
               });
     },
     getAnnouncement: () => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.ANNOUNCEMENT_COLLECTION)
                    .find()
                    .toArray()
                    .then((announcement) => {
                         resolve(announcement);
                    });
          });
     },
     deleteAnnouncement: (id) => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.ANNOUNCEMENT_COLLECTION)
                    .removeOne({ _id: objectId(id) })
                    .then((response) => {
                         resolve(response);
                    });
          });
     },

     getAttendance: (id) => {
          return new Promise(async (resolve, reject) => {
               let present = await db
                    .get()
                    .collection(collection.STUDENT_COLLECTION)
                    .aggregate([
                         { $match: { _id: objectId(id) } },
                         {
                              $project: {
                                   attendance: '$attendance.date',
                              },
                         },
                    ])
                    .toArray();
               resolve(present[0].attendance);
          });
     },
     getAttendanceDetails: (date) => {
          return new Promise(async (resolve, reject) => {
               let days = await db
                    .get()
                    .collection(collection.STUDENT_COLLECTION)
                    .aggregate([
                         {
                              $project: {
                                   sname: '$Sname',
                                   regno: '$Regno',
                                   attendance: {
                                        $filter: {
                                             input: '$attendance',
                                             as: 'attendance',
                                             cond: {
                                                  $eq: [
                                                       '$$attendance.date',
                                                       date,
                                                  ],
                                             },
                                        },
                                   },
                              },
                         },
                    ])
                    .toArray();

               resolve(days);
          });
     },
     addEvents: (events) => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.EVENT_COLLECTION)
                    .insertOne(events)
                    .then((event) => {
                         resolve(event.ops[0]._id);
                    });
          });
     },
     getEvents: () => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.EVENT_COLLECTION)
                    .find()
                    .toArray()
                    .then((event) => {
                         resolve(event);
                    });
          });
     },
     deleteEvent: (eventId) => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.EVENT_COLLECTION)
                    .removeOne({ _id: objectId(eventId) })
                    .then((response) => {
                         resolve(response);
                    });
          });
     },
     addPhotos: (photos) => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.PHOTO_COLLECTION)
                    .insertOne(photos)
                    .then((Photo) => {
                         resolve(Photo.ops[0]._id);
                    });
          });
     },
     getPhotos: () => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.PHOTO_COLLECTION)
                    .find()
                    .toArray()
                    .then((photo) => {
                         resolve(photo);
                    });
          });
     },
     eventRegistery: (id) => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.EVENT_REGISTRY)
                    .find({ eventId: id })
                    .toArray()
                    .then((event) => {
                         resolve(event);
                    });
          });
     },
};
