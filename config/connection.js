const MongoClient = require('mongodb').MongoClient;
const state = {
     db: null,
};

module.exports.connect = (done) => {
     const url = 'mongodb://localhost:27017';
     const dbname = 'My-class';

     MongoClient.connect(url, (err, data) => {
          if (err) return done;
          state.db = data.db(dbname);
          done();
     });
};
module.exports.get = () => {
     return state.db;
};
