const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

// STORAGED IN MEMORY
const molterStorage = multer.memoryStorage();

// FILE TYPE CHECKING
const multerFilter = (req, file, callback) => {
  // Check file type
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    // Rejected files
    callback(
      {
        message: "Unsupported file format",
      },
      false
    );
  }
};

const profilePhotoUpload = multer({
  storage: molterStorage,
  fileFilter: multerFilter,
  // Apply a size limit to the uploaded image
  limits: { filesize: 1000000 },
});

// IMAGE RESIZING
const profilePhotoResize = async (req, res, next) => {
  // Check if there is no file to resize
  if (!req.file) return next();

  req.file.filename = `user-${Date.now()}-${req.file.originalname}`;

  await sharp(req.file.buffer)
    .resize(250, 250)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(path.join(`public/images/profile/${req.file.filename}`));
  next();
};

module.exports = { profilePhotoUpload, profilePhotoResize };
