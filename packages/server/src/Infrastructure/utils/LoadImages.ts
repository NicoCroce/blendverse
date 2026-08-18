import { Request, RequestHandler } from 'express';
import fs from 'node:fs';
import multer from 'multer';
import path from 'node:path';

const storage = (userId: number) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const uploadDir = path.join(__dirname, `../../../uploads/${userId}`);
      // Crear el directorio si no existe
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    },
  });

// Filtro para aceptar solo imágenes
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('El archivo debe ser una imagen'));
  }
};

export const uploadImages = (userId: number): RequestHandler =>
  multer({
    storage: storage(userId),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }).single('file');
