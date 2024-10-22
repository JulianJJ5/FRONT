<template>
  <div class="q-pa-md">
    <q-layout view="lHh Lpr lff">
      <q-header elevated class="colorCorporativo text-white">
        <q-toolbar>
          <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
          <q-toolbar-title>REPFORA</q-toolbar-title>
          
        </q-toolbar>
      </q-header>

      <div v-if="isLoading" class="fullscreen-spinner">
        <q-spinner color="primary" size="3em" :thickness="2" />
      </div>

      <div v-else>
        <q-drawer v-model="drawer" show-if-above :width="220" :mini-to-overlay="false" :breakpoint="400">
          <q-scroll-area
            style="
              height: calc(100% - 150px);
              margin-top: 150px;
              border-right: 1px solid #ddd;
            "
          >
            <q-list padding>
              <q-btn class="menuButton colorCorporativo" to="/Home" label="HOME" />
              <br/><br/>
              <q-btn class="menuButton colorCorporativo" to="/Home/Usuario" label="ADMINISTRADORES" />
              <br/><br/>
              <q-btn class="menuButton colorCorporativo" to="/Home/Aprendiz" label="APRENDICES" />
              <br/><br/>
              <q-btn class="menuButton colorCorporativo" to="/Home/Ficha" label="FICHAS" />
              <br/><br/>
              <q-btn class="menuButton colorCorporativo" to="/Home/Bitacora" label="BITACORAS" />
              <br/><br/>
              <q-btn class="menuButton colorCorporativo" to="/Home/Informes" label="INFORMES" />
              <q-btn class="menuButtonSession" to="/" label="Cerrar sesión" @click="logout()"/>

            </q-list>
          </q-scroll-area>

          <q-img
            class="absolute-top"
            src="../assets/Images/qDrawerImage.jpg"
            style="height: 150px"
          >
            <div class="absolute-bottom bg-transparent">
              <q-avatar size="56px" class="q-mb-sm">
                <img src="../assets/Images/logo-blanco.png" />
              </q-avatar>
              <div class="text-weight-bold">{{ nombreUsuario }}</div>
              <div class="text-weight-bold">{{ emailUsuario }}</div>
            </div>
          </q-img>
        </q-drawer>

        <!-- Ajustamos la clase q-layout-padding para que el contenido se mueva -->
        <q-page-container>
          <router-view></router-view>

          <div class="q-gutter-md grid" v-if="$route.path === '/Home'">
            <q-card class="my-card" flat bordered @click="goToRoute('/Home/Ficha')">
              <div class="colorCorporativo flex-container">
                <q-img src="../assets/Images/Logo-Fichas.png" class="flex-img" />
              </div>
              <q-card-section class="flex-content">
                <div class="text-h6 q-mt-sm q-mb-xs">FICHAS</div>
              </q-card-section>
            </q-card>

            <q-card class="my-card" flat bordered @click="goToRoute('/Home/Usuario')">
              <div class="colorCorporativo flex-container">
                <q-img src="../assets/Images/Logo-Administrador.png" class="flex-img" />
              </div>
              <q-card-section class="flex-content">
                <div class="text-h6 q-mt-sm q-mb-xs">ADMINISTRADOR</div>
              </q-card-section>
            </q-card>

            <q-card class="my-card" flat bordered @click="goToRoute('/Home/Bitacora')">
              <div class="colorCorporativo flex-container">
                <q-img src="../assets/Images/Logo-Bitacoras.png" class="flex-img" />
              </div>
              <q-card-section class="flex-content">
                <div class="text-h6 q-mt-sm q-mb-xs">BITACORAS</div>
              </q-card-section>
            </q-card>

            <q-card class="my-card" flat bordered @click="goToRoute('/Home/Aprendiz')">
              <div class="colorCorporativo flex-container">
                <q-img src="../assets/Images/Logo-Aprendices.png" class="flex-img" />
              </div>
              <q-card-section class="flex-content">
                <div class="text-h6 q-mt-sm q-mb-xs">APRENDICES</div>
              </q-card-section>
            </q-card>

            <q-card class="my-card" flat bordered @click="goToRoute('/Home/Informes')">
              <div class="colorCorporativo flex-container">
                <q-img src="../assets/Images/Logo-Informes.png" class="flex-img" />
              </div>
              <q-card-section class="flex-content">
                <div class="text-h6 q-mt-sm q-mb-xs">INFORMES</div>
              </q-card-section>
            </q-card>
          </div>
        </q-page-container>
      </div>
    </q-layout>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUsuarioStore } from "../stores/usuarios";

const drawer = ref(false);
const router = useRouter();
const isLoading = ref(false)
const nombreUsuario = ref('')
const emailUsuario = ref('')
const useUsuario = useUsuarioStore()


function goToRoute(route) {
  router.push(route);
}

onMounted(() => {
    nombreUsuario.value = sessionStorage.getItem('nombre') || ''
    emailUsuario.value = sessionStorage.getItem('email') || ''
  });

  const logout = async () => {
    const r  = useUsuario.logout()
  }
</script>

<style>
.grid {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
}

.q-gutter-md {
  padding-inline-start: 10% !important;
}

.absolute-top{
  text-align: center;
}

.my-card {
  width: 65%;
  cursor: pointer;
  border-radius: 0px !important;
  border: 5px #2e7d32 solid !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.my-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.width {
  width: 50%;
}

.text-h5 {
  text-align: center;
}

.menuButton {
  color: white !important;
  font-size: 17px !important;
  width: 90% !important;
  margin-left: 4% !important;
}

.menuButtonSession {
  background-color: #df1f1f !important;
  color: white !important;
  font-size: 17px !important;
  width: 90% !important;
  margin-left: 4% !important;
  top: 50px !important;
  position: relative !important;
}

.q-table__title{
  font-size: 30px !important;
  font-weight: bold !important;
}

.btnCerrar {
  background-color: #ff0404cd !important;
  font-weight: bold !important;
  color: white !important;
}

.btnGuardar {
  background-color: #2e7d32 !important;
  color: white !important;
  font-weight: bold !important;
}

.q-card .tituloCuadroDeDialogo {
  background-color: #2e7d32 ;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  color: white;
  padding: 17px;
  border-radius: 5px;
  text-align: center;
}

.q-select{
  padding: 10px;

}

.q-input {
padding: 10px;
}

.q-file {
  padding: 10px;
}

.colorCorporativo{
  background-color: #238327 !important;
  color: white !important;
}

.desactivar {
  background-color: red !important;
  border-radius: 13px !important;
  margin-left: 2% !important;
}

.activar{
  background-color: rgb(10, 190, 10) !important;
  border-radius: 13px !important;
  margin-left: 2% !important;
}

.editar{
  border-radius: 13px !important;
  margin-right: 2% !important;
}

.flex-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.flex-img {
  max-width: 80%;
  height: auto;
}

.flex-content {
  text-align: center;
  margin-top: 8px; 
}

</style>
