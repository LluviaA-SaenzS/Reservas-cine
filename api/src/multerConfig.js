import multer from "multer";
import path from "path";

// Carpeta donde se guardan las imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");  
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // evitar nombres repetidos
  }
});

// Validación opcional (solo imágenes)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo imágenes permitidas"), false);
  }
};

export const upload = multer({ storage, fileFilter });

