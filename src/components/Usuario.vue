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
              <q-btn
                class="colorCorporativo editar"
                @click="dialogo('editar', props.row)"
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
                <font-awesome-icon
                  icon="fa-solid fa-check"
                  style="color: #ffffff"
                />
              </q-btn>
              <q-btn
                @click="desactivar(props.row._id)"
                :loading="loadingButtons[props.row._id]?.desactivar || false"
                class="desactivar"
                v-else
              >
                <font-awesome-icon icon="ban" style="color: #ffffff" />
              </q-btn>
            </q-td>
          </template>

          <template v-slot:body-cell-nombre1="props">
            <q-td :props="props" class="q-td__name-and-email">
              <div class="nombre-en-negrita">{{ props.row.nombre }}</div>
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
                :rules="[(val) => !!val || 'Este campo es obligatorio']"
              >
                <template v-slot:prepend>
                  <font-awesome-icon icon="spell-check" />
                </template>
              </q-input>

              <q-input
                filled
                style="font-size: 6px"
                label="Email"
                label-class="custom-label"
                v-model="inputEmailAdministrador"
                :disable="isLoading"
                :rules="[(val) => !!val || 'Este campo es obligatorio']"
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
                :rules="[(val) => !!val || 'Este campo es obligatorio']"
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
              <q-btn class="btnCerrar" flat @click="prompt = false">
                <font-awesome-icon
                  icon="fa-solid fa-circle-xmark"
                  style="margin-right: 5px"
                />
                Cerrar
              </q-btn>

              <q-btn
                flat
                class="btnGuardar"
                :loading="isLoading"
                @click="validar()"
                :disable="!isFormValid"
              >
                <font-awesome-icon
                  icon="fa-solid fa-floppy-disk"
                  style="margin-right: 5px"
                />
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
import { ref, onBeforeMount } from "vue";
import { useQuasar } from "quasar";
import { useUsuarioStore } from "../stores/usuarios.js";
import { computed } from "vue";


const rows = ref([]);
const prompt = ref(false);
const showPassword = ref(false);
const q$ = useQuasar();
const dialogTitle = ref("");
const editando = ref(false);
const usuarioId = ref(null);
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

const isFormValid = computed(() => {
  // Si estamos editando, no necesitamos validar la contraseña
  if (editando.value) {
    return inputNombreAdministrador.value.trim() && inputEmailAdministrador.value.trim();
  }
  
  // Si estamos creando, todos los campos son obligatorios
  return (
    inputNombreAdministrador.value.trim() &&
    inputEmailAdministrador.value.trim() &&
    inputContrasenaAdministrador.value.trim()
  );
});


const validar = async () => {
  isLoading.value = true;

  if (!inputNombreAdministrador.value || !inputEmailAdministrador.value) {
    q$.notify({
      type: "negative",
      message: "Rellena todos los campos.",
    });
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
        contrasena: inputContrasenaAdministrador.value.trim(),
      });
    }
    await traer();
    prompt.value = false;
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
    loadingButtons.value[id] = {
      ...loadingButtons.value[id],
      desactivar: false,
    };
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
    usuarioId.value = administrador._id;
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

<style scoped>
/* Estilos generales para la tabla */
.q-table {
  width: 100%;
  border-collapse: collapse;
  word-wrap: break-word;
}

.q-table th,
.q-table td {
  text-align: center;
  padding: 8px;
  font-size: 12px;
}

.q-btn {
  font-size: 12px;
  padding: 6px 12px;
}

/* Estilos para el nombre en negrita */
.nombre-en-negrita {
  font-weight: bold;
}

/* Ajustes para pantallas medianas */
@media screen and (max-width: 1024px) {
  .q-table th,
  .q-table td {
    font-size: 12px;
    padding: 8px;
  }

  .q-btn {
    font-size: 14px;
  }
}

/* Ajustes para pantallas pequeñas */
@media screen and (max-width: 930px) {
  .q-table th,
  .q-table td {
    font-size: 10px;
    padding: 6px;
  }

  .q-btn {
    font-size: 12px;
  }

  .q-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  .q-table thead,
  .q-table tbody {
    display: block;
  }

  .q-table th {
    white-space: nowrap;
  }
}

@media screen and (max-width: 800px) {
  .q-table th,
  .q-table td {
    font-size: 9px;
    padding: 6px;
    width: 50% !important;
  }

  .q-btn {
    font-size: 12px;
  }

  .q-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
    width: 50% !important;
    font-size: 6px;
  }

  .box {
    width: 100%;
  }

  .q-table thead,
  .q-table tbody {
    display: fixed;
  }

  .q-table th {
    width: 50% !important;
    white-space: nowrap;
  }
}

/* Ajustes para pantallas menores a 600px */
@media screen and (max-width: 600px) {
  .q-td__name-and-email {
    display: flex;
    flex-direction: column;
  }

  .nombre-en-negrita {
    margin-bottom: 5px;
  }

  .q-table th,
  .q-table td {
    font-size: 9px;
    padding: 4px;
  }

  .q-btn {
    font-size: 10px;
  }
}
</style>
