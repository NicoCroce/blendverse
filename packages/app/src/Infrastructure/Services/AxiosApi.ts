import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { URL_SERVER } from './Services';

// Configuración inicial de Axios
const config: AxiosRequestConfig = {
  baseURL: URL_SERVER,
  headers: {
    'Content-Type': 'application/json',
  },
  // Habilitar el envío de cookies en solicitudes cross-origin
  withCredentials: true,
};

// Crear la instancia de Axios con la configuración
const axiosInstance: AxiosInstance = axios.create(config);

// Interceptor de peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    // Puedes agregar lógica adicional aquí si es necesario
    // Por ejemplo, añadir tokens de autenticación si los tienes en localStorage
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor de respuestas
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Manejo centralizado de errores
    if (error.response) {
      // El servidor respondió con un código de estado diferente de 2xx
      switch (error.response.status) {
        case 401:
          // Manejar error de autenticación
          console.error('Error de autenticación');
          // Redirigir a login o mostrar mensaje
          break;
        case 403:
          // Manejar error de autorización
          console.error('No tiene permisos para esta operación');
          break;
        case 500:
          console.error('Error interno del servidor');
          break;
        default:
          console.error(`Error: ${error.response.data}`);
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('No se pudo conectar con el servidor');
    } else {
      // Ocurrió un error al configurar la petición
      console.error('Error al realizar la petición:', error.message);
    }

    return Promise.reject(error);
  },
);

// Funciones auxiliares para hacer peticiones
export const ApiService = {
  get: <T>(url: string, params?: unknown) =>
    axiosInstance.get<T>(url, { params }),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    axiosInstance.post<T>(url, data, config),

  put: <T>(url: string, data?: unknown) => axiosInstance.put<T>(url, data),

  delete: <T>(url: string) => axiosInstance.delete<T>(url),

  // Método específico para enviar FormData (archivos)
  uploadFile: <T>(url: string, formData: FormData) =>
    axiosInstance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

// Exportar la instancia para casos específicos donde se necesite
export const Axios = axiosInstance;

export default ApiService;
