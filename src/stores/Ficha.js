import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

export const useFichaStore = defineStore("ficha", () => {
  const token = ref(localStorage.getItem('token') || null); // Recuperar token del localStorage
  const q = useQuasar();
  const router = useRouter();
  const loading = ref(false); // Para manejar la carga

  // Crear instancia de axios con la base URL
  const axiosInstance = axios.create({
    // baseURL: 'https://api-asistencia-sena.onrender.com/api',
    baseURL: 'http://localhost:5001/api',
  });

  // Interceptor para agregar el token en cada solicitud
  axiosInstance.interceptors.request.use((config) => {
    if (token.value) {
      config.headers['x-token'] = token.value; // Incluir el token en las cabeceras
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  // Interceptor para manejar respuestas no autorizadas
  axiosInstance.interceptors.response.use((response) => {
    return response;
  }, (error) => {
    if (error.response && error.response.status === 401) {
      router.push('/'); // Redirigir al login si no está autorizado
    }
    return Promise.reject(error);
  });

  const listarFichas = async () => {
    try {
      loading.value = true;
      let response = await axiosInstance.get('/Fichas/listartodo');
      console.log(response);
      return response;
    } catch (error) {
      console.error(error);
      q.notify({
        type: 'negative',
        message: 'Error al listar fichas'
      });
      return error;
    } finally {
      loading.value = false;
    }
  };

  const crearFichas = async (fichaData) => {
    console.log('Crear Fichas:  ', fichaData);
    
    try {
      loading.value = true;
      let response = await axiosInstance.post('/Fichas/crearficha', fichaData);
      console.log(response);
      q.notify({
        type: 'positive',
        message: 'Ficha creada correctamente'
      });
      return response;
    } catch (error) {
      console.error(error);
      q.notify({
        type: 'negative',
        message: 'Error al crear ficha'
      });
      return error;
    } finally {
      loading.value = false;
    }
  };

  const listarporids = async (id) => {
    try {
      loading.value = true;
      let response = await axiosInstance.get(`/Fichas/listarporid/${id}`);
      console.log(response);
      return response;
    } catch (error) {
      console.error(error);
      q.notify({
        type: 'negative',
        message: 'Error al listar ficha por ID'
      });
      return error;
    } finally {
      loading.value = false;
    }
  };

  const actualizar = async (id, fichaData) => {
    try {
      loading.value = true;
      console.log('Token guardado:   ',token);
      
      let response = await axiosInstance.put(`/Fichas/actualizarficha/${id}`, fichaData);
      console.log(response);
      q.notify({
        type: 'positive',
        message: 'Ficha actualizada correctamente'
      });
      return response;
    } catch (error) {
      console.error(error);
      q.notify({
        type: 'negative',
        message: 'Error al actualizar ficha'
      });
      return error;
    } finally {
      loading.value = false;
    }
  };

  const activar = async (id) => {
    try {
      loading.value = true;
      let response = await axiosInstance.put(`/Fichas/activarficha/${id}`);
      console.log(response);
      q.notify({
        type: 'positive',
        message: 'Ficha activada correctamente'
      });
      return response;
    } catch (error) {
      console.error(error);
      q.notify({
        type: 'negative',
        message: 'Error al activar ficha'
      });
      return error;
    } finally {
      loading.value = false;
    }
  };

  const desactivar = async (id) => {
    try {
      loading.value = true;
      let response = await axiosInstance.put(`/Fichas/desactivarficha/${id}`);
      console.log(response);
      q.notify({
        type: 'positive',
        message: 'Ficha desactivada correctamente'
      });
      return response;
    } catch (error) {
      console.error(error);
      q.notify({
        type: 'negative',
        message: 'Error al desactivar ficha'
      });
      return error;
    } finally {
      loading.value = false;
    }
  };

  return {
    listarFichas,
    crearFichas,
    listarporids,
    actualizar,
    activar,
    desactivar,
    token,
    loading
  };
});
