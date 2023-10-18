
var express = require('express');
var router = express.Router();
var admin = require("firebase-admin");
const path = require('path');

const multer = require('multer');
var serviceAccount = require("../path/to/serviceAccountKey.json");
var upload = multer({ dest: 'uploads/' });
// Khởi tạo Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://picsumanime-default-rtdb.asia-southeast1.firebasedatabase.app"
});
var db = admin.firestore();

// Cấu hình Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Duong dan luu tru file
  },
  // Tu dong dat ten anh la thoi gian hien tai + 1 so random
  filename: function (req, file, cb) {

    cb(null, file.originalname);
  }
});
const upload = multer({
  storage: storage,
});



/* GET home page. */
router.get('/', function (req, res, next) {
  const picsumCollectionRef = db.collection('picsums');
  
  picsumCollectionRef.get()
    .then((querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        docData.id = doc.id; // Nếu bạn muốn lưu ID của tài liệu
        data.push(docData);
      });
      
      res.render('index', { title: 'Express', data: data });
    })
    .catch((error) => {
      console.log('Error getting documents:', error);
      res.status(500).send('Server Error'); // Gửi thông báo lỗi
    });
});

router.get('/dataPicsums', function (req, res, next) {
  const picsumCollectionRef = db.collection('picsums');
  picsumCollectionRef.get()
    .then((querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        docData.id = doc.id; 
        data.push(docData);
      });
     res.json(data)
    })
    .catch((error) => {
      console.log('Error getting documents:', error);
      res.status(500).json({ error: 'Server Error' }); 
    });
});


// Đường dẫn thêm sản phẩm
router.post('/addProduct', upload.single('avatar1'), async function (req, res, next) {

  const productName = req.body.productName1;
  const productDescription = req.body.productDescription1;
  const avatarFile = req.file ? 'uploads/' + req.file.originalname : null;
  const productData = {
    productName: productName,
    productDescription: productDescription,
    avatarFile: avatarFile,
  };
  db.collection('picsums')
    .add(productData)
    .then((docRef) => {
      console.log('Document written with ID: ', docRef.id);
      res.render("index");
    })
    .catch((error) => {
      console.error('Error adding document: ', error);
    });

});
router.get('/deleteProduct/:id', function(req, res) {
  const productId = req.params.id;
  const productRef = db.collection('picsums').doc(productId);
  
  productRef.delete()
      .then(() => {
          console.log("Document successfully deleted!");
          res.redirect('/');  // Redirect về trang chính sau khi xóa
      })
      .catch((error) => {
          console.error("Error removing document: ", error);
          res.status(500).send("Error deleting product");
      });
});

module.exports = router;
