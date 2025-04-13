import { RequestContext } from '@server/Application';

// Asegúrate de que sea un módulo añadiendo export {}
declare global {
  namespace Express {
    interface Request {
      requestContext: RequestContext; // Quité el ? para evitar problemas
    }
  }
}

export {}; // Esto hace que el archivo sea un módulo
