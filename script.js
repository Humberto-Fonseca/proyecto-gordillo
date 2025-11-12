document.addEventListener('DOMContentLoaded', () => {
    const filasInput = document.getElementById('filas');
    const columnasInput = document.getElementById('columnas');
    const generarBtn = document.getElementById('generarBtn');
    const resolverBtn = document.getElementById('resolverBtn');
    const tablaContainer = document.getElementById('tabla-container');
    const pasosContainer = document.getElementById('pasos-container');
    const ponerdatosrandom = document.getElementById('datosrandom');

    generarBtn.addEventListener('click', generarTabla);
    resolverBtn.addEventListener('click', resolverMetodoHungaro);
    ponerdatosrandom.addEventListener('click', generaraleatorios);

    /*Genera la tabla de entrada para que el usuario ponga los datos.*/
    function generarTabla(valor) {
        const filas = parseInt(filasInput.value);
        const columnas = parseInt(columnasInput.value);

        if (isNaN(filas) || isNaN(columnas) || filas <= 0 || columnas <= 0 || filas > 10  || columnas > 10) {
            alert("Por favor, introduce un número válido de filas y columnas.");
            return;
        }
        // Limpiar contenedores anteriores
        tablaContainer.innerHTML = '';
        pasosContainer.innerHTML = '';
        let tabla = '<table><thead><tr><th>Fila/Col</th>';
        for (let j = 0; j < columnas; j++) {
            tabla += `<th>Col ${j + 1}</th>`;
        }
        tabla += '</tr></thead><tbody>';
        if(valor== 1){
            for (let i = 0; i < filas; i++) {
            tabla += `<tr><th>Fila ${i + 1}</th>`;
            for (let j = 0; j < columnas; j++) {
                tabla += `<td><input type="number" class="dato-celda" placeholder="0" value="${Math.floor(Math.random() * 20) + 1}" min="0"></td>`; // Relleno con datos aleatorios
            }
            tabla += '</tr>';}
        } else {
            for (let i = 0; i < filas; i++) {
            tabla += `<tr><th>Fila ${i + 1}</th>`;
            for (let j = 0; j < columnas; j++) {
                tabla += `<td><input type="number" class="dato-celda" placeholder="0" min="0"></td>`;}
            tabla += '</tr>';}}
        
        tabla += '</tbody></table>';
        tablaContainer.innerHTML = tabla;
        resolverBtn.classList.remove('oculto');
        ponerdatosrandom.classList.remove('oculto');

    }
    function generaraleatorios() {
        let valor = 1;
        generarTabla(valor);
    }

    /* Lee la matriz de la tabla de entrada.*/
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

    /* Función principal que se dispara al hacer clic en "Generar Resultado".*/
    function resolverMetodoHungaro() {
        const matrizCostos = leerMatrizDeTabla();
        pasosContainer.innerHTML = '';
        // 1. Mostrar la Matriz Original
        renderizarPaso("Paso 0: Matriz de Costos Original", matrizCostos);
        // 2. Crear una copia para el algoritmo (para no modificar la original)
        const matrizTrabajo = matrizCostos.map(fila => [...fila]);
        // 3. Crear instancia del algoritmo y ejecutarlo
        // Le pasamos el contenedor de "logs" para que informe sus pasos
        try {
            const m = new SolucionadorHungaro(pasosContainer); 
            const asignaciones = m.calcular(matrizTrabajo);    
            // 4. Mostrar el resultado final
            mostrarResultadoFinal(matrizCostos, asignaciones);
        } catch (e) {
            pasosContainer.innerHTML += `<p style="color: red;">Error: ${e.message}</p>`;
            console.error(e);
        }
    }
    /* Ayudante para dibujar CUALQUIER matriz en el contenedor de pasos.*/
    function renderizarPaso(titulo, matriz, lineasFilas = [], lineasColumnas = []) {
        let html = `<div class="paso"><h3>${titulo}</h3>`;
        html += '<table><tbody>';
        // Encabezados de Columna
        html += '<tr><th></th>';
        for(let j=0; j < matriz[0].length; j++) {
            html += `<th>Col ${j+1}</th>`;
        }
        html += '</tr>';
        // Filas
        for (let i = 0; i < matriz.length; i++) {
            html += `<tr><th>Fila ${i+1}</th>`;
            for (let j = 0; j < matriz[i].length; j++) {
                // Aplicar clases CSS para las líneas
                let clases = [];
                if (lineasFilas[i]) clases.push('linea-fila');
                if (lineasColumnas[j]) clases.push('linea-columna');
                if (lineasFilas[i] && lineasColumnas[j]) clases.push('interseccion');
                if (matriz[i][j] === 0) clases.push('cero');

                html += `<td class="${clases.join(' ')}">${matriz[i][j]}</td>`;
            }
            html += '</tr>';
        }
        html += '</tbody></table></div>';
        pasosContainer.innerHTML += html;
    }
    /*Muestra el resultado final resaltado */
    function mostrarResultadoFinal(matrizOriginal, asignaciones) {
        let html = `<div class="paso"><h3>Paso Final: Asignación Óptima</h3>`;
        html += '<p>Las celdas resaltadas en verde muestran la asignación óptima con el costo mínimo.</p>';
        html += '<table><tbody>';

        // Encabezados
        html += '<tr><th></th>';
        for(let j=0; j < matrizOriginal[0].length; j++) {
            html += `<th>Col ${j+1}</th>`;
        }
        html += '</tr>';
        // Crear un mapa de las asignaciones para buscarlas fácilmente
        const asignMap = {};
        asignaciones.forEach(par => {
            // par es [fila, columna]
            asignMap[par[0]] = par[1];
        });
        let costoTotal = 0;
        // Filas
        for (let i = 0; i < matrizOriginal.length; i++) {
            html += `<tr><th>Fila ${i+1}</th>`;
            for (let j = 0; j < matrizOriginal[i].length; j++) {
                // Comprobar si esta celda (i, j) es parte de la asignación
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
    // --- 4. CÓDIGO DEL ALGORITMO HÚNGARO -Este es el código de la librería Munkres, pero con nombres de variables
    // y funciones cambiados para ser más fáciles de entender.
    var VALOR_MAXIMO = parseInt(Number.MAX_SAFE_INTEGER/2) || ((1 << 26)*(1 << 26));
    var VALOR_RELLENO_DEFECTO = 0;
    /*Clase principal que resuelve el algoritmo.        */
    function SolucionadorHungaro(contenedorPasos) {
      this.matrizDeTrabajo = null;
      this.filasCubiertas = [];
      this.columnasCubiertas = [];
      // El tamaño (N x N) de la matriz cuadrada
      this.tamano = 0;
      // Coordenadas del último cero 'primado' encontrado
      this.ultimoCeroPrimado_r = 0;
      this.ultimoCeroPrimado_c = 0;
      // Matriz que guarda las marcas (1 = 'starred', 2 = 'primed')
      this.matrizMarcada = null;
      // El camino de ceros alternados
      this.camino = null;
      // MODIFICACIÓN: Guardamos la referencia al contenedor de pasos
      this.contenedorPasos = contenedorPasos || null; 
    }
    /*MODIFICACIÓN: Creamos una función de "log" Esta función llama a nuestro 'renderizarPaso' global*/
    SolucionadorHungaro.prototype._registrarPaso = function(titulo) {
        if (this.contenedorPasos) {
            // Copiamos la matriz para evitar problemas de referencia
            const matrizCopia = this.matrizDeTrabajo.map(fila => fila.map(val => val));
            renderizarPaso(titulo, matrizCopia, this.filasCubiertas, this.columnasCubiertas);
        }
    }

    /* Asegura que la matriz sea cuadrada (N x N) rellenándola con un valor.*/
    SolucionadorHungaro.prototype.rellenarMatriz = function(matriz, valorRelleno) {
      valorRelleno = valorRelleno || VALOR_RELLENO_DEFECTO;
      var maxColumnas = 0;
      var totalFilas = matriz.length;
      var i;
      for (i = 0; i < totalFilas; ++i)
        if (matriz[i].length > maxColumnas)
          maxColumnas = matriz[i].length;
      // El tamaño final será el más grande (filas o columnas)
      totalFilas = maxColumnas > totalFilas ? maxColumnas : totalFilas;
      var nuevaMatriz = [];
      for (i = 0; i < totalFilas; ++i) {
        var fila = matriz[i] || [];
        var nuevaFila = fila.slice();
        // Si la fila es muy corta, rellenarla
        while (totalFilas > nuevaFila.length)
          nuevaFila.push(valorRelleno);
        nuevaMatriz.push(nuevaFila);
      }
      return nuevaMatriz;
    };
    /**Función principal que ejecuta el algoritmo.*/
    SolucionadorHungaro.prototype.calcular = function(matrizCostos, options) {
      options = options || {};
      options.padValue = options.padValue || VALOR_RELLENO_DEFECTO;
      this.matrizDeTrabajo = this.rellenarMatriz(matrizCostos, options.padValue);
      this.tamano = this.matrizDeTrabajo.length;
      // Guardamos las dimensiones originales para el resultado final
      this.filasOriginales = matrizCostos.length;
      this.columnasOriginales = matrizCostos[0].length;

      var arrayFalso = []; 
      while (arrayFalso.length < this.tamano)
        arrayFalso.push(false);
      
      this.filasCubiertas = arrayFalso.slice();
      this.columnasCubiertas = arrayFalso.slice();
      this.ultimoCeroPrimado_r = 0;
      this.ultimoCeroPrimado_c = 0;
      
      this.camino = this._crearMatriz(this.tamano * 2, 0);
      this.matrizMarcada = this._crearMatriz(this.tamano, 0);

      var paso = 1;
      // Mapeo de los pasos del algoritmo
      var pasos = { 1 : this._paso1,
                    2 : this._paso2,
                    3 : this._paso3,
                    4 : this._paso4,
                    5 : this._paso5,
                    6 : this._paso6 };

      // --- BUCLE PRINCIPAL (Modificado para registrar) ---
      while (true) {
        var funcionDelPaso = pasos[paso];
        if (!funcionDelPaso) // Terminado
          break;
        
        // Ejecutamos el paso (la función devuelve el NÚMERO del siguiente paso)
        paso = funcionDelPaso.apply(this);
        
        // MODIFICACIÓN: Informamos del resultado de ese paso!
        if (paso === 2) this._registrarPaso(" ");
        if (paso === 3) this._registrarPaso("");
        if (paso === 4) this._registrarPaso("");
        if (paso === 5) this._registrarPaso("");
        if (paso === 6) this._registrarPaso("");
        if (paso === 7) break; // Terminado
      }
      
      this._registrarPaso("");

      // Recolectar los resultados finales
      var resultados = [];
      for (var i = 0; i < this.filasOriginales; ++i)
        for (var j = 0; j < this.columnasOriginales; ++j)
          if (this.matrizMarcada[i][j] == 1) // 1 = 'starred' (marcado)
            resultados.push([i, j]);

      return resultados;
    };

    /**
     * Ayudante: Crea una matriz de N x N rellenada con 'valor'.
     */
    SolucionadorHungaro.prototype._crearMatriz = function(n, valor) {
      var matriz = [];
      for (var i = 0; i < n; ++i) {
        matriz[i] = [];
        for (var j = 0; j < n; ++j)
          matriz[i][j] = valor;
      }
      return matriz;
    };

    /**
     * Paso 1: Resta el mínimo de cada fila.
     */
    SolucionadorHungaro.prototype._paso1 = function() {
       for (var i = 0; i < this.tamano; ++i) {
         var minval = Math.min.apply(Math, this.matrizDeTrabajo[i]);
         for (var j = 0; j < this.tamano; ++j)
           this.matrizDeTrabajo[i][j] -= minval;
       }
       return 2; // Siguiente paso
    };

    /**
     * Paso 2: Encuentra ceros y los marca ('star' = 1).
     */
    SolucionadorHungaro.prototype._paso2 = function() {
      for (var i = 0; i < this.tamano; ++i) {
        for (var j = 0; j < this.tamano; ++j) {
          if (this.matrizDeTrabajo[i][j] === 0 &&
            !this.columnasCubiertas[j] &&
            !this.filasCubiertas[i])
          {
            this.matrizMarcada[i][j] = 1; // 1 = 'starred' (marcado)
            this.columnasCubiertas[j] = true;
            this.filasCubiertas[i] = true;
            break;
          }
        }
      }
      this._limpiarCubiertas(); // Borra todas las cubiertas
      return 3; // Siguiente paso
    };

    /**
     * Paso 3: Cubre columnas que tienen un cero marcado.
     * Si cubre N columnas, hemos terminado.
     */
    SolucionadorHungaro.prototype._paso3 = function() {
      var contador = 0;
      for (var i = 0; i < this.tamano; ++i) {
        for (var j = 0; j < this.tamano; ++j) {
          if (this.matrizMarcada[i][j] == 1 && this.columnasCubiertas[j] == false) {
            this.columnasCubiertas[j] = true;
            ++contador;
          }
        }
      }
      // Si contador >= N, hemos terminado (ir al paso 7 = fin)
      return (contador >= this.tamano) ? 7 : 4; 
    };

    /**
     * Paso 4: Encontrar un cero no cubierto y 'primarlo' (marcar con 2).
     */
    SolucionadorHungaro.prototype._paso4 = function() {
      var terminado = false;
      var fila = -1, col = -1, colMarcada = -1;

      while (!terminado) {
        var z = this._encontrarUnCeroNoCubierto();
        fila = z[0];
        col = z[1];

        if (fila < 0)
          return 6; // No hay más ceros, ir al paso 6

        this.matrizMarcada[fila][col] = 2; // 2 = 'primed' (primado)
        colMarcada = this._encontrarMarcadoEnFila(fila);
        if (colMarcada >= 0) {
          col = colMarcada;
          this.filasCubiertas[fila] = true;
          this.columnasCubiertas[col] = false;
        } else {
          this.ultimoCeroPrimado_r = fila;
          this.ultimoCeroPrimado_c = col;
          return 5; // Ir al paso 5
        }
      }
    };

    /**
     * Paso 5: Construir el camino de ceros alternados.
     */
    SolucionadorHungaro.prototype._paso5 = function() {
      var contador = 0;
      this.camino[contador][0] = this.ultimoCeroPrimado_r;
      this.camino[contador][1] = this.ultimoCeroPrimado_c;
      var terminado = false;

      while (!terminado) {
        var fila = this._encontrarMarcadoEnColumna(this.camino[contador][1]);
        if (fila >= 0) {
          contador++;
          this.camino[contador][0] = fila;
          this.camino[contador][1] = this.camino[contador-1][1];
        } else {
          terminado = true;
        }

        if (!terminado) {
          var col = this._encontrarPrimadoEnFila(this.camino[contador][0]);
          contador++;
          this.camino[contador][0] = this.camino[contador-1][0];
          this.camino[contador][1] = col;
        }
      }

      this._invertirCamino(this.camino, contador);
      this._limpiarCubiertas();
      this._borrarPrimados();
      return 3; // Volver al paso 3
    };

    /**
     * Paso 6: Ajustar la matriz para crear nuevos ceros.
     * (El "Step 4.2" de tu imagen)
     */
    SolucionadorHungaro.prototype._paso6 = function() {
      var minval = this._encontrarMenorNoCubierto();

      for (var i = 0; i < this.tamano; ++i) {
        for (var j = 0; j < this.tamano; ++j) {
          if (this.filasCubiertas[i])
            this.matrizDeTrabajo[i][j] += minval; // Sumar a filas cubiertas
          if (!this.columnasCubiertas[j])
            this.matrizDeTrabajo[i][j] -= minval; // Restar a columnas no cubiertas
        }
      }
      
      // MODIFICACIÓN: Logueamos este paso
      this._registrarPaso("");
      
      return 4; // Volver al paso 4
    };

    /**
     * Ayudante: Encontrar el valor más pequeño no cubierto.
     */
    SolucionadorHungaro.prototype._encontrarMenorNoCubierto = function() {
      var minval = VALOR_MAXIMO;
      for (var i = 0; i < this.tamano; ++i)
        for (var j = 0; j < this.tamano; ++j)
          if (!this.filasCubiertas[i] && !this.columnasCubiertas[j])
            if (minval > this.matrizDeTrabajo[i][j])
              minval = this.matrizDeTrabajo[i][j];
      return minval;
    };

    /**
     * Ayudante: Encontrar el primer cero no cubierto.
     */
    SolucionadorHungaro.prototype._encontrarUnCeroNoCubierto = function() {
      for (var i = 0; i < this.tamano; ++i)
        for (var j = 0; j < this.tamano; ++j)
          if (this.matrizDeTrabajo[i][j] === 0 &&
            !this.filasCubiertas[i] &&
            !this.columnasCubiertas[j])
            return [i, j];
      return [-1, -1];
    };

    /**
     * Ayudante: Encontrar un cero 'marcado' (1) en una fila.
     */
    SolucionadorHungaro.prototype._encontrarMarcadoEnFila = function(fila) {
      for (var j = 0; j < this.tamano; ++j)
        if (this.matrizMarcada[fila][j] == 1)
          return j;
      return -1;
    };

    /**
     * Ayudante: Encontrar un cero 'marcado' (1) en una columna.
     */
    SolucionadorHungaro.prototype._encontrarMarcadoEnColumna = function(col) {
      for (var i = 0; i < this.tamano; ++i)
        if (this.matrizMarcada[i][col] == 1)
          return i;
      return -1;
    };

    /**
     * Ayudante: Encontrar un cero 'primado' (2) en una fila.
     */
    SolucionadorHungaro.prototype._encontrarPrimadoEnFila = function(fila) {
      for (var j = 0; j < this.tamano; ++j)
        if (this.matrizMarcada[fila][j] == 2)
          return j;
      return -1;
    };

    /**
     * Ayudante: Invertir las marcas (1 y 2) a lo largo del camino.
     */
    SolucionadorHungaro.prototype._invertirCamino = function(camino, contador) {
      for (var i = 0; i <= contador; ++i)
        // Si es 1 ('starred'), se vuelve 0. Si es 2 ('primed'), se vuelve 1.
        this.matrizMarcada[camino[i][0]][camino[i][1]] =
          (this.matrizMarcada[camino[i][0]][camino[i][1]] == 1) ? 0 : 1;
    };

    /** * Ayudante: Poner todas las cubiertas en 'false'. */
    SolucionadorHungaro.prototype._limpiarCubiertas = function() {
      for (var i = 0; i < this.tamano; ++i) {
        this.filasCubiertas[i] = false;
        this.columnasCubiertas[i] = false;
      }
    };

    /** * Ayudante: Borrar todas las marcas 'primadas' (2). */
    SolucionadorHungaro.prototype._borrarPrimados = function() {
      for (var i = 0; i < this.tamano; ++i)
        for (var j = 0; j < this.tamano; ++j)
          if (this.matrizMarcada[i][j] == 2)
            this.matrizMarcada[i][j] = 0;
    };

});