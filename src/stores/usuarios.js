import { defineStore } from "pinia";
import axios from "axios";
import { ref } from "vue";
import { useRouter } from 'vue-router';
import { SessionStorage, useQuasar } from 'quasar';

export const useUsuarioStore = defineStore("usuario", () => {
  const loading = ref(false);
  const token = ref(localStorage.getItem('token') || null); // Guardar el token
  const q = useQuasar();
  const router = useRouter();

  const axiosInstance = axios.create({
    // baseURL: 'https://api-asistencia-sena.onrender.com/api',
    baseURL: 'http://localhost:5001/api',
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

  // Interceptor para manejar respuestas no autorizadas
  axiosInstance.interceptors.response.use((response) => {
    return response;
  }, (error) => {
    if (error.response.status === 401) {
      // localStorage.removeItem('token'); // Eliminar el token si no es válido
      router.push('/'); // Redirigir al login
    }
    return Promise.reject(error);
  });

  const login = async (email, contrasena) => {
    try {
      loading.value = true;
      const response = await axiosInstance.post('/Usuarios/loginusuario', { email, contrasena });
      token.value = response.data.token;
      // Si solo quieres que el token permanezca disponible mientras el navegador 
      // esté abierto, utiliza solo sessionStorage. Si quieres que persista entre 
      // sesiones del navegador, usa localStorage
      localStorage.setItem('token', response.data.token); // Guardar el token en localStorage
      // sessionStorage.setItem('token', response.data.token); // Guardar el token en localStorage
      router.push('/home'); // Redirigir al home después del login exitoso
    } catch (error) {
      q.notify({
        type: 'negative',
        message: 'Error al iniciar sesión: ' + error.message,
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    token.value = null;
    localStorage.removeItem('token');
    SessionStorage.removeItem('nombre', 'email')
    router.push('/');
  };

  const traer = async () => {
    try {
      const response = await axiosInstance.get('/Usuarios/listartodo');
      return response
    } catch (error) {
      console.log(error);
    }
  };

  const crearUsuario = async (userData) => {
    try {
      loading.value = true;
      console.log(userData);
      const response = await axiosInstance.post('/Usuarios/crearusuario', userData);
      q.notify({
        type: 'positive',
        message: 'Usuario creado correctamente'
      });
      return response.data;
    } catch (error) {
      q.notify({
        type: 'negative',
        message: 'Error al crear el usuario'
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const cambiarContrasena = async (id) => {
    try {
      loading.value = true;
      const response = await axiosInstance.put('/Usuarios/cambiarContrasena', id);
      q.notify({
        type: 'positive',
        message: 'Cambio de contraseña exitoso'
      });
      return response.data;
    } catch (error) {
      q.notify({
        type: 'negative',
        message: 'Error al cambiar contraseña'
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const actualizarUsuario = async (id, userData) => {
    try {
      loading.value = true;
      const response = await axiosInstance.put(`/Usuarios/actualizarusuario/${id}`, userData);
      q.notify({
        type: 'positive',
        message: 'Cambios guardados con éxito'
      });
      return response.data;
    } catch (error) {
      q.notify({
        type: 'negative',
        message: 'Error, la actualización de datos falló'
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };
  

  async function activar(id) {
    try {
      loading.value = true;
      await axiosInstance.put(`/Usuarios/activarusuario/${id}`);
      q.notify({
        type: 'positive',
        message: 'Usuario activado correctamente'
      });
    } catch (error) {
      q.notify({
        type: 'negative',
        message: 'Error al activar usuario'
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  async function desactivar(id) {
    try {
      loading.value = true;
      await axiosInstance.put(`/Usuarios/desactivarusuario/${id}`);
      q.notify({
        type: 'positive',
        message: 'Usuario desactivado correctamente'
      });
    } catch (error) {
      q.notify({
        type: 'negative',
        message: 'Error al desactivar usuario'
      });
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    token,
    loading,
    login,
    logout,
    traer,
    crearUsuario,
    cambiarContrasena,
    actualizarUsuario,
    activar,
    desactivar
  };
});
