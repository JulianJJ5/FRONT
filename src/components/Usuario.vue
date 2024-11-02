<template>
  <div class="q-pa-md">
    <q-layout view="lHh Lpr lff">
        <div>
          <q-btn
            class="colorCorporativo"
            @click="dialogo('crear')"
            label="Crear Administrador"
          />
          <br /><br />

          <q-table
            title="ADMINISTRADORES"
            :rows="rows"
            :columns="columns"
            row-key="_id"
            ref="adminTable"
            pagination.sync="pagination"
            :loading="isLoading"
            :rows-per-page-options="[20, 50, 100, 0]"
          >
            <template v-slot:body-cell-opciones="props">
              <q-td :props="props">
                <q-btn class="colorCorporativo editar" @click="dialogo('editar', props.row)"
                :loading="loadingButtons[props.row._id]?.editar || false"
                >
                  <font-awesome-icon icon="pen-to-square" />
                </q-btn>
                <q-btn
                  @click="activar(props.row._id)"
                  :loading="loadingButtons[props.row._id]?.activar || false"
                  class="activar"
                  v-if="props.row.estado === 0"
                  >
                  <font-awesome-icon icon="fa-solid fa-check" style="color: #ffffff;" />
                  </q-btn
                >
                <q-btn
                  @click="desactivar(props.row._id)"
                  :loading="loadingButtons[props.row._id]?.desactivar || false"
                  class="desactivar"
                  v-else
                >
                  <font-awesome-icon icon="ban" style="color: #ffffff;"/>
                </q-btn>
              </q-td>
            </template>

            <template v-slot:body-cell-estado1="props">
              <q-td :props="props">
                <p :style="{ color: props.row.estado === 1 ? 'green' : 'red' }">
                  {{ props.row.estado === 1 ? "Activo" : "Inactivo" }}
                </p>
              </q-td>
            </template>
          </q-table>

          <q-dialog v-model="prompt" persistent>
            <q-card style="min-width: 350px">
              <q-card-section>
                <div class="text-h5 tituloCuadroDeDialogo">{{ dialogTitle }}</div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <q-input 
                filled
                label="Nombre del Usuario"
                label-class="custom-label"
                v-model="inputNombreAdministrador"
                :disable="isLoading"
                autofocus 
                :rules="[val => !!val || 'Este campo es obligatorio']"
                >
                <template v-slot:prepend>
                  <font-awesome-icon icon="spell-check" />
                </template>              
              </q-input>

                <q-input 
                filled
                label="Email"
                label-class="custom-label" 
                v-model="inputEmailAdministrador"
                :disable="isLoading" 
                :rules="[val => !!val || 'Este campo es obligatorio']"
                >
                <template v-slot:prepend>
                  <font-awesome-icon icon="envelope" />                
                </template>              
              </q-input>

                <q-input
            v-if="!editando"
            class="inputLogin"
            filled
            :type="showPassword ? 'text' : 'password'"
            v-model="inputContrasenaAdministrador"
            label="Ingrese su contraseña"
            lazy-rules
            :rules="[val => !!val || 'Este campo es obligatorio']"
            @paste.prevent
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
              </q-card-section>

              <q-card-actions align="right" class="text-primary">
                <q-btn 
                class="btnCerrar"
                flat 
                @click="prompt = false" 
                >
                <font-awesome-icon icon="fa-solid fa-circle-xmark" style="margin-right: 5px;"/>                  
                Cerrar              
                </q-btn>


                <q-btn 
                flat 
                class="btnGuardar"
                :loading="isLoading"
                @click="validar()" 
                >
                <font-awesome-icon icon="fa-solid fa-floppy-disk" style="margin-right: 5px;" />                
                Guardar Administrador
              </q-btn>
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>
    </q-layout>
  </div>
</template>

<script setup>
import { ref, onBeforeMount} from "vue";
import { useQuasar } from "quasar";
import { useUsuarioStore } from "../stores/usuarios.js";

const rows = ref([]);
const prompt = ref(false);
const showPassword = ref(false);
const q$ = useQuasar();
const dialogTitle = ref("");
const editando = ref(false);
const usuarioId = ref(null); // Esto es donde almacenamos el id del usuario que se está editando
const inputNombreAdministrador = ref("");
const inputEmailAdministrador = ref("");
const inputContrasenaAdministrador = ref("");
const useUsuario = useUsuarioStore();
const isLoading = ref(false);
const loadingButtons = ref({});
onBeforeMount(() => {
  traer();
});

async function traer() {
    isLoading.value = true;
    try {
      const response = await useUsuario.traer();
      rows.value = response.data;
    } catch (error) {
      console.log(error);
    } finally {
      isLoading.value = false;
    }
  }

const validar = async () => {
  isLoading.value = true;

  if (!inputNombreAdministrador.value || !inputEmailAdministrador.value) {
    q$.notify({
      type: "negative",
      message: "Rellena todos los campos.",
    });
    isLoading.value = false;
    return;
  }

  try {
    if (editando.value && usuarioId.value) {
      await useUsuario.actualizarUsuario(usuarioId.value, {
        nombre: inputNombreAdministrador.value.trim(),
        email: inputEmailAdministrador.value.trim(),
      });
    } else {
      await useUsuario.crearUsuario({
        nombre: inputNombreAdministrador.value.trim(),
        email: inputEmailAdministrador.value.trim(),
        contrasena: inputContrasenaAdministrador.value.trim()
      });
    }
    await traer(); // Actualizar la tabla después de crear/editar
    prompt.value = false; // Cerrar el diálogo
  } catch (error) {
    console.log(error);
  } finally {
      isLoading.value = false;
    }
};

async function activar(id) {
    loadingButtons.value[id] = { ...loadingButtons.value[id], activar: true };
    try {
      await useUsuario.activar(id);
      traer();
    } catch (error) {
      console.log(error);
    } finally {
      loadingButtons.value[id] = { ...loadingButtons.value[id], activar: false };
    }
  }

  async function desactivar(id) {
    loadingButtons.value[id] = { ...loadingButtons.value[id], desactivar: true };
    try {
      await useUsuario.desactivar(id);
      traer();
    } catch (error) {
      console.log(error);
    } finally {
      loadingButtons.value[id] = { ...loadingButtons.value[id], desactivar: false };
    }
  }

const dialogo = (accion, administrador = null) => {
  if (accion === "crear") {
    dialogTitle.value = "Crear Administrador";
    inputNombreAdministrador.value = "";
    inputEmailAdministrador.value = "";
    inputContrasenaAdministrador.value = "";
    usuarioId.value = null;
    editando.value = false;
  } else if (accion === "editar" && administrador) {
    dialogTitle.value = "Editar Administrador";
    inputNombreAdministrador.value = administrador.nombre;
    inputEmailAdministrador.value = administrador.email;
    usuarioId.value = administrador._id; // Asignar el id del usuario a editar
    editando.value = true;
  }
  prompt.value = true;
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const columns = ref([
  {
    name: "nombre1",
    required: true,
    label: "Nombre del Usuario",
    align: "center",
    field: "nombre",
    sortable: true,
  },
  {
    name: "email1",
    align: "center",
    label: "Email del Usuario",
    field: "email",
    sortable: true,
  },
  {
    name: "estado1",
    label: "Estado",
    align: "center",
    field: "estado",
    sortable: true,
  },
  { name: "opciones", label: "Opciones", align: "center", sortable: true },
]);
</script>