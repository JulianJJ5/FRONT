<template>
  <div class="q-pa-md">
    <q-layout view="lHh Lpr lff">
      <br />
      <q-dialog v-model="prompt" persistent :style="{ zIndex: 1000 }">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h5 tituloCuadroDeDialogo">{{ dialogTitle }}</div>
          </q-card-section>

          <q-select
            filled
            clearable
            v-model="selectedAprendiz"
            :options="aprendices"
            use-input
            option-label="documento"
            option-value="_id"
            :rules="[val => !!val || 'Este campo es obligatorio']"
            label="Seleccionar Aprendiz"
            autofocus
            :disable="loading"
            
          >
          
            <template v-slot:prepend>
              <font-awesome-icon icon="user-graduate" />
            </template>
          </q-select>

          <q-input
            filled
            v-model="fecha"
            label="Seleccionar fecha"
            :rules="[val => !!val || 'Este campo es obligatorio']"
            type="date"
            :disable="loading"
          >
            <template v-slot:prepend>
              <font-awesome-icon icon="spell-check" />
            </template>
          </q-input>

          <q-card-actions align="right" class="text-primary1">
            <q-btn flat v-close-popup class="btnCerrar" :disable="loading">
              <font-awesome-icon
                icon="fa-solid fa-circle-xmark"
                style="margin-right: 5px"
              />
              Cerrar
            </q-btn>
            <q-btn
              flat
              class="btnGuardar"
              @click="validar"
              :loading="loading"
              :disable="loading"
            >
              <font-awesome-icon
                icon="fa-solid fa-floppy-disk"
                style="margin-right: 5px"
              />
              Guardar Bitacora
            </q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-table
        title="BITÁCORAS"
        :rows="rows"
        :columns="columns"
        row-key="name"
        pagination.sync="pagination"
        :rows-per-page-options="[20, 50, 100, 0]"
        :loading="loading"
      >
        <div>
          <hr style="border: 1px solid black; width: 50%; margin: auto" />
        </div>
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-form>
              <q-select
                v-model="props.row.estado"
                :options="estados"
                label="Estado"
                filled
                :disable="loading"
                @update:model-value="
                  (valor) => cambiarEstado(props.row._id, valor)
                "
              />
            </q-form>
          </q-td>
        </template>
      </q-table>
    </q-layout>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import { useQuasar } from "quasar";
import { useBitacoraStore } from "../stores/bitacora.js";
import { useAprendizStore } from "../stores/aprendiz.js";
import { useFichaStore } from "../stores/Ficha.js"

onBeforeMount(() => {
  traer();
  cargarAprendices();
  obtenerFechaActual();
});

let dia = ref(null);
let mesNumero = ref(null);
let mesNombre = ref(null);
let anio = ref(null);

const meses = ref([
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre,",
  "Noviembre",
  "Diciembre",
]);
const prompt = ref(false);
const loading = ref(false);
const selectedAprendiz = ref(null);
const fecha = ref(null);
const aprendices = ref([]);
const fichas = ref([]);
const dialogTitle = ref("");
const q$ = useQuasar();
const estados = ref(["Asistió", "No Asistió", "Pendiente", "Excusa"]);
const useBitacora = useBitacoraStore();
const useAprendiz = useAprendizStore();
const useFicha = useFichaStore();
const rows = ref([]);
const columns = ref([
{
    name: "nombre",
    required: true,
    label: "Nombre del Aprendiz",
    align: "center",
    field: "nombre",
    sortable: true,
  },
  {
    name: "cedulaAprendiz",
    required: true,
    label: "Cédula del Aprendiz",
    align: "center",
    field: "cedulaAprendiz",
    sortable: true,
  },
  {
    name: 'nombreFicha',
    label: 'Ficha',
    align: 'center',
    field: 'nombreFicha',
    sortable: true,
  },
  {
    name: 'codigoFicha',
    label: 'Código de Ficha',
    align: 'center',
    field: 'codigoFicha',
    sortable: true,
  },
  {
    name: "fecha1",
    align: "center",
    label: "Fecha",
    field: "fecha",
    sortable: true,
  },
  {
    name: "opciones",
    label: "Estado",
    align: "center",
    sortable: true,
  },
]);

