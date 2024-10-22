<template>
  <div>
    <div class="table-container">
      <table class="responsive-table">
        <thead>
          <tr>
            <th colspan="12">REGISTRO DE ASISTENCIA Y APROBACIÓN DEL ACTA No- {{ actaNumber }} DEL DÍA {{ day }} DEL MES DE {{ nameMonth }} DEL AÑO {{ year }}</th>
          </tr>
          <tr>
            <th colspan="2">OBJETIVO (S)</th>
            <th colspan="10"></th>
          </tr>
          <tr>
            <th>No.</th>
            <th>Nombres y Apellidos</th>
            <th>No. Documento</th>
            <th>Planta</th>
            <th>Contratista</th>
            <th>Otro ¿Cuál?</th>
            <th>Dependencia/Empresa</th>
            <th>Correo Electrónico</th>
            <th>Teléfono/Ext. SENA</th>
            <th>Autoriza Grabación</th>
            <th>Firma o Participación Virtual</th>
            <th>Hora de Registro</th> <!-- Nueva columna -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in displayedRows" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ row.nombre }}</td>
            <td>{{ row.cedula }}</td>
            <td>{{ row.planta }}</td>
            <td>{{ row.contratista }}</td>
            <td>{{ row.otro }}</td>
            <td>{{ row.dependencia }}</td>
            <td>{{ row.correo }}</td>
            <td>{{ row.telefono }}</td>
            <td>{{ row.autorizaGrabacion }}</td>
            <td id="imagenFirma">
              <!-- Mostrar imagen si hay firma, de lo contrario, dejar celda en blanco -->
              <img v-if="row.firma" :src="row.firma" alt="Firma" class="firma-imagen" />
            </td>
            <td>{{ row.hora }}</td> <!-- Mostrar hora en la nueva columna -->
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import { useBitacoraStore } from "../stores/bitacora.js";

let day = ref("_");
let numberMonth = ref("_");
let nameMonth = ref("_");
let year = ref("_");

const months = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO",
  "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
];

const actaNumber = ref("_");

const rows = ref([]);
const displayedRows = ref([]);

const useBitacora = useBitacoraStore();

onBeforeMount(() => {
  traerBitacorasFiltradas();
  fillRemainingRows();
  obtenerFechaActual();
});

function traerBitacorasFiltradas() {
  rows.value = useBitacora.bitacorasFiltradas
    .filter(bitacora => bitacora.estado === "Asistió")
    .map(bitacora => ({
      nombre: bitacora.id_aprendiz?.nombre || "",
      cedula: bitacora.id_aprendiz?.documento || "",
      planta: "",
      contratista: "",
      otro: "",
      dependencia: "",
      correo: bitacora.id_aprendiz?.email || "",
      telefono: bitacora.id_aprendiz?.telefono || "",
      autorizaGrabacion: "",
      firma: bitacora.id_aprendiz?.firma || "",
      hora: bitacora.hora || obtenerHoraActual(), // Nueva propiedad hora
    }));

  fillRemainingRows();
}

function fillRemainingRows() {
  displayedRows.value = rows.value.length >= 27 ? rows.value : rows.value.concat(
    Array(27 - rows.value.length).fill({
      nombre: '', 
      cedula: '', 
      planta: '', 
      contratista: '',
      otro: '', 
      dependencia: '', 
      correo: '', 
      telefono: '',
      autorizaGrabacion: '', 
      firma: '',
      hora: '', // Añadir campo vacío para la hora
    })
  );
}

function obtenerFechaActual() {
  const fecha = new Date();
  day.value = fecha.getDate();
  numberMonth.value = fecha.getMonth();
  nameMonth.value = months[fecha.getMonth()];
  year.value = fecha.getFullYear();
}

function obtenerHoraActual() {
  const fecha = new Date();
  return `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
}
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  width: 100%;
  padding: 1%;
}

.responsive-table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  word-wrap: break-word;
}

.responsive-table th, .responsive-table td {
  border: 1px solid #000000;
  text-align: center;
  font-size: 12px;
  padding: 5px;
}

.responsive-table td {
  padding: 5px !important;
}

.responsive-table th {
  font-weight: bold;
  padding: 5px;
}

.responsive-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

#imagenFirma {
  padding: 0px !important;
}

#imagenFirma img {
  height: 50px !important;
  padding: 0px !important;
}

@media screen and (max-width: 1024px) {
  .responsive-table th, .responsive-table td {
    font-size: 10px;
    padding: 7px;
  }
}

@media screen and (max-width: 480px) {
  .responsive-table th, .responsive-table td {
    font-size: 9px;
    padding: 5px;
  }
}

@media print {
  @page {
    size: letter landscape;
    margin: 10mm;
  }

  .table-container {
    overflow: visible;
    width: 100%;
    padding: 0;
  }

  .responsive-table {
    width: 100%;
  }

  .responsive-table th, .responsive-table td {
    font-size: 9px;
    padding: 4px;
  }

  html, body {
    width: 100%;
    height: 100%;
  }
  
  body {
    transform: scale(0.8);
    transform-origin: 0 0;
  }
  
  .responsive-table {
    page-break-inside: avoid;
  }
}
</style>
