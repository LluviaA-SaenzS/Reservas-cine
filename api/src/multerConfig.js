import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname); 
    const nombreArchivo = `${Date.now()}${extension}`; 
    cb(null, nombreArchivo);
  }
});

export const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Validar tipos de archivo permitidos
    const tiposPermitidos = /jpeg|jpg|png|webp/;
    const extension = path.extname(file.originalname).toLowerCase();
    const mimeType = tiposPermitidos.test(file.mimetype);
    const extValida = tiposPermitidos.test(extension);

    if (mimeType && extValida) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes (jpg, png, webp)"));
    }
  }
});

