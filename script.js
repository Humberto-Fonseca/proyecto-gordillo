// Esperar a que todo el contenido HTML esté cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

    // 1. OBTENER REFERENCIAS A LOS ELEMENTOS DEL DOM
    const filasInput = document.getElementById('filas');
    const columnasInput = document.getElementById('columnas');
    const generarBtn = document.getElementById('generarBtn');
    const leerDatosBtn = document.getElementById('leerDatosBtn');
    const tablaContainer = document.getElementById('tabla-container');
    const resultadoMatriz = document.getElementById('resultado-matriz');

    // 2. ASIGNAR EVENTOS
    generarBtn.addEventListener('click', generarTabla);
    leerDatosBtn.addEventListener('click', leerMatriz);

    /**
     * Función para generar la tabla dinámicamente en el DOM.
     */
    function generarTabla() {
        // Obtener y validar los valores de los inputs
        const filas = parseInt(filasInput.value);
        const columnas = parseInt(columnasInput.value);

        if (isNaN(filas) || isNaN(columnas) || filas <= 0 || columnas <= 0) {
            alert("Por favor, introduce un número válido de filas y columnas (mayor que 0).");
            return;
        }

        // Limpiar el contenedor antes de generar una nueva tabla
        tablaContainer.innerHTML = '';
        resultadoMatriz.textContent = ''; // Limpiar resultado anterior

        // Crear la estructura de la tabla
        let tabla = document.createElement('table');
        let thead = document.createElement('thead');
        let tbody = document.createElement('tbody');

        // --- Crear la Fila de Encabezados (Columnas) ---
        // Esta es la "columna extra" (la primera celda vacía) y la "fila extra" (los encabezados)
        let filaEncabezado = document.createElement('tr');
        
        // Celda de esquina vacía
        let thVacio = document.createElement('th');
        thVacio.textContent = 'Fila/Col';
        filaEncabezado.appendChild(thVacio);

        // Encabezados de las columnas (Col 1, Col 2, ...)
        for (let j = 0; j < columnas; j++) {
            let th = document.createElement('th');
            th.textContent = `Col ${j + 1}`;
            filaEncabezado.appendChild(th);
        }
        thead.appendChild(filaEncabezado);

        // --- Crear las Filas de Datos (Cuerpo de la tabla) ---
        for (let i = 0; i < filas; i++) {
            let tr = document.createElement('tr');
            // Encabezado de la fila (Fila 1, Fila 2, ...)
            let thFila = document.createElement('th');
            thFila.textContent = `Fila ${i + 1}`;
            tr.appendChild(thFila);

            // Celdas con inputs numéricos
            for (let j = 0; j < columnas; j++) {
                let td = document.createElement('td');
                let input = document.createElement('input');
                input.type = 'number';
                input.placeholder = '0'; // Valor por defecto visual
                input.classList.add('dato-celda'); // Clase para identificar los inputs
                td.appendChild(input);
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }

        // Ensamblar la tabla
        tabla.appendChild(thead);
        tabla.appendChild(tbody);
        tablaContainer.appendChild(tabla);

        // Mostrar el botón de "Leer Datos"
        leerDatosBtn.classList.remove('oculto');
    }

    /**
     * Función para leer los datos de la tabla y generar la matriz en JS.
     */
    function leerMatriz() {
        const matriz = [];
        // Seleccionar todas las filas del cuerpo de la tabla (tbody)
        const filasTabla = tablaContainer.querySelectorAll('tbody tr');
        if (filasTabla.length === 0) {
            alert("Primero debes generar la tabla.");
            return;
        }
        // Recorrer cada fila de la tabla
        filasTabla.forEach((fila) => {
            const filaArray = [];
            // Seleccionar todos los inputs dentro de esa fila
            // Usamos .querySelectorAll('input.dato-celda') para asegurarnos
            const inputs = fila.querySelectorAll('input.dato-celda');
            
            // Recorrer cada input de la fila
            inputs.forEach((input) => {
                // parseFloat para incluir decimales, || 0 para celdas vacías
                const valor = parseFloat(input.value) || 0; 
                filaArray.push(valor);
            });
            
            matriz.push(filaArray);
        });

        // Mostrar la matriz resultante en el <pre>
        // JSON.stringify(matriz, null, 2) formatea el array para que se vea bonito
    // esta funcion la hizo la ia pero esto no se ocupa como tal:  resultadoMatriz.textContent = JSON.stringify(matriz, null, 2);
    }
});