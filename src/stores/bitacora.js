import { defineStore } from "pinia";
import axios from "axios";
import { ref } from "vue";
import { useQuasar } from 'quasar';

export const useBitacoraStore = defineStore("bitacora", () => {
  const token = ref(localStorage.getItem('token') || null);
  const q = useQuasar();
  
  const axiosInstance = axios.create({
    baseURL: 'https://api-asistencia-sena.onrender.com/api',
    // baseURL: 'http://localhost:5001/api',
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
  // Estado para almacenar las bitácoras filtradas
  const bitacorasFiltradas = ref([]);

  // Método para almacenar las bitácoras filtradas en el estado
  const setBitacorasFiltradas = (bitacoras) => {
    bitacorasFiltradas.value = bitacoras;
  };

  const listarTodo = async () => {
    try {
      const r = await axiosInstance.get("/Bitacoras/listartodo");
      return r;
    } catch (error) {
      q.notify({
        type: 'negative',
        message: 'Error al listar las bitácoras',
      });
      throw error;
    }
  };

  const listarPorFecha = async (fecha) => {
    try {
      const r = await axiosInstance.get(`/Bitacoras/listarporfecha/${fecha}`);
      return r;
    } catch (error) {
      q.notify({
        type: 'negative',
        message: 'Error al listar las bitácoras',
      });
      throw error;
    }
  };

  const listarPorFicha = async (ficha) => {
    
    try {
      const r = await axiosInstance.get(`/Bitacoras/listarporficha/${ficha}`);
      console.log('listarPorFicha:', r);
      
      return r;
    } catch (error) {
      q.notify({
        type: 'negative',
        message: 'Error al listar las bitácoras',
      });
      throw error;
    }
  };  

  const listarBitacoraPorEstado = async () => {
    try{
      const r = await axiosInstance.get("/Bitacoras/listarPorEstado");
      return r
    } catch (error){
      q.notify({
        type: 'negative',
        message: 'Error al listar por estado',
      });
      throw error;
    }
  };

  const listarPorAprendiz = async (id_aprendiz) => {
    try {
      const r = await axiosInstance.get(`/Bitacoras/listarporaprendiz/${id_aprendiz}`);
      return r;
    } catch (error) {
      q.notify({
        type: 'negative',
        message: 'Error al listar por aprendiz',
      });
      throw error;
    }
  };

  const crearBitacora = async (bitacoraData) => {
    console.log(bitacoraData)
    try {
      const r = await axiosInstance.post(`/Bitacoras/crearBitacora`, bitacoraData);
      return r;
    } catch (error) {
      q.notify({
        type: 'negative',
        message: 'Ya registraste asistencia',
      });
      throw error;
    }
  };

  const actualizarEstado = async (id, estado) => {
    try {
      const r = await axiosInstance.put(`/Bitacoras/actualizarEstado/${id}`, { estado });
      q.notify({
        type: 'positive',
        message: 'Estado de la bitácora actualizado con éxito',
      });
      return r;
    } catch (error) {
      q.notify({
        type: 'negative',
        message: 'Error al actualizar el estado de la bitácora',
      });
      throw error;
    }
  };
  

  return {
    bitacorasFiltradas,
    setBitacorasFiltradas,
    listarTodo,
    listarBitacoraPorEstado,
    listarPorAprendiz,
    crearBitacora,
    actualizarEstado,
    listarPorFecha,
    listarPorFicha
  };
});
