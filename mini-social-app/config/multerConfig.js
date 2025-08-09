const multer = require("multer");
const path = require("path");
const crypto = require("crypto");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(12, (err, buffer) => {
      const uniqueName =
        buffer.toString("hex") + "-" + path.extname(file.originalname);
      cb(null, uniqueName);
    });
  },
});


const upload = multer({ storage });

module.exports = upload;
