const multer = require("multer");
const path = require("path");

// Set up storage for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify where to store images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Set a unique filename
  },
});

// Filter to allow only images
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({ storage, fileFilter });

// Route to upload an image
router.post("/assets/upload", upload.single("image"), (req, res) => {
  const imageUrl = `uploads/${req.file.filename}`;
  res.json({ imageUrl });
});
