class Cuadricula {
    constructor(scene, filas, columnas, x, y, anchoCelda, altoCelda,tema) {
        this.scene = scene;
        this.filas = filas;
        this.columnas = columnas;
        this.x = x;
        this.y = y;
        this.anchoCelda = anchoCelda;
        this.altoCelda = altoCelda;
        this.tema = tema;
        this.celdas = [];
        this.sounds = this.scene.registry.get('sounds');
        this.background = this.scene.add.image(0, 0, 'fondo_juego').setOrigin(0, 0);
        this.background.setDisplaySize(this.scene.sys.game.config.width, this.scene.sys.game.config.height);
        this.palabrasColocadas = [];
        this.crearCuadricula();
        this.cargarPalabras();
        this.celdasSeleccionadas = [];
        this.crearBotonVerificar();
        this.crearBotonReinicio();
        this.crearTextoTema();
        this.celdasMarcadas = new Set();
    }

    crearTextoTema() {
        this.temaTexto = this.scene.add.text(260, 50, this.tema, { fontSize: '24px', fill: '#ffffff' })
        .setDepth(50);
    }
    crearBotonReinicio() {
        this.botonReinicio = this.scene.add.text(300, 620, 'Reiniciar', { 
            fontSize: '20px',
            fontStyle: 'bold', 
            fill: '#000', 
            backgroundColor: '#a1b8cc',
            padding: { x: 10, y: 5 }
        })
        .on('pointerover', () => this.botonReinicio.setStyle({ fill: '#737480' }))
        .on('pointerout', () => this.botonReinicio.setStyle({ fill: '#000' }))
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.reiniciarCuadricula());
    }
    
    reiniciarCuadricula() {
        // Limpiar la cuadrícula
        this.limpiarCuadricula();
        
        // Volver a cargar las palabras
        this.cargarPalabras();
        
        // Reiniciar las variables de estado
        this.celdasSeleccionadas = [];
        this.celdasMarcadas = new Set();
        
        // Emitir un evento para actualizar la lista de palabras en la interfaz
        this.scene.events.emit('reiniciarPalabras', this.palabrasColocadas);
    }
    
    limpiarCuadricula() {
        for (let fila of this.celdas) {
            for (let celda of fila) {
                if (celda.circulo) {
                    celda.circulo.destroy();
                    celda.circulo = null;
                }
                if (celda.texto) {
                    celda.texto.destroy();
                    celda.texto = null;
                }
            }
        }
        this.palabrasColocadas = [];
    }
    cargarPalabras() {
        // Limpiar la cuadrícula antes de cargar nuevas palabras
        this.limpiarCuadricula();
    
        const palabrasData = this.scene.cache.json.get('palabrasData');
        let palabras = palabrasData[this.tema] || [];
    
        // Mezclar las palabras aleatoriamente
        palabras = palabras.sort(() => 0.5 - Math.random());
    
        // Seleccionar las primeras 10 palabras (o todas si hay menos de 10)
        palabras = palabras.slice(0, 10);
    
        this.colocarPalabras(palabras);
        
    }
    crearBotonVerificar() {
        this.botonVerificar = this.scene.add.text(620, 560, 'Verificar', { 
            fontSize: '20px',
            fontStyle: 'bold', 
            fill: '#000', 
            backgroundColor: '#a1b8cc',
            padding: { x: 10, y: 5 }
        })
        .on('pointerover', () => this.botonVerificar.setStyle({ fill: '#737480' }))
        .on('pointerout', () => this.botonVerificar.setStyle({ fill: '#000' }))
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.verificarPalabra());
    }
    crearBotonVolver() {
        this.botonVolver = this.scene.add.image(100, 50, 'boton_portada')
            .setScale(0.80)
            .on('pointerover', () => this.botonVolver.setScale(0.85))
            .on('pointerout', () => this.botonVolver.setScale(0.80))
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.events.emit('volverAPortada');
            });
    }

    destruir() {
        for (let fila of this.celdas) {
            for (let celda of fila) {
                // Destruir el círculo si existe
                if (celda.circulo) {
                    celda.circulo.destroy();
                }
                
                // Destruir la celda y su texto
                celda.destroy();
                if (celda.texto) {
                    celda.texto.destroy();
                }
            }
        }
        
        this.background.destroy();
        if (this.botonVolver) this.botonVolver.destroy();
        if (this.botonVerificar) this.botonVerificar.destroy();
        
        // Limpiar el array de celdas
        this.celdas = [];
    }
    
    crearCuadricula() {
        for (let fila = 0; fila < this.filas; fila++) {
            this.celdas[fila] = [];
            for (let columna = 0; columna < this.columnas; columna++) {
                const x = this.x + columna * this.anchoCelda;
                const y = this.y + fila * this.altoCelda;
                
                // Crear un rectángulo para cada celda
                const celda = this.scene.add.rectangle(x, y, this.anchoCelda, this.altoCelda, 0xffffff);
                celda.setOrigin(0, 0);
                // Hacer la celda interactiva y añadir el evento de clic
                celda.setInteractive({ useHandCursor: true });
                celda.on('pointerdown', () => this.onCeldaClick(fila, columna));
                celda.fila = fila;
                celda.columna = columna;
                
                this.celdas[fila][columna] = celda;
            }
        }
    }
    hacerCeldasClickeables(callback) {
        for (let fila = 0; fila < this.filas; fila++) {
            for (let columna = 0; columna < this.columnas; columna++) {
                const celda = this.celdas[fila][columna];
                celda.setInteractive; // Hace la celda interactiva
                celda.on('pointerdown', () => {
                    callback(fila, columna, celda);
                });
            }
        }
    }

    colocarPalabras(palabras) {
        const direcciones = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];
        
        for (let palabra of palabras) {
            let colocada = false;
            let intentos = 0;
            const maxIntentos = 100;
    
            while (!colocada && intentos < maxIntentos) {
                // Elegir una posición y dirección aleatoria
                const fila = Math.floor(Math.random() * this.filas);
                const columna = Math.floor(Math.random() * this.columnas);
                const [dx, dy] = direcciones[Math.floor(Math.random() * direcciones.length)];
    
                // Comprobar si la palabra cabe en esa dirección
                if (this.palabraCabe(palabra, fila, columna, dx, dy)) {
                    // Colocar la palabra
                    this.colocarPalabra(palabra, fila, columna, dx, dy);
                    colocada = true;
                    this.palabrasColocadas.push(palabra);
                }
    
                intentos++;
            }
    
            if (!colocada) {
                console.warn(`No se pudo colocar la palabra: ${palabra}`);
            }
        }
    
        // Rellenar las celdas vacías con letras aleatorias
        this.rellenarCeldas();
    }
    
    palabraCabe(palabra, fila, columna, dx, dy) {
        for (let i = 0; i < palabra.length; i++) {
            const nuevaFila = fila + i * dy;
            const nuevaColumna = columna + i * dx;
    
            if (nuevaFila < 0 || nuevaFila >= this.filas || 
                nuevaColumna < 0 || nuevaColumna >= this.columnas) {
                return false;
            }
    
            const celdaActual = this.celdas[nuevaFila][nuevaColumna];
            if (celdaActual.texto && celdaActual.texto.text !== palabra[i]) {
                return false;
            }
        }
        return true;
    }
    
    colocarPalabra(palabra, fila, columna, dx, dy) {
        for (let i = 0; i < palabra.length; i++) {
            const nuevaFila = fila + i * dy;
            const nuevaColumna = columna + i * dx;
            const celda = this.celdas[nuevaFila][nuevaColumna];
    
            // Si ya existe un texto en la celda, lo destruimos
            if (celda.texto) {
                celda.texto.destroy();
            }
    
            // Crear un nuevo texto con la letra de la palabra
            celda.texto = this.scene.add.text(
                celda.x + celda.width / 2,
                celda.y + celda.height / 2,
                palabra[i],
                { fontSize: '20px', fill: '#000000',fontStyle:"bold", stroke: "#ffffff", strokeThickness:1}
            ).setOrigin(0.5);
    
            celda.texto.setDepth(1);
        }
    }
    rellenarCeldas() {
        let letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let fila = 0; fila < this.filas; fila++) {
            for (let columna = 0; columna < this.columnas; columna++) {
                let celda = this.celdas[fila][columna];
                
                // Verifica si la celda ya tiene un texto
                if (!celda.texto) {
                    let letraAleatoria = letras.charAt(Math.floor(Math.random() * letras.length));
                    
                    // Crear un texto con la letra aleatoria y añadirlo a la celda
                    let texto = this.scene.add.text(
                        celda.x + celda.width / 2, 
                        celda.y + celda.height / 2, 
                        letraAleatoria, 
                        { fontSize: '20px', fill: '#000000',fontStyle:"bold", stroke: "#ffffff", strokeThickness:1}
                    ).setOrigin(0.5);

                    texto.setDepth(10);
                    // Almacenar el texto en la celda para futuras referencias
                    celda.texto = texto;
                }
            }
        }
    }

    onCeldaClick(fila, columna) {
        this.sounds.click_tecla.play();
        const celda = this.celdas[fila][columna];
        const celdaKey = `${fila},${columna}`;
        
        if (celda.circulo) {
            if (celda.colorCirculo === 0xffe033) {
                if (this.celdasMarcadas.has(celdaKey)) {
                    this.setCeldaColor(fila, columna, 0x00ff00);
                }
                else{
                    this.setCeldaColor(fila, columna, 0xffffff);
                    this.celdasSeleccionadas = this.celdasSeleccionadas.filter(c => c !== celda);
                }
            } else {
                // Si la celda no es amarilla, la cambiamos a amarilla y la añadimos a la selección
                this.setCeldaColor(fila, columna, 0xffe033);
                this.celdasSeleccionadas.push(celda);
            }
        } else {
            // Si no hay círculo, creamos uno amarillo y añadimos la celda a la selección
            this.setCeldaColor(fila, columna, 0xffe033);
            this.celdasSeleccionadas.push(celda);
        }
    
    }
    verificarPalabra() {
        this.sounds.click_verificar.play();
        // Obtener la palabra formada por las celdas seleccionadas
        const palabraFormada = this.celdasSeleccionadas.map(celda => celda.texto.text).join('');
        
        // Ordenar las letras de la palabra formada
        const palabraFormadaOrdenada = [...palabraFormada].sort().join('');
        
        // Buscar si la palabra formada (ordenada) coincide con alguna palabra en la lista
        const palabraEncontrada = this.palabrasColocadas.find(palabra => 
            [...palabra].sort().join('') === palabraFormadaOrdenada
        );
    
        if (palabraEncontrada) {
            console.log('¡Palabra encontrada!', palabraEncontrada);
            this.marcarPalabraEncontrada(this.celdasSeleccionadas);
            this.celdasSeleccionadas = [];
            this.scene.events.emit('palabraEncontrada', palabraEncontrada);
        } else {
            console.log('Palabra no válida');
            this.limpiarSeleccionParcial();
        }
    }
    limpiarSeleccionParcial() {
        this.celdasSeleccionadas.forEach(celda => {
            const celdaKey = `${celda.fila},${celda.columna}`;
            if (this.celdasMarcadas.has(celdaKey)) {
                // Si la celda ya forma parte de una palabra encontrada, la volvemos a colorear de verde
                this.setCeldaColor(celda.fila, celda.columna, 0x00ff00);
            } else {
                // Si no, la volvemos a su color original (blanco)
                this.setCeldaColor(celda.fila, celda.columna, 0xffffff);
            }
        });
        // Mantenemos en celdasSeleccionadas solo las que están marcadas
        this.celdasSeleccionadas = this.celdasSeleccionadas.filter(celda => 
            this.celdasMarcadas.has(`${celda.fila},${celda.columna}`)
        );
    }
    marcarPalabraEncontrada(celdas) {
        celdas.forEach(celda => {
            this.setCeldaColor(celda.fila, celda.columna, 0x00ff00);
            this.celdasMarcadas.add(`${celda.fila},${celda.columna}`);
        });
        
    }

    getCelda(fila, columna) {
        return this.celdas[fila][columna];
    }

    setCeldaColor(fila, columna, color) {
        const celda = this.celdas[fila][columna];
        
        // Obtener el centro de la celda
        const centerX = celda.x + this.anchoCelda / 2;
        const centerY = celda.y + this.altoCelda / 2;
        
        // Calcular el radio del círculo
        const radio = Math.min(this.anchoCelda, this.altoCelda) / 2;
        
        if (celda.circulo) {
            // Si ya existe un círculo, solo cambiamos su color
            celda.circulo.clear();
            celda.circulo.fillStyle(color);
            celda.circulo.fillCircle(centerX, centerY, radio);
        } else {
            // Si no existe un círculo, creamos uno nuevo
            const circulo = this.scene.add.graphics();
            circulo.fillStyle(color);
            circulo.fillCircle(centerX, centerY, radio);
            
            if (celda.texto) {
                circulo.setDepth(celda.texto.depth - 1);
            }
            
            celda.circulo = circulo;
        }
        
        // Almacenamos el color actual del círculo
        celda.colorCirculo = color;
    }
    getPalabrasColocadas() {
        return this.palabrasColocadas;
    }
}
export default Cuadricula;