async function traer() {
  loading.value = true;
  try {
    let response = await useBitacora.listarTodo();
    let response2 = await useAprendiz.listarAprendiz();
    let response3 = await useFicha.listarFichas();

    console.log('Respuesta get bitacoras:  ',response)

    rows.value = response.data.bitacoras.map((bitacora) => {
      let aprendiz = response2.data.find(
        (aprendiz) => aprendiz?._id === bitacora?.id_aprendiz
      );
      let ficha = response3.data.find(
        (ficha) => ficha?._id === aprendiz?.id_ficha
      );

      return {
        ...bitacora,
        cedulaAprendiz: aprendiz?.documento || "No disponible",
        nombre: aprendiz?.nombre || "Desconocido",
        fecha: formatFecha(bitacora?.fecha || new Date()),
        nombreFicha: ficha?.nombre || "Sin Ficha",
        codigoFicha: ficha?.codigo || "Sin Código",
      };
    });
  } finally {
    loading.value = false;
  }
}


function obtenerFechaActual() {
  const fecha = new Date();

  dia = fecha.getDate();
  mesNumero = fecha.getMonth();
  mesNombre.value = meses.value[fecha.getMonth()];
  anio = fecha.getFullYear();

  console.log(fecha);

  return {
    día: dia,
    mesNumero: mesNumero,
    mesNombre: mesNombre,
    año: anio,
  };
}

async function cargarAprendices() {
  loading.value = true;
  try {
    const response = await useAprendiz.listarAprendiz();
    
    aprendices.value = response.data.map((aprendiz) => ({
      _id: aprendiz._id,
      documento: `${aprendiz.documento} - ${aprendiz.nombre}`,
    }));
  } catch (error) {
    q$.notify({
      type: "negative",
      message: "Error al cargar los aprendices.",
    });
    console.error("Error al cargar los aprendices:", error);
  } finally {
    loading.value = false;
  }
}

const cambiarEstado = async (id, estado) => {
  try {
    loading.value = true;
    await useBitacora.actualizarEstado(id, estado);
    await traer();
  } catch (error) {
    console.error("Error al cambiar estado:", error);
  } finally {
    loading.value = false;
  }
};

function formatFecha(fecha) {
  const date = new Date(fecha);
  const offset = date.getTimezoneOffset();
  date.setMinutes(date.getMinutes() + offset);

  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return date.toLocaleDateString("es-ES", options);
}




const dialogo = (accion, bitacora = null) => {
  if (accion === "crear") {
    dialogTitle.value = "Crear Bitácora";
    selectedAprendiz.value = null;
    fecha.value = null;
  } else if (accion === "editar" && bitacora) {
    dialogTitle.value = "Editar Bitácora";
    selectedAprendiz.value =
      aprendices.value.find(
        (aprendiz) => aprendiz._id === bitacora.aprendizId
      ) || null;
    fecha.value = bitacora.fecha || null;
  }
  prompt.value = true;
};

const validar = async () => {
  if (!selectedAprendiz.value || !fecha.value) {
    q$.notify({
      type: "negative",
      message: "Rellena todos los campos.",
    });
    return;
  }

  loading.value = true;
  try {
    const bitacoraData = {
      id_aprendiz: selectedAprendiz.value,
      fecha: fecha.value,
    };

    if (dialogTitle.value === "Editar Bitácora") {
      await useBitacora.actualizar(bitacoraData);
    } else {
      await useBitacora.crearBitacora(bitacoraData);
    }

    await traer();
    prompt.value = false;
  } catch (error) {
    q$.notify({
      type: "negative",
      message: "Error al guardar la bitácora.",
    });
    console.error(
      "Error al guardar la bitacora:",
      error.response ? error.response.data : error.message
    );
  } finally {
    loading.value = false;
  }
};

</script>

<style>
.botones {
  display: flex !important;
  justify-content: space-between !important;
  align-items: end !important;
}

.q-table__container div {
  justify-content: center;
}

.q-table__container > div:first-child {
  border-bottom: rgb(0, 136, 11) 4px solid;
  padding: 2%;
}

.q-table--horizontal-separator thead th,
.q-table--horizontal-separator tbody tr:not(:last-child) > td,
.q-table--cell-separator thead th,
.q-table--cell-separator tbody tr:not(:last-child) > td {
  border-bottom-width: 3px !important;
}

.q-table__top {
  padding: 3px !important;
}

th.text-center {
  font-size: 15px !important;
  font-weight: bold !important;
  color: rgb(1, 87, 0);
}

td {
  padding: 2% !important;
}
</style>
