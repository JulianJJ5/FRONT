<template>
  <div class="q-pa-md">
    <q-layout view="lHh Lpr lff">
      <div class="filtros">
        <q-input
          filled
          v-model="fechaBuscada"
          label="Seleccionar fecha"
          type="date"
          :disable="loading"
        />

        <q-select
          filled
          v-model="fichaBuscada"
          use-input
          input-debounce="0"
          label="Seleccionar ficha"
          :options="filteredFichas"
          @filter="filterFn"
          behavior="menu"
          emit-value
          map-options
          lazy-rules
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"
                >No hay resultados</q-item-section
              >
            </q-item>
          </template>
        </q-select>

        <div id="divBtnBuscar">
          <q-btn
            class="colorCorporativo"
            :disable="loading"
            @click="buscarBitacoras"
            >Buscar
          </q-btn>
          <q-btn 
          :disable="loading" 
          class="crearPDF colorCorporativo" 
          to="/Tabla"
          >
          <font-awesome-icon icon="file-invoice" style="color: #ffffff" 
          />
        </q-btn>
        </div>
      </div>


      <!-- Tabla para mostrar las bitácoras -->
      <div class="q-mt-md">
        <q-table
          title="INFORMES"
          :rows="rows"
          :columns="columns"
          row-key="_id"
          pagination.sync="pagination"
          :rows-per-page-options="[20, 50, 100, 0]"
          :loading="loading"
        >
          <template v-slot:empty>
            <div class="text-center q-pa-md">
              <q-icon name="warning" size="2rem" color="warning" />
              <p>No se encontraron bitácoras.</p>
            </div>
          </template>
        </q-table>
      </div>
    </q-layout>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import { useQuasar } from "quasar";
import { useBitacoraStore } from "../stores/bitacora.js";
import { useFichaStore } from "../stores/Ficha.js";

// Stores
const useFicha = useFichaStore();
const useBitacora = useBitacoraStore();

const loading = ref(false);
const $q = useQuasar();
const fichaBuscada = ref(null);
const fechaBuscada = ref("");
const fichas = ref([]);
const filteredFichas = ref([]); // Fichas filtradas dinámicamente
const rows = ref([]); // Bitácoras obtenidas
const columns = [
  {
    name: 'nombreAprendiz',
    label: 'Nombre del Aprendiz',
    align: 'center',
    field: row => row.id_aprendiz?.nombre || 'Desconocido',
    sortable: true,
  },
  {
    name: 'cedulaAprendiz',
    label: 'Cédula del Aprendiz',
    align: 'center',
    field: row => row.id_aprendiz?.documento || 'Sin Documento',
    sortable: true,
  },
  {
    name: 'codigoFicha',
    label: 'Código de Ficha',
    align: 'center',
    field: row => row.codigoFicha || 'Sin Ficha',
    sortable: true,
  },
  {
    name: 'estado',
    label: 'Estado',
    align: 'center',
    field: 'estado',
    sortable: true,
  }
];


// Cargar fichas al montar
onBeforeMount(() => {
  traerFichas();
});

// Función para traer fichas
async function traerFichas() {
  loading.value = true;
  try {
    const inf = await useFicha.listarFichas();
    fichas.value = inf.data.map((ficha) => ({
      label: ficha.codigo, // Mostrar el código como opción visible
      value: ficha._id, // El valor interno es el ID
    }));
    filteredFichas.value = fichas.value; // Inicialmente, todas las fichas están disponibles
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Error al cargar las fichas.",
    });
    console.error("Error al cargar las fichas:", error);
  } finally {
    loading.value = false;
  }
}

// Función de filtrado para el q-select
function filterFn(val, update) {
  update(() => {
    const search = val.toLowerCase();
    // Filtramos las fichas que coinciden con el texto ingresado
    filteredFichas.value = fichas.value.filter((ficha) =>
      ficha.label.toLowerCase().includes(search)
    );
  });
}

const buscarBitacoras = async () => {
  loading.value = true;
  try {
    // Validar la fecha
    if (!fechaBuscada.value) {
      $q.notify({
        type: "warning",
        message: "Por favor ingrese la fecha.",
      });
      return;
    }

    // Obtener bitácoras por fecha
    const responseFecha = await useBitacora.listarPorFecha(fechaBuscada.value);
    if (!responseFecha.data || !responseFecha.data.bitacoras.length) {
      $q.notify({
        type: "warning",
        message: "No se encontraron bitácoras para la fecha ingresada.",
      });
      return;
    }

    const bitacorasEncontradas = responseFecha.data.bitacoras.map((b) => b._id);

    // Obtener bitácoras por ficha
    if (!fichaBuscada.value) {
      $q.notify({
        type: "warning",
        message: "Por favor seleccione una ficha.",
      });
      return;
    }

    // Obtener el objeto de la ficha seleccionada
    const fichaSeleccionada = fichas.value.find(ficha => ficha.value === fichaBuscada.value);
    const codigoFichaSeleccionada = fichaSeleccionada ? fichaSeleccionada.label : 'Sin Ficha';

    const responseFicha = await useBitacora.listarPorFicha(fichaBuscada.value);
    if (!responseFicha.data || !responseFicha.data.bitacoras.length) {
      $q.notify({
        type: "warning",
        message: "No se encontraron bitácoras para la ficha seleccionada.",
      });
      return;
    }

    // Filtrar las bitácoras por fecha y ficha y añadir el código de ficha a cada una
    const bitacorasFiltradas = responseFicha.data.bitacoras.filter((bitacora) =>
      bitacorasEncontradas.includes(bitacora._id)
    ).map((bitacora) => ({
      ...bitacora,
      codigoFicha: codigoFichaSeleccionada // Añadir el código de la ficha seleccionada
    }));

    // Asignar las bitácoras filtradas a rows
    rows.value = bitacorasFiltradas;

    if (rows.value.length === 0) {
      $q.notify({
        type: "warning",
        message:
          "No se encontraron bitácoras para la ficha y la fecha seleccionadas.",
      });
    }
    useBitacora.setBitacorasFiltradas(rows.value);

  } catch (error) {
    console.error("Detalles del error:", error.response);
    $q.notify({
      type: "negative",
      message: error.message || "Error al buscar las bitácoras.",
    });
  } finally {
    loading.value = false;
  }
};


</script>


<style>
.filtros {
  display: flex;
  gap: 5%;
  justify-content: center;
}

.filtro {
  padding-inline: 10% !important;
}

#divBtnBuscar {
  align-content: center !important;
  justify-content: center !important;
  align-items: center !important;
  display: flex;
  top: 20px !important;
  position: relative !important;
  gap: 10% !important;
  height: 100%;
}

.box {
  width: 100%;
  display: flex;
  justify-content: end;
}

.crearPDF{
  width: 3% !important;
  margin-right: 5% !important;
  margin-left: 5% !important;
}
</style>
