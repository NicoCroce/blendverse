import express, { Express } from 'express';
import path from 'path';

// Configurar el almacenamiento de multer

export const initExpress = (app: Express) => {
  app.use('/uploads', express.static(path.join(__dirname, '../../../uploads')));
};
