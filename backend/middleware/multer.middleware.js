import multer from "multer";


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

export
  const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
      cb(null, true); // ✅ Accept all types
    }
  });


export const uploadMultiple = multer({ storage: storage }).array("files", 10); // Max 10 files