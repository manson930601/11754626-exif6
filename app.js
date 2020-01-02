const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');



// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 100000000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('myImage');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|heic|HEIC|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

// Init app
const app = express();

// EJS
app.set('view engine', 'ejs');

// Public Folder
app.use(express.static('./public'));

app.get('/', (req, res) => res.render('index'));


app.post('/map',  (req, res) => {
upload(req, res, (err) => {
res.render('map', {
  latitude : req.body.latitude,
  longitude : req.body.longitude,
})
});
}
);
;

app.post('/upload', (req, res) => {
  var image1;
  var model1;
  var create1;
  var latitude_degrees;
  var latitude_minutes;
  var latitude_seconds;
  var latitudeRef;
  var longitude_degrees;
  var longitude_minutes;
  var longitude_seconds;
  var longituderef;

  upload(req, res, (err) => {
    if(err){
      res.render('index', {
        msg: err
      });
    } else {
      if(req.file == undefined){
        res.render('index', {
          msg: 'Error: No File Selected!'
        });
      } else {
        var ExifImage = require('exif').ExifImage;
 
      try {
    new ExifImage({ image : './public/uploads/'+req.file.filename}, function (error, exifData) {
        if (error){
            console.log('Error: '+error.message);
        }else{
            //console.log(exifData); // Do something with your data!
            image1 = exifData.image.Make;
            model1= exifData.image.Model;
            create1 = exifData.exif.CreateDate;
            latitude_degrees = exifData.gps.GPSLatitude[0];
            latitude_minutes = exifData.gps.GPSLatitude[1];
            latitude_seconds = exifData.gps.GPSLatitude[2];;
            latitudeRef = exifData.gps.GPSLatitudeRef;
            longitude_degrees = exifData.gps.GPSLongitude[0];
            longitude_minutes = exifData.gps.GPSLongitude[1];
            longitude_seconds = exifData.gps.GPSLongitude[2];
            longituderef = exifData.gps.GPSLongitudeRef;
            console.log(latitude_degrees,latitude_minutes,latitude_seconds);
        

            var latitude = parseFloat(latitude_degrees) + parseFloat(latitude_minutes/60) + parseFloat(latitude_seconds/3600);

            if (latitudeRef == "S" || latitudeRef == "W") {
              latitude = latitude * -1; 
            }

            var longitude = parseFloat(longitude_degrees) +parseFloat (longitude_minutes/60) + parseFloat(longitude_seconds/3600);

            if (longituderef == "S" || longituderef == "W") {
              longitude = longitude * -1; 
            }

        res.render('information', {
          title: req.body.title,
          discription: req.body.discription,
          file: `uploads/${req.file.filename}`,
          make: image1,
          model: model1,
          create: create1,
          latitude_degrees : latitude_degrees,
          latitude_minutes : latitude_minutes,
          latitude_seconds : latitude_seconds,
          latitudeRef : latitudeRef,
          longitude_degrees : longitude_degrees,
          longitude_minutes : longitude_minutes,
          longitude_seconds: longitude_seconds,
          longituderef : longituderef,
          latitude : latitude,
          longitude : longitude,
        });
        }
    });
    } catch (error) {
    console.log('Error: ' + error.message);
    }
      }
    }
  });
});

const port = 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));