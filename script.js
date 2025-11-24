document.addEventListener('DOMContentLoaded', () => {

    // --- REFERENCIAS Y EVENTOS ---
    const filasInput = document.getElementById('filas');
    const columnasInput = document.getElementById('columnas');
    const generarBtn = document.getElementById('generarBtn');
    const resolverBtn = document.getElementById('resolverBtn');
    const tablaContainer = document.getElementById('tabla-container');
    const pasosContainer = document.getElementById('pasos-container');
    const ponerdatosrandom = document.getElementById('datosrandom');

    generarBtn.addEventListener('click', () => generarTabla(0));
    resolverBtn.addEventListener('click', resolverMetodoHungaro);
    ponerdatosrandom.addEventListener('click', generaraleatorios);

    // --- FUNCIONES DE UTILIDAD ---
    function generarTabla(valor) {
        const filas = parseInt(filasInput.value);
        const columnas = parseInt(columnasInput.value);
        if (isNaN(filas) || isNaN(columnas) || filas <= 0 || columnas <= 0 || filas > 10 || columnas > 10) {
            alert("Por favor, introduce un número válido (máx 10x10).");
            return;
        }
        tablaContainer.innerHTML = '';
        pasosContainer.innerHTML = '';
        let tabla = '<table><thead><tr><th></th>'; // Esquina vacía
        for (let j = 0; j < columnas; j++) {
            tabla += `<th>Col ${j + 1}</th>`;
        }
        tabla += '</tr></thead><tbody>';
        for (let i = 0; i < filas; i++) {
            tabla += `<tr><th>Fila ${i + 1}</th>`;
            for (let j = 0; j < columnas; j++) {
                let val = (valor === 1) ? Math.floor(Math.random() * 20) + 1 : '';
                tabla += `<td><input type="number" class="dato-celda" value="${val}"></td>`;
            }
            tabla += '</tr>';
        }
        tabla += '</tbody></table>';
        tablaContainer.innerHTML = tabla;
        resolverBtn.classList.remove('oculto');
        ponerdatosrandom.classList.remove('oculto');
    }

    function generaraleatorios() { generarTabla(1); }

    function leerMatrizDeTabla() {
        const matriz = [];
        const filasTabla = tablaContainer.querySelectorAll('tbody tr');
        filasTabla.forEach(fila => {
            const filaArray = [];
            const inputs = fila.querySelectorAll('input.dato-celda');
            inputs.forEach(input => {
                filaArray.push(parseFloat(input.value) || 0);
            });
            matriz.push(filaArray);
        });
        return matriz;
    }

    // --- FUNCIÓN PRINCIPAL DE RESOLUCIÓN ---
    function resolverMetodoHungaro() {
        const matrizCostos = leerMatrizDeTabla();
        pasosContainer.innerHTML = '';
        
        // Paso 0: Matriz Original (Step 0 en PDF)
        renderizarPaso("Step 0: Matriz de Costos Original", matrizCostos);
        
        // Copia de trabajo
        const matrizTrabajo = matrizCostos.map(fila => [...fila]);

        try {
            const m = new SolucionadorHungaro(pasosContainer);
            const asignaciones = m.calcular(matrizTrabajo);
            mostrarResultadoFinal(matrizCostos, asignaciones);
        } catch (e) {
            console.error(e);
            pasosContainer.innerHTML += `<p style="color:red">Error: ${e.message}</p>`;
        }
    }

    // --- RENDERIZADOR VISUAL (ESTILO PDF MUNKRES) ---
    /**
     * Muestra la matriz con notación 0*, 0' y líneas de cobertura.
     */
    function renderizarPaso(titulo, matriz, filasCubiertas = [], columnasCubiertas = [], matrizMarcas = []) {
        let html = `<div class="paso"><h3>${titulo}</h3>`;
        html += '<table><tbody>';

        // Encabezados
        html += '<tr><th></th>';
        for(let j=0; j < matriz[0].length; j++) { html += `<th>Col ${j+1}</th>`; }
        html += '</tr>';

        for (let i = 0; i < matriz.length; i++) {
            html += `<tr><th>Fila ${i+1}</th>`;
            for (let j = 0; j < matriz[i].length; j++) {
                
                let clases = [];
                let contenido = matriz[i][j];

                // 1. Lógica de Líneas (Covered Rows/Cols)
                if (filasCubiertas[i]) clases.push('tachado-fila');
                if (columnasCubiertas[j]) clases.push('tachado-columna');
                if (filasCubiertas[i] && columnasCubiertas[j]) clases.push('interseccion');
                
                // 2. Lógica de Marcas (Stars & Primes)
                // matrizMarcas: 1 = Estrella, 2 = Prima
                if (matrizMarcas && matrizMarcas.length > 0) {
                    if (matrizMarcas[i][j] === 1) { // Starred Zero
                        contenido = `<span class="estrella">0*</span>`; 
                        clases.push('celda-estrella');
                    } else if (matrizMarcas[i][j] === 2) { // Primed Zero
                        contenido = `<span class="prima">0'</span>`;
                        clases.push('celda-prima');
                    } else if (matriz[i][j] === 0) {
                         clases.push('cero'); // Cero normal
                    }
                } else {
                     if (matriz[i][j] === 0) clases.push('cero');
                }

                html += `<td class="${clases.join(' ')}">${contenido}</td>`;
            }
            html += '</tr>';
        }
        
        html += '</tbody></table></div>';
        pasosContainer.innerHTML += html;
    }

    function mostrarResultadoFinal(matrizOriginal, asignaciones) {
        let html = `<div class="paso"><h3>DONE: Asignación Óptima</h3>`;
        html += '<p>Los recuadros verdes indican la asignación final (Estrellas).</p><table><tbody>';

        html += '<tr><th></th>';
        for(let j=0; j < matrizOriginal[0].length; j++) { html += `<th>Col ${j+1}</th>`; }
        html += '</tr>';

        const asignMap = {};
        asignaciones.forEach(par => asignMap[par[0]] = par[1]);

        let costoTotal = 0;
        for (let i = 0; i < matrizOriginal.length; i++) {
            html += `<tr><th>Fila ${i+1}</th>`;
            for (let j = 0; j < matrizOriginal[i].length; j++) {
                if (asignMap[i] === j) {
                    html += `<td class="resultado-final">${matrizOriginal[i][j]}</td>`;
                    costoTotal += matrizOriginal[i][j];
                } else {
                    html += `<td>${matrizOriginal[i][j]}</td>`;
                }
            }
            html += '</tr>';
        }
        html += '</tbody></table>';
        html += `<h3>Costo Total Mínimo: ${costoTotal}</h3></div>`;
        pasosContainer.innerHTML += html;
    }


    // --- ALGORITMO MUNKRES (6 PASOS DEL PDF) ---
    var VALOR_MAXIMO = parseInt(Number.MAX_SAFE_INTEGER/2);

    function SolucionadorHungaro(contenedorPasos) {
      this.C = null; // Matriz de Costos
      this.RowCover = []; // Vectores de cobertura
      this.ColCover = []; 
      this.M = null; // Matriz de Máscara (Marcas): 1=Estrella, 2=Prima
      this.nrow = 0;
      this.ncol = 0;
      this.path = null;
      this.path_count = 0;
      this.contenedorPasos = contenedorPasos || null; 
    }

    // Función auxiliar para registrar el estado visual
    SolucionadorHungaro.prototype._registrarPaso = function(titulo) {
        if (this.contenedorPasos) {
            // Copia profunda para visualización
            const matrizCopia = this.C.map(fila => fila.map(val => val));
            // Copia de marcas
            const marcasCopia = this.M.map(fila => fila.map(val => val));
            
            renderizarPaso(
                titulo, 
                matrizCopia, 
                this.RowCover, 
                this.ColCover,
                marcasCopia
            );
        }
    }

    // Inicializar y Ejecutar (Main Loop del PDF)
    SolucionadorHungaro.prototype.calcular = function(matrizCostos) {
        // Step 0: Inicialización
        this.C = this._rellenarMatriz(matrizCostos, 0);
        this.nrow = this.C.length;
        this.ncol = this.C[0].length;
        this.filasOriginales = matrizCostos.length;
        this.columnasOriginales = matrizCostos[0].length;

        this.RowCover = new Array(this.nrow).fill(0);
        this.ColCover = new Array(this.ncol).fill(0);
        this.M = this._crearMatriz(this.nrow, this.ncol, 0);
        this.path = this._crearMatriz(this.nrow * 2 + 1, 2, 0);

        var step = 1;
        var done = false;

        while (!done) {
            // Mostramos el estado ANTES de ejecutar el paso (para ver entradas)
            // O después, según preferencia. El PDF describe acciones imperativas.
            
            switch (step) {
                case 1:
                    step = this._step_one(); 
                    this._registrarPaso("Step 1: Reducción de Filas");
                    break;
                case 2:
                    step = this._step_two();
                    this._registrarPaso("Step 2: Estrellar Ceros (Asignación Inicial)");
                    break;
                case 3:
                    step = this._step_three();
                    this._registrarPaso("Step 3: Cubrir Columnas con Estrellas");
                    break;
                case 4:
                    step = this._step_four();
                    // Este paso es complejo visualmente porque cambia cubiertas dinámicamente
                    this._registrarPaso("Step 4: Buscar Ceros Primos (Modificar Cubiertas)");
                    break;
                case 5:
                    step = this._step_five();
                    this._registrarPaso("Step 5: Camino Aumentante (Invertir Estrellas/Primas)");
                    break;
                case 6:
                    step = this._step_six();
                    this._registrarPaso("Step 6: Ajustar Matriz (Sumar/Restar Mínimo)");
                    break;
                case 7:
                    done = true;
                    break;
            }
        }

        // Recolectar resultados
        var resultados = [];
        for (var i = 0; i < this.filasOriginales; ++i)
            for (var j = 0; j < this.columnasOriginales; ++j)
                if (this.M[i][j] == 1) resultados.push([i, j]);
        return resultados;
    };

    // --- IMPLEMENTACIÓN DE LOS 6 PASOS (LITERAL PDF) ---

    // Step 1: Subtract min from each row
    SolucionadorHungaro.prototype._step_one = function() {
        for (var r = 0; r < this.nrow; r++) {
            var min_in_row = this.C[r][0];
            for (var c = 0; c < this.ncol; c++) 
                if (this.C[r][c] < min_in_row) min_in_row = this.C[r][c];
            for (var c = 0; c < this.ncol; c++) 
                this.C[r][c] -= min_in_row;
        }
        return 2;
    };

    // Step 2: Find zero, star it if unique in row/col
    SolucionadorHungaro.prototype._step_two = function() {
        for (var r = 0; r < this.nrow; r++) {
            for (var c = 0; c < this.ncol; c++) {
                if (this.C[r][c] === 0 && this.RowCover[r] === 0 && this.ColCover[c] === 0) {
                    this.M[r][c] = 1; // Star
                    this.RowCover[r] = 1;
                    this.ColCover[c] = 1;
                }
            }
        }
        // Clear covers for next step
        this._clear_covers();
        return 3;
    };

    // Step 3: Cover columns with stars
    SolucionadorHungaro.prototype._step_three = function() {
        var colcount = 0;
        for (var r = 0; r < this.nrow; r++) {
            for (var c = 0; c < this.ncol; c++) {
                if (this.M[r][c] === 1) this.ColCover[c] = 1;
            }
        }
        for (var c = 0; c < this.ncol; c++) {
            if (this.ColCover[c] === 1) colcount++;
        }
        
        if (colcount >= this.ncol || colcount >= this.nrow) return 7; // DONE
        return 4;
    };

    // Step 4: Find noncovered zero and prime it
    SolucionadorHungaro.prototype._step_four = function() {
        var row = -1;
        var col = -1;
        var done = false;

        while (!done) {
            var res = this._find_a_zero();
            row = res[0]; col = res[1];

            if (row === -1) {
                return 6; // No more zeros, go to Step 6
            } else {
                this.M[row][col] = 2; // Prime it
                
                // Check if there is a star in this row
                if (this._star_in_row(row)) {
                    col = this._find_star_in_row(row);
                    this.RowCover[row] = 1; // Cover Row
                    this.ColCover[col] = 0; // Uncover Column
                } else {
                    // No star in row -> Found augmenting path start
                    this.path_row_0 = row;
                    this.path_col_0 = col;
                    return 5;
                }
            }
        }
    };

    // Step 5: Augmenting Path
    SolucionadorHungaro.prototype._step_five = function() {
        var done = false;
        var r = -1;
        var c = -1;
        
        this.path_count = 1;
        this.path[0][0] = this.path_row_0;
        this.path[0][1] = this.path_col_0;

        while (!done) {
            // Find star in column of last primed zero
            r = this._find_star_in_col(this.path[this.path_count - 1][1]);
            if (r > -1) {
                this.path_count++;
                this.path[this.path_count - 1][0] = r;
                this.path[this.path_count - 1][1] = this.path[this.path_count - 2][1];
            } else {
                done = true;
            }

            if (!done) {
                // Find prime in row of last starred zero
                c = this._find_prime_in_row(this.path[this.path_count - 1][0]);
                this.path_count++;
                this.path[this.path_count - 1][0] = this.path[this.path_count - 2][0];
                this.path[this.path_count - 1][1] = c;
            }
        }
        
        this._augment_path();
        this._clear_covers();
        this._erase_primes();
        return 3;
    };

    // Step 6: Adjust Matrix
    SolucionadorHungaro.prototype._step_six = function() {
        var minval = this._find_smallest();
        
        for (var r = 0; r < this.nrow; r++) {
            for (var c = 0; c < this.ncol; c++) {
                if (this.RowCover[r] === 1) this.C[r][c] += minval;
                if (this.ColCover[c] === 0) this.C[r][c] -= minval;
            }
        }
        return 4;
    };

    // --- MÉTODOS AUXILIARES ---
    SolucionadorHungaro.prototype._find_a_zero = function() {
        for (var r = 0; r < this.nrow; r++)
            for (var c = 0; c < this.ncol; c++)
                if (this.C[r][c] === 0 && this.RowCover[r] === 0 && this.ColCover[c] === 0)
                    return [r, c];
        return [-1, -1];
    };
    SolucionadorHungaro.prototype._star_in_row = function(row) {
        for (var c = 0; c < this.ncol; c++)
            if (this.M[row][c] === 1) return true;
        return false;
    };
    SolucionadorHungaro.prototype._find_star_in_row = function(row) {
        for (var c = 0; c < this.ncol; c++)
            if (this.M[row][c] === 1) return c;
        return -1;
    };
    SolucionadorHungaro.prototype._find_star_in_col = function(col) {
        for (var r = 0; r < this.nrow; r++)
            if (this.M[r][col] === 1) return r;
        return -1;
    };
    SolucionadorHungaro.prototype._find_prime_in_row = function(row) {
        for (var c = 0; c < this.ncol; c++)
            if (this.M[row][c] === 2) return c;
        return -1;
    };
    SolucionadorHungaro.prototype._find_smallest = function() {
        var minval = VALOR_MAXIMO;
        for (var r = 0; r < this.nrow; r++)
            for (var c = 0; c < this.ncol; c++)
                if (this.RowCover[r] === 0 && this.ColCover[c] === 0)
                    if (minval > this.C[r][c]) minval = this.C[r][c];
        return minval;
    };
    SolucionadorHungaro.prototype._augment_path = function() {
        for (var p = 0; p < this.path_count; p++) {
            var r = this.path[p][0];
            var c = this.path[p][1];
            if (this.M[r][c] === 1) this.M[r][c] = 0;
            else this.M[r][c] = 1;
        }
    };
    SolucionadorHungaro.prototype._clear_covers = function() {
        for (var i = 0; i < this.nrow; i++) this.RowCover[i] = 0;
        for (var i = 0; i < this.ncol; i++) this.ColCover[i] = 0;
    };
    SolucionadorHungaro.prototype._erase_primes = function() {
        for (var r = 0; r < this.nrow; r++)
            for (var c = 0; c < this.ncol; c++)
                if (this.M[r][c] === 2) this.M[r][c] = 0;
    };
    SolucionadorHungaro.prototype._crearMatriz = function(r, c, val) {
        var m = [];
        for(var i=0; i<r; i++) { m[i] = []; for(var j=0; j<c; j++) m[i][j]=val; }
        return m;
    };
    SolucionadorHungaro.prototype._rellenarMatriz = function(matriz, valorRelleno) {
        // Asegurar cuadrada y rotar si necesario
        var max = Math.max(matriz.length, matriz[0].length);
        var m = this._crearMatriz(max, max, valorRelleno);
        for(var i=0; i<matriz.length; i++)
            for(var j=0; j<matriz[i].length; j++)
                m[i][j] = matriz[i][j];
        return m;
    };

});