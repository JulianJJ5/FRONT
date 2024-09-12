import { defineStore } from "pinia";
import axios from "axios";
import { ref } from "vue";
import { useQuasar } from 'quasar';

export const useAprendizStore = defineStore("aprendiz", () => {
  const token = ref(localStorage.getItem('token') || null);
  const q = useQuasar();
  
  const axiosInstance = axios.create({
    baseURL: 'https://api-asistencia-sena.onrender.com/api',
  });

  // Interceptor para agregar el token en cada solicitud
  axiosInstance.interceptors.request.use((config) => {
    if (token.value) {
      config.headers['x-token'] = token.value;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  const listarAprendiz = async () => {
    try {
      const r = await axiosInstance.get("/Aprendices/listartodo");
      return r;
    } catch (error) {
      q.notify({
        type: 'negative',
        message: 'Error al listar los aprendices',
      });
      throw error;
    }
  };

  const listarAprendizPorID = async (codigo) => {
    try {
      const r = await axiosInstance.get(`/Aprendices/${codigo}`);
      return r;
    } catch (error) {
      q.notify({
        type: 'negative',
        message: 'Error al listar aprendiz por ID',
      });
      throw error;
    }
  };

  const crearAprendiz = async (documento, nombre, telefono, email, id_ficha) => {
    try {
      const r = await axiosInstance.post(`/Aprendices/crearaprendiz`, {
        documento, nombre, telefono, email, id_ficha,
      });
      q.notify({
        type: 'positive',
        message: 'Aprendiz creado con éxito',
      });
      return r;
    } catch (error) {
      q.notify({
        type: 'negative',
        message: 'Error al crear aprendiz',
      });
      throw error;
    }
  };

  const actualizarAprendiz = async (id, documento, nombre, telefono, email, id_ficha) => {
    try {
      const r = await axiosInstance.put(`/Aprendices/actualizaraprendiz/${id}`, {
        documento, nombre, telefono, email, id_ficha
      });
      q.notify({
        type: 'positive',
        message: 'Aprendiz actualizado con éxito',
      });
      return r;
    } catch (error) {
      q.notify({
        type: 'negative',
        message: 'Error al actualizar aprendiz',
      });
      throw error;
    }
  };
  

  const activarAprendiz = async (id) => {
    try {
      const r = await axiosInstance.put(`/Aprendices/activaraprendiz/${id}`);
      q.notify({
        type: 'positive',
        message: 'Aprendiz activado con éxito',
      });
      return r;
    } catch (error) {
      q.notify({
        type: 'negative',
        message: 'Error al activar aprendiz',
      });
      throw error;
    }
  };

  const desactivarAprendiz = async (id) => {
    try {
      const r = await axiosInstance.put(`/Aprendices/desactivaraprendiz/${id}`);
      q.notify({
        type: 'positive',
        message: 'Aprendiz desactivado con éxito',
      });
      return r;
    } catch (error) {
      q.notify({
        type: 'negative',
        message: 'Error al desactivar aprendiz',
      });
      throw error;
    }
  };

  return {
    listarAprendiz,
    listarAprendizPorID,
    crearAprendiz,
    actualizarAprendiz,
    activarAprendiz,
    desactivarAprendiz,
  };
});
