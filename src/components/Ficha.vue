<template>
  <div class="q-pa-md">
    <q-layout view="lHh Lpr lff">
      <q-btn
        class="colorCorporativo"
        @click="dialogo('crear')"
        label="Crear Ficha"
      />
      <br /><br />
      <q-table
        class="posicion"
        title="FICHAS"
        :rows="rows"
        :loading="loadingGeneral"
        :columns="columns"
        row-key="name"
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
        <template v-slot:body-cell-estado1="props">
          <q-td :props="props">
            <p style="color: green" v-if="props.row.estado == 1">Activo</p>
            <p style="color: red" v-else>Inactivo</p>
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
              label="Codigo de la Ficha"
              label-class="custom-label"
              v-model="inputCodigoFicha"
              :disable="loadingGeneral"
              autofocus
              @keydown="preventNonNumeric"
              @input="formatInputCodigoFicha"
              @keyup.enter="prompt = false"
              :rules="[val => !!val || 'Este campo es obligatorio']"
            >
              <template v-slot:prepend>
                <font-awesome-icon icon="hashtag" />
              </template>
            </q-input>

            <q-input
              filled
              label="Nombre de la Ficha"
              label-class="custom-label"
              :disable="loadingGeneral"
              v-model="inputNombreFicha"
              autofocus
              :rules="[val => !!val || 'Este campo es obligatorio']"
              @keyup.enter="prompt = false"
            >
              <template v-slot:prepend>
                <font-awesome-icon icon="spell-check" />
              </template>
            </q-input>
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat class="btnCerrar" v-close-popup>
              <font-awesome-icon
                icon="fa-solid fa-circle-xmark"
                style="margin-right: 5px"
              />
              Cerrar
            </q-btn>

            <q-btn
              flat
              class="btnGuardar"
              :loading="loadingGeneral"
              @click="validar()"
            >
              <font-awesome-icon
                icon="fa-solid fa-floppy-disk"
                style="margin-right: 5px"
              />
              Guardar Ficha
            </q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-layout>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { onBeforeMount } from "vue";
import { useQuasar } from "quasar";
import { useFichaStore } from "../stores/Ficha.js";
let inf = {};

const prompt = ref(false);
const inputCodigoFicha = ref("");
const inputNombreFicha = ref("");
const rows = ref([]);
const loadingGeneral = ref(false);
const loadingButtons = ref({});

let dialogTitle = ref("");
let editando = ref(false);
let fichaId = ref(null);
let q$ = useQuasar();
const options = ref([]);
let useFicha = useFichaStore();

onBeforeMount(() => {
  traer();
});

const traer = async () => {
  loadingGeneral.value = true;
  try {
    inf = await useFicha.listarFichas();
    console.log(inf);
    if (Array.isArray(inf.data)) {
      rows.value = inf.data;
      options.value = inf.data;
    } else {
      console.error("La respuesta no es un array:", inf.data);
      q$.notify({
        type: "negative",
        message: "Error al cargar las fichas.",
      });
    }
  } catch (error) {
    console.error("Error al cargar los datos:", error);
    q$.notify({
      type: "negative",
      message: "Error al conectar con el servidor.",
    });
  } finally {
    loadingGeneral.value = false;
  }
};

async function activar(id) {
  loadingButtons.value[id] = { ...loadingButtons.value[id], activar: true };
  try {
    inf = await useFicha.activar(id);
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
    inf = await useFicha.desactivar(id);
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

const validar = async () => {
  loadingGeneral.value = true;
  
  // Validar si los campos están vacíos o contienen solo espacios en blanco
  if (!inputCodigoFicha.value.trim() || !inputNombreFicha.value.trim()) {
    q$.notify({
      type: "negative",
      message: "Rellena todos los campos.",
    });
    loadingGeneral.value = false; // Detener la carga
    return; // Salir de la función
  }

  try {
    const token = localStorage.getItem("token");

    if (editando.value) {
      await useFicha.actualizar(
        fichaId.value,
        {
          codigo: inputCodigoFicha.value,
          nombre: inputNombreFicha.value,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } else {
      await useFicha.crearFichas(
        {
          codigo: inputCodigoFicha.value,
          nombre: inputNombreFicha.value,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }
    traer(); // Actualizar la tabla
    prompt.value = false;
  } catch (error) {
    q$.notify({
      type: "negative",
      message: "Error al guardar la ficha.",
    });
  } finally {
    loadingGeneral.value = false; // Detener la carga al final
  }
};

const dialogo = (accion, ficha = null) => {
  if (accion === "crear") {
    dialogTitle.value = "Crear ficha";
    inputCodigoFicha.value = "";
    inputNombreFicha.value = "";
    editando.value = false;
  } else if (accion === "editar" && ficha) {
    dialogTitle.value = "Editar Ficha";
    inputCodigoFicha.value = ficha.codigo;
    inputNombreFicha.value = ficha.nombre;
    fichaId.value = ficha._id;
    editando.value = true;
    loadingButtons.value[ficha._id] = {
      ...loadingButtons.value[ficha._id],
      editar: false,
    };
  }
  prompt.value = true;
};

const columns = ref([
  {
    name: "nombre1",
    required: true,
    label: "Nombre del programa",
    align: "center",
    field: "nombre",
    sortable: true,
  },
  {
    name: "codigo1",
    align: "center",
    label: "Numero de Ficha",
    field: "codigo",
    sortable: true,
  },
  {
    name: "estado1",
    label: "Estado",
    align: "center",
    field: "estado",
    sortable: true,
  },
  {
    name: "opciones",
    label: "Opciones",
    align: "center",
    sortable: true,
  },
]);

const preventNonNumeric = (event) => {
  // Permitir solo números y teclas de control (backspace, delete, arrows)
  if (
    !/[\d]/.test(event.key) &&
    !["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"].includes(
      event.key
    )
  ) {
    event.preventDefault();
  }
};

const formatInputCodigoFicha = (event) => {
  // Eliminar caracteres no numéricos del campo de entrada
  inputCodigoFicha.value = event.target.value.replace(/[^0-9]/g, "");
};
</script>

<style>
.activar,
.desactivar {
  color: white;
}
</style>
