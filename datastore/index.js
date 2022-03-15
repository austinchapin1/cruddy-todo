const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    if (err) {
      console.log(err);
    } else {
      fs.writeFile(`${exports.dataDir}/${id}.txt`, text, (err) => {
        if (err) {
          console.log(err);
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

// exports.readAll = (callback) => {
//   fs.readdir(`${exports.dataDir}`, (err, files) => {
//     if (err) {
//       console.log(err);
//     } else {
//       var ids = files.map(file => {
//         var id = file.slice(0, 5);
//         return fs.readFile(`${exports.dataDir}/${id}.txt`, 'utf8', (err, text) => {
//           if (err) {
//             callback(new Error(`No item with id: ${id}`));
//           } else {
//             callback(null, { id, text });
//           }
//         });
//       });
//       console.log(ids);
//       callback(null, ids);
//     }
//   });
// };

exports.readAll = (callback) => {
  var readOnePromise = Promise.promisify(exports.readOne);
  fs.readdir(`${exports.dataDir}`, (err, files) => {
    if (err) {
      console.log(err);
    } else {
      var promiseToDoArray = files.map(file => {
        var id = file.slice(0, 5);
        return readOnePromise(id);
      });
    }
    Promise.all(promiseToDoArray)
      .then(promises => {
        callback(null, promises);
      })
      .catch(error => {
        throw new Error(error);
      });
  });
};


exports.readOne = (id, callback) => {
  fs.readFile(`${exports.dataDir}/${id}.txt`, 'utf8', (err, text) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, { id, text });
    }
  });
};

exports.update = (id, text, callback) => {
  if (!fs.existsSync(`${exports.dataDir}/${id}.txt`)) {
    callback(new Error(`No item with id: ${id}`));
  } else {
    fs.writeFile(`${exports.dataDir}/${id}.txt`, text, (err, todo) => {
      if (err) {
        callback(new Error(`No item with id: ${id}`));
      } else {
        callback(null, id);
      }
    });
  }
};

exports.delete = (id, callback) => {
  if (!fs.existsSync(`${exports.dataDir}/${id}.txt`)) {
    callback(new Error(`No item with id: ${id}`));
  } else {
    fs.unlink(`${exports.dataDir}/${id}.txt`, (err) => {
      if (err) {
        console.log(err);
      } else {
        callback();
      }
    });
  }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');
console.log(exports.dataDir);

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
