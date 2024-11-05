<template>
  <div class="q-pa-md">
    <div class="login">
      <q-form @submit.prevent="onSubmit" @reset="onReset" class="log">
        <h5 id="tittle"><b>ASISTENCIA</b></h5>
        <img
          src="../assets/Images/logoSena.png"
          alt="Logo Del SENA"
          id="logoSENA"
        />
        <q-select
          class="inputLogin"
          filled
          v-model="role"
          label="Seleccione el rol"
          :options="roles"
        />

        <div v-if="role === 'Administrador'" class="inputs">
          <q-input
            class="inputLogin"
            filled
            type="text"
            v-model="email"
            label="Ingrese su correo"
            lazy-rules
            :rules="[(val) => !!val || 'El correo es requerido']"
            >
                <template v-slot:prepend>
                  <font-awesome-icon icon="envelope" />                
                </template>              
              </q-input>          
          <q-input
            class="inputLogin"
            filled
            :type="showPassword ? 'text' : 'password'"
            v-model="contrasena"
            label="Ingrese su contraseña"
            lazy-rules
            @paste.prevent
            :rules="[(val) => !!val || 'La contraseña es requerida']"
            >
          <template v-slot:prepend>
                  <font-awesome-icon icon="lock" />                
                </template>    
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="togglePasswordVisibility"
              />
            </template>
          </q-input>
        </div>

        <div v-if="role === 'Aprendiz'" class="inputs">
          <q-input
            class="inputLogin"
            filled
            type="text"
            v-model="documento"
            label="Ingrese su documento"
            lazy-rules
            :rules="[(val) => !!val || 'El documento es requerido']"
            >
                <template v-slot:prepend>
                  <font-awesome-icon icon="address-card" />                
                </template>              
              </q-input>
                    </div>

        <div v-if="role" class="bottom">
          <q-btn 
          :loading="loading"
          label="Ingresar" 
          type="submit" 
          class="register" />
        </div>

        <!-- Restablecer contraseña (Solo visible para el Administrador) -->
        <div v-if="role === 'Administrador'" class="bottom">
          <router-link
            to="/Recuperacion"
            class="cursor-pointer"
            id="recuperacion"
            >Restablecer Contraseña</router-link
          >
        </div>
      </q-form>
    </div>
  </div>
  <div>
    <div class="todr">REPFORA - Sena 2024 © Todos los derechos reservados</div>
  </div>
</template>

<script setup>
import { ref } from "vue";/* 
import moment from 'moment-timezone'; */
import axios from "axios";
import { useRouter } from "vue-router";
import { Notify } from "quasar";
import { useBitacoraStore } from "../stores/bitacora";
import { useAprendizStore } from "../stores/aprendiz";

const showPassword = ref(false);
const email = ref(null);
const contrasena = ref(null);
const documento = ref(null);
const nombre = ref("");
const role = ref("Aprendiz");
const roles = ref(["Administrador", "Aprendiz"])
const router = useRouter();
const loading = ref(false);
const useBitacora = useBitacoraStore();
const useAprendiz = useAprendizStore();/* 
let fechaLocal = moment().tz('America/Bogota').format('YYYY-MM-DD') */

const onSubmit = async () => {
  loading.value = true;
  try {
    if (role.value === "Administrador") {
      try {
      const res = await axios.post(
        "https://api-asistencia-sena.onrender.com/api/Usuarios/loginusuario",
        {
          email: email.value,
          contrasena: contrasena.value,
        }
      );
      const { token } = res.data;
      localStorage.setItem("token", token);
      sessionStorage.setItem("nombre", nombre.value);
      sessionStorage.setItem("email", email.value);
      Notify.create({ type: "positive", message: "Inicio de sesión exitoso" });
      router.push("/Home");
    } catch (error) {
      console.log(error);
      
      Notify.create({
        type: "negative",
        message: error.response?.data?.msg || "Error en el inicio de sesión",
      });
    }}
    
    else if (role.value === "Aprendiz") {
      const aprendices = await useAprendiz.listarAprendiz();
      console.log(aprendices)
      const aprendiz = aprendices.data.find(aprendiz => aprendiz.documento === documento.value);
      console.log(aprendiz)

      if (aprendiz) {
        const bitacoraData = {
          id_aprendiz: aprendiz._id,
          // fecha: new Date().toISOString(),
          fecha: new Date(fechaLocal),
           // Esto dará "2024-11-01T13:33:33.000-05:00"
          // fecha: moment().tz('America/Bogota').toDate(),
        };
        console.log('bitacoraData: ', bitacoraData);
        
        await useBitacora.crearBitacora(bitacoraData);
        Notify.create({ type: "positive", message: "Asistencia registrada con exito" });
      } else {
        Notify.create({ type: "negative", message: "Documento no encontrado" });
      }
    }
  } catch (error) {
  console.log(error);
  
  } finally {
    loading.value = false;
  }
};


const onReset = () => {
  email.value = null;
  contrasena.value = null;
  documento.value = null;
  role.value = null;
};

// function obtenerFechaActual() {
//   fechaActual = new Date();

//   dia = fecha.getDate();
//   mes = fecha.getMonth();
//   anio = fecha.getFullYear();

//   console.log(fecha);

//   return{
//     día: dia,
//     mes: mes,
//     año: anio
//   }

  
// }

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<style scoped>
.q-pa-md {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(237, 237, 237);
  height: 93vh;
}

.login {
  border: rgb(230, 203, 203) 1px solid;
  width: 30%;
  align-items: center;
  text-align: center;
  border-radius: 3% !important;
  background-color: rgb(247, 255, 248);
}

#tittle {
  width: 100%;
  font-size: 40px;
  letter-spacing: 2px;
  background-color: #2e7d32;
  text-align: center;
  color: white;
  margin: 0px;
  padding: 5%;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

#logoSENA {
  width: 40%;
  padding: 5%;
}

.todr {
  position: fixed;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  height: 8vh;
  font-weight: bold;
  font-size: 16px;
  align-items: center;
  background-color: rgb(212, 212, 212);
}

.register {
  background-color: #2e7d32;
  color: white;
  font-weight: bold;
  margin: 2%;
}

.inputLogin {
  padding: 2% !important;
}

#recuperacion {
  color: #2e7d32;
  font-weight: bold;
  font-size: 17px;
  margin: 2% !important;
  text-decoration: none;
}
</style>
