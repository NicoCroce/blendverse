import { Request, RequestHandler } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

const storage = (userId: number, articuloId?: number) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      // Crear carpeta por usuario y opcionalmente por artículo
      const folderPath = articuloId
        ? `articulos/${articuloId}`
        : `usuarios/${userId}`;
      const uploadDir = path.join(__dirname, `../../../uploads/${folderPath}`);

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

// Para múltiples imágenes
export const uploadMultipleImages = (
  userId: number,
  articuloId?: number,
): RequestHandler =>
  multer({
    storage: storage(userId, articuloId),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB por archivo
  }).array('images', 10); // Máximo 10 imágenes
