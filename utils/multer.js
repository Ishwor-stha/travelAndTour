const multer=require("multer");
//for image handling
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // The folder to store uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);  //  timestamp to make unique name
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];  // Allowed image types
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type, only JPEG, PNG, and JPG are allowed'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 1 * 1024 * 1024  // Limit file size to 1MB
    }
});
module.exports=upload