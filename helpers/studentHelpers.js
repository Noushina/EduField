var db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { response } = require('express');
var objectId = require('mongodb').ObjectID;
var unirest = require('unirest');
const Razorpay = require('razorpay');
const paypal = require('paypal-rest-sdk');
const { count } = require('console');
const e = require('express');

paypal.configure({
     mode: 'sandbox', //sandbox or live
     client_id:
          'ARrOvgL6Fd_cQy2UVZDTfkUGrbaJ_Wud7ajc-NrHkT0JjK8fAQZSxIe9GRAJj9izVD5hbXP5osgiMpw4',
     client_secret:
          'EHUjgNrzd4EZHR5Utrkh47WwZJA3dNOp_FWXBK2gRrK1z7SM3KmrONtvFiwBr4tmp6Nit1zh71tFOanR',
});

var instance = new Razorpay({
     key_id: 'rzp_test_b2dNXEyx10vuZV',
     key_secret: '8i7SXoD78sPpykPkf9yK3Adf',
});

module.exports = {
     StudentIn: (studentData) => {
          return new Promise(async (resolve, reject) => {
               let loginStatus = false;
               let response = {};

               let student = await db
                    .get()
                    .collection(collection.STUDENT_COLLECTION)
                    .findOne({ Username: studentData.username });
               if (student) {
                    bcrypt
                         .compare(studentData.password, student.Spassword)
                         .then((status) => {
                              if (status) {
                                   console.log('login success');
                                   response.student = student;
                                   response.status = true;
                                   resolve(response);
                              } else {
                                   console.log('loginfailed');
                                   resolve({ status: false });
                              }
                         });
               } else {
                    console.log('login failed, user not found');
                    resolve({ status: false });
               }
          });
     },
     SendOtp: (mobile) => {
          return new Promise(async (resolve, reject) => {
               console.log('here2');
               let otpStatus = false;
               let response = {};
               let student = await db
                    .get()
                    .collection(collection.STUDENT_COLLECTION)
                    .findOne({ Smobile: mobile });
               console.log('here4');
               if (student) {
                    var req = unirest(
                         'POST',
                         'https://d7networks.com/api/verifier/send'
                    )
                         .headers({
                              Authorization:
                                   'Token b749fa0c82c936e7475041816233a717f0b2f3b8 ',
                         })
                         .field('mobile', '91' + mobile)
                         .field('sender_id', 'SMSINFO')
                         .field('message', 'Your otp code is {code}')
                         .field('expiry', '900')
                         .end(function (res) {
                              if (res.status) {
                                   (response.otp = res.body),
                                        (response.Student = student);
                                   resolve(response);
                              } else {
                                   resolve({ status: false });
                              }
                         });
               } else {
                    resolve({ status: false });
               }
          });
     },
     VerifyOtp: (otp, otp_id, student) => {
          return new Promise((resolve, reject) => {
               let response = {};

               var req = unirest(
                    'POST',
                    'https://d7networks.com/api/verifier/verify'
               )
                    .headers({
                         Authorization:
                              'Token b749fa0c82c936e7475041816233a717f0b2f3b8',
                    })
                    .field('otp_id', otp_id)
                    .field('otp_code', otp.otp)
                    .end(function (res) {
                         if (res.status) {
                              (response.otpVerified = res.body),
                                   (response.Student = student);
                              console.log(response.otpVerified);
                              resolve(response);
                         }
                    });
          });
     },
     SubmitAssignment: (assignment, id, callback) => {
          let today = new Date();
          var d = today.getDate();
          var m = today.getMonth() + 1;
          var y = today.getFullYear();
          var dateString = d + '/' + m + '/' + y;

          let assignmentId = {
               id: id,
               topic: assignment.topic,
               date: dateString,
          };
          db.get()
               .collection(collection.STUDENT_ASSIGNMENT_COLLECTION)
               .insertOne(assignmentId)
               .then((data) => {
                    callback(data.ops[0]._id);
               });
     },
     getNotes: () => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.NOTE_COLLECTION)
                    .find()
                    .toArray()
                    .then((notes) => {
                         resolve(notes);
                    });
          });
     },
     getDailyTask: () => {
          return new Promise((resolve, reject) => {
               let today = new Date();

               var d = today.getDate();
               var m = today.getMonth() + 1;
               var y = today.getFullYear();

               var dateString = d + '/' + m + '/' + y;
               db.get()
                    .collection(collection.NOTE_COLLECTION)
                    .findOne({ date: dateString })
                    .then((task) => {
                         resolve(task);
                    });
          });
     },
     getDailyAssignment: () => {
          return new Promise((resolve, reject) => {
               let today = new Date();
               var d = today.getDate();
               var m = today.getMonth() + 1;
               var y = today.getFullYear();

               var dateString = d + '/' + m + '/' + y;
               db.get()
                    .collection(collection.ASSIGNMENT_COLLECTION)
                    .findOne({ date: dateString })
                    .then((assignment) => {
                         resolve(assignment);
                    });
          });
     },
     getStudentsProfile: () => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.STUDENT_REGISTER)
                    .findOne()
                    .then((response) => {
                         resolve(response);
                    });
          });
     },
     getStudents: (student) => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.STUDENT_COLLECTION)
                    .find({ _id: objectId(student) })
                    .toArray()
                    .then((response) => {
                         resolve(response);
                    });
          });
     },
     studentByOtp: (student) => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.STUDENT_COLLECTION)
                    .find({ Smobile: student })
                    .toArray()
                    .then((response) => {
                         resolve(response);
                    });
          });
     },
     registerAttendence: (present, student) => {
          return new Promise(async (resolve, reject) => {
               let today = new Date();
               var d = today.getDate();
               var m = today.getMonth() + 1;
               const monthNames = [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
               ];
               var month = monthNames[today.getMonth()];
               var y = today.getFullYear();
               var dateString = d + '/' + m + '/' + y;
               var Month = month + ' ' + y;

               let att = {
                    attendance: present.attendance,
                    date: dateString,
                    month: Month,
               };
               let Student = await db
                    .get()
                    .collection(collection.STUDENT_COLLECTION)
                    .findOne({
                         _id: objectId(student._id),
                         'attendance.date': dateString,
                    });
               console.log('hhhhhh' + Student);
               if (!Student) {
                    db.get()
                         .collection(collection.STUDENT_COLLECTION)
                         .updateOne(
                              { _id: objectId(student._id) },
                              {
                                   $push: {
                                        attendance: att,
                                   },
                              }
                         )
                         .then((response) => {
                              resolve(response);
                         });
               }
          });
     },
     getAttendance: (date, studentId) => {
          return new Promise(async (resolve, reject) => {
               let response = {};
               console.log(date);

               let days = await db
                    .get()
                    .collection(collection.STUDENT_COLLECTION)
                    .aggregate([
                         {
                              $match: {
                                   _id: objectId(studentId._id),
                                   attendance: {
                                        $elemMatch: {
                                             $and: [
                                                  { attendance: 'Present' },
                                                  { month: date },
                                             ],
                                        },
                                   },
                              },
                         },
                         {
                              $project: {
                                   Sname: '$Sname',
                                   attendance: {
                                        $filter: {
                                             input: '$attendance',
                                             as: 'attendance',
                                             cond: {
                                                  $and: [
                                                       {
                                                            $eq: [
                                                                 '$$attendance.month',
                                                                 date,
                                                            ],
                                                       },
                                                       {
                                                            $eq: [
                                                                 '$$attendance.attendance',
                                                                 'Present',
                                                            ],
                                                       },
                                                  ],
                                             },
                                        },
                                   },
                              },
                         },
                    ])
                    .toArray();
               console.log(days[0]);
               var arr = date.split(/ |,/);
               month = arr[0];
               Y = arr[1];
               var months = [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
               ];
               var M = months.indexOf(month);
               var getDaysInMonth = function (month, year) {
                    return new Date(year, month, 0).getDate();
               };

               let totalDays = getDaysInMonth(M, Y);

               let present;
               let absent;
               let percentage;
               console.log(date);

               if (days[0]) {
                    present = days[0].attendance.length;
                    totalDays = 30;
                    absent = totalDays - present;
                    percentage = (present / totalDays) * 100;
                    console.log(percentage + '%');
                    response.present = present;
                    response.absent = absent;
                    response.totalDays = totalDays;
                    response.month = date;
                    response.percentage = percentage;

                    resolve(response);
               } else {
                    present = 0;
                    absent = totalDays - present;
                    percentage = (present / totalDays) * 100;
                    response.present = present;
                    response.absent = absent;
                    response.totalDays = totalDays;
                    response.month = date;
                    response.percentage = percentage;

                    resolve(response);
               }
          });
     },
     getAttendanceStatus: (studentId) => {
          return new Promise(async (resolve, reject) => {
               let today = new Date();
               var d = today.getDate();
               var m = today.getMonth() + 1;
               var y = today.getFullYear();
               var dateString = m + '/' + d + '/' + y;
               let present = await db
                    .get()
                    .collection(collection.STUDENT_COLLECTION)
                    .findOne({
                         _id: objectId(studentId),
                         'attendance.date': dateString,
                    });
               resolve(present);
          });
     },
     getEvents: (eventId) => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.EVENT_COLLECTION)
                    .findOne({ _id: objectId(eventId) })
                    .then((response) => {
                         resolve(response);
                    });
          });
     },
     registerEvents: (data) => {
          return new Promise(async (resolve, reject) => {
               let event = await db
                    .get()
                    .collection(collection.EVENT_COLLECTION)
                    .findOne({ _id: objectId(data.eventId) });
               console.log(event);
               let eventId = data.eventId;
               let name = data.Name;
               let Class = data.Class;
               let studentId = data.StudentId;
               let events = event.topic;
               let amount = event.amount;
               let regNo = data.regNo;
               let today = new Date();
               var d = today.getDate();
               var m = today.getMonth() + 1;
               var y = today.getFullYear();
               var dateString = d + '/' + m + '/' + y;
               let Event = {
                    events,
                    amount,
                    name,
                    regNo,
                    Class,
                    studentId,
                    eventId,
                    dateString,
               };
               db.get()
                    .collection(collection.EVENT_REGISTRY)
                    .insertOne(Event)
                    .then((response) => {
                         resolve(response.ops[0]._id);
                    });
          });
     },
     generateRazorpay: (registerId, amount) => {
          return new Promise((resolve, reject) => {
               var response = {};
               var options = {
                    amount: amount * 100, // amount in the smallest currency unit
                    currency: 'INR',
                    receipt: '' + registerId,
               };
               instance.orders.create(options, function (err, order) {
                    if (err) {
                         console.log(err);
                    } else {
                         console.log('new order:', order);
                         (response.Razorpay = true), (response.order = order);
                         resolve(response);
                    }
               });
          });
     },
     verifyPayments: (details) => {
          return new Promise((resolve, reject) => {
               const crypto = require('crypto');
               let hmac = crypto.createHmac(
                    'sha256',
                    '8i7SXoD78sPpykPkf9yK3Adf'
               );
               hmac.update(
                    details.payment.razorpay_order_id +
                         '|' +
                         details.payment.razorpay_payment_id
               );
               hmac = hmac.digest('hex');

               if (hmac == details.payment.razorpay_signature) {
                    resolve();
               } else {
                    reject();
               }
          });
     },
     changePaymentStatus: (orderId) => {
          return new Promise((resolve, reject) => {
               db.get()
                    .collection(collection.EVENT_REGISTRY)
                    .updateOne(
                         { _id: objectId(orderId) },
                         {
                              $set: {
                                   status: 'registered',
                              },
                         }
                    )
                    .then(() => {
                         resolve();
                    });
          });
     },

     generatePaypal: (amount) => {
          return new Promise((resolve, reject) => {
               let response = {};
               var create_payment_json = {
                    intent: 'sale',
                    payer: {
                         payment_method: 'paypal',
                    },
                    redirect_urls: {
                         return_url: 'http://localhost:3000/success',
                         cancel_url: 'http://localhost:3000/cancel',
                    },
                    transactions: [
                         {
                              item_list: {
                                   items: [
                                        {
                                             name: 'item',
                                             sku: 'item',
                                             price: amount,
                                             currency: 'INR',
                                             quantity: 1,
                                        },
                                   ],
                              },
                              amount: {
                                   currency: 'INR',
                                   total: amount,
                              },
                              description: 'This is the payment description.',
                         },
                    ],
               };
               paypal.payment.create(
                    create_payment_json,
                    function (error, payment) {
                         if (error) {
                              throw error;
                         } else {
                              /* console.log("Create Payment Response");*/
                              console.log(payment);
                              for (let i = 0; i < payment.links.length; i++) {
                                   if (
                                        payment.links[i].rel === 'approval_url'
                                   ) {
                                        response.paypal = true;
                                        response.link = payment.links[i].href;
                                        resolve(response);
                                   }
                              }
                         }
                    }
               );
          });
     },
     exicutePaypalPayment: (payerId, paymentId, amount) => {
          return new Promise((resolve, reject) => {
               const execute_payment_json = {
                    payer_id: payerId,
                    transactions: [
                         {
                              amount: {
                                   currency: 'INR',
                                   total: amount,
                              },
                         },
                    ],
               };

               paypal.payment.execute(
                    paymentId,
                    execute_payment_json,
                    function (error, payment) {
                         if (error) {
                              console.log(error.response);
                              throw error;
                         } else {
                              console.log(JSON.stringify(payment));
                              console.log(payment.status);
                              resolve();
                         }
                    }
               );
          });
     },
     getAssignmentCount: () => {
          return new Promise(async (resolve, reject) => {
               let count = await db
                    .get()
                    .collection(collection.ASSIGNMENT_COLLECTION)
                    .count();
               console.log(count);
               resolve(count);
          });
     },
};
