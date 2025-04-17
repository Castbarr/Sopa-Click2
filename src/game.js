import Portada from './portada.js';
import Cuadricula from './cuadricula.js';
import Menu from './menu.js';
import Cronometro from './cronometro.js';
import Phaser from 'phaser';    

let portada;
let cuadricula;
let elementosListaPalabras = [];
let palabrasPorEncontrar = [];
let temaSeleccionado = null;
let cronometro;
let estadisticasTexto = null;

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 700,
    backgroundColor: '#000000',
    parent: 'game',
    scale:{
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        pixelPerfect: true,
    },
    scene:[ {
        key: "MainScene",
        preload: preload,
        create: create,
        update: update
    },
    Menu
]
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('fondo_portada', 'assets/fondo_portada.png');
    this.load.image('boton_menu', 'assets/boton_menu.png');
    this.load.image('boton_portada', 'assets/boton_portada.png');
    this.load.json('palabrasData', 'assets/palabras.json');
    this.load.image('fondo_juego', 'assets/fondo_juego.png');
    this.load.audio('musica_fondo', 'assets/musica_fondo.mp3');
    this.load.audio('click_tecla', 'assets/click_tecla.mp3');
    this.load.audio('musica_de_victoria', 'assets/musica_de_victoria.mp3');
    this.load.audio("click_verificar", 'assets/click_verificar.mp3');
}

function create() {
    if (!this.registry.get('sounds')) {
        this.registry.set('sounds', {
            musica_fondo: this.sound.add('musica_fondo', { loop: true, volume: 0.05 }),
            click_tecla: this.sound.add('click_tecla', { volume: 0.2 }),
            musica_de_victoria: this.sound.add('musica_de_victoria', { volume: 0.2 }),
            click_verificar: this.sound.add('click_verificar', { volume: 0.2 })
        });
    }

    const musica_fondo = this.registry.get('sounds').musica_fondo;
    if (!musica_fondo.isPlaying) {
        musica_fondo.play();
    }
    
    
    // Eliminar los listeners existentes antes de agregar nuevos
    this.events.removeAllListeners('iniciarJuego');
    this.events.removeAllListeners('volverAPortada');
    this.events.removeAllListeners('iniciarJuegoDesdeMenu');
    this.events.removeAllListeners('reiniciarPalabras');
    this.events.removeAllListeners('mostrarMensajeDeVictoria');
    
    this.events.on('iniciarJuego', iniciarJuego, this);
    this.events.on('volverAPortada', volverAPortada, this);
    this.events.on('iniciarJuegoDesdeMenu', iniciarJuegoDesdeMenu, this);
    this.events.on('reiniciarPalabras', manejarReinicioCuadricula, this);
    this.events.on('mostrarMensajeDeVictoria', mostrarMensajeDeVictoria, this);
    

    if (temaSeleccionado) {
        // Si hay un tema seleccionado, crear la cuadrícula
        crearCuadricula(this, temaSeleccionado);
        temaSeleccionado = null;
        // Crear el cronómetro
        cronometro = new Cronometro(this, 690, 57);
        
        // Crear botón para iniciar el cronómetro
        this.botonCronometro = this.add.text(490, 60, 'Iniciar Cronómetro', { 
            fontSize: '16px',
            fontStyle: 'bold', 
            fill: '#000', 
            backgroundColor: '#a1b8cc',
            padding: { x: 10, y: 5 }
        })
        .on('pointerover', () => this.botonCronometro.setStyle({ fill: '#737480' }))
        .on('pointerout', () => this.botonCronometro.setStyle({ fill: '#000' }))
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            if (cronometro) {
                cronometro.reiniciar();
                cronometro.iniciar();
            }
        });

        // Crear botón para mostrar estadísticas
        this.botonEstadisticas = this.add.text(610, 20, 'Estadísticas', { 
            fontSize: '16px',
            fontStyle: 'bold', 
            fill: '#000', 
            backgroundColor: '#a1b8cc',
            padding: { x: 10, y: 5 }
        })
        .on('pointerover', () => this.botonEstadisticas.setStyle({ fill: '#737480' }))
        .on('pointerout', () => this.botonEstadisticas.setStyle({ fill: '#000' }))
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            mostrarEstadisticas(this);
        });
    } else {
        // Si no hay tema, mostrar la portada
        portada = new Portada(this);
        portada.crear();
        portada.mostrar();
    }
}
function manejarReinicioCuadricula(nuevasPalabras) {
    console.log('La cuadrícula se ha reiniciado');
    palabrasPorEncontrar = nuevasPalabras;
    // Actualizar la lista de palabras en la interfaz
    destruirListaPalabras();
    crearListaPalabras(this, palabrasPorEncontrar);
    this.children.getAll().forEach(child => {
        if (child.text && child.text.includes('¡Felicidades!')) {
            child.destroy();
        }
    });
    cronometro.reiniciar(); 
    // Detener el evento de mostrar mensaje de victoria
    this.events.off('mostrarMensajeDeVictoria', mostrarMensajeDeVictoria, this);
    this.events.on('mostrarMensajeDeVictoria', mostrarMensajeDeVictoria, this);
}

function iniciarJuego() {
    portada.ocultar();
    this.scene.start('MenuScene');
}
function iniciarJuegoDesdeMenu(tema) {
    console.log('Iniciando juego desde el menú con tema:', tema);
    temaSeleccionado = tema;
    this.scene.start('MainScene');
}
function crearCuadricula(scene, tema) {
    if (cuadricula) {
        cuadricula.destruir();
    }
    cuadricula = new Cuadricula(scene, 12, 12, 115, 115, 40, 40, tema);
    cuadricula.crearBotonVolver();
    palabrasPorEncontrar = cuadricula.getPalabrasColocadas();
    crearListaPalabras(scene, palabrasPorEncontrar);
    
    // Remover el listener anterior si existe
    scene.events.off("palabraEncontrada", actualizarListaPalabras);
    // Añadir el nuevo listener
    scene.events.on("palabraEncontrada", actualizarListaPalabras, scene);
}

function crearListaPalabras(scene,palabras){
    elementosListaPalabras
    let titulo = scene.add.text(600, 110, 'Palabras a buscar:', { fontSize: '18px', fill: '#ffffff' });
    elementosListaPalabras.push(titulo);
    let y = 150;
    for (let palabra of palabras) {
        let textoPalabra = scene.add.text(600, y, palabra, { fontSize: '16px', fill: '#ffffff' });
        elementosListaPalabras.push(textoPalabra);
        y += 30;
    }
}
function destruirListaPalabras(){
    elementosListaPalabras.forEach(elemento => elemento.destroy());
    elementosListaPalabras = [];
}
function actualizarListaPalabras(palabraEncontrada) {
    // Destruir la lista existente
    destruirListaPalabras();

    // Filtrar la palabra encontrada de la lista de palabras por encontrar
    palabrasPorEncontrar = palabrasPorEncontrar.filter(palabra => palabra !== palabraEncontrada);
    // Crear la nueva lista de palabras
    crearListaPalabras(this, palabrasPorEncontrar);
    if (palabrasPorEncontrar.length === 0) {
        this.events.emit('mostrarMensajeDeVictoria');
        const musica_de_victoria = this.registry.get("sounds").musica_de_victoria;
        if (musica_de_victoria) {
            musica_de_victoria.play();
            console.log('Reproduciendo música de victoria');
        } else {
            console.error('No se pudo encontrar la música de victoria');
        }
    }
    
}

function mostrarMensajeDeVictoria() {
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;
    
    if (cronometro && cronometro.timer && cronometro.timer.paused === false) {
        cronometro.detener();
        const tiempoFinal = cronometro.obtenerTiempo();
        if (tiempoFinal > 0) {
            guardarTiempo(temaSeleccionado, tiempoFinal);
        }
    }
    
    this.add.text(width / 2, height * 0.50,
        "¡Felicidades! Has encontrado todas las palabras.\n" + 
        `Tiempo: ${formatearTiempo(cronometro ? cronometro.obtenerTiempo() : 0)}\n` +
        "Reinicia para volver jugar el mismo tema o\n" +
        "selecciona un nuevo tema en el menú.\n" +
        "¡Gracias por jugar!", 
        {
            fontSize: '18px',
            backgroundColor: '#ffffff',
            fontStyle: 'bold',
            color: '#000000',
            stroke: "#ffffff",
            strokeThickness: 1,
            align: 'center',
            wordWrap: { width: width * 0.8 },
            lineSpacing: 10,
            padding: {
                left: 20,
                right: 20,
                top: 10,
                bottom: 10
            }
        })
    .setOrigin(0.5)
    .setDepth(1000);
}

function formatearTiempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
}

function guardarTiempo(tema, tiempo) {
    let estadisticas = JSON.parse(localStorage.getItem('estadisticas')) || {};
    if (!estadisticas[tema]) {
        estadisticas[tema] = [];
    }
    estadisticas[tema].push(tiempo);
    localStorage.setItem('estadisticas', JSON.stringify(estadisticas));
}

function mostrarEstadisticas(scene) {
    if (estadisticasTexto) {
        // Si las estadísticas ya están visibles, las ocultamos
        estadisticasTexto.destroy();
        estadisticasTexto = null;
    } else {
        // Si las estadísticas no están visibles, las mostramos
        const estadisticas = JSON.parse(localStorage.getItem('estadisticas')) || {};
        let mensaje = "Estadísticas:\n\n";

        for (const tema in estadisticas) {
            const tiempos = estadisticas[tema];
            const mejorTiempo = Math.min(...tiempos);
            const tiempoPromedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;

            mensaje += `Mejor tiempo: ${formatearTiempo(mejorTiempo)}\n`;
            mensaje += `Tiempo promedio: ${formatearTiempo(Math.round(tiempoPromedio))}\n\n`;
        }

        estadisticasTexto = scene.add.text(400, 300, mensaje, {
            fontSize: '16px',
            backgroundColor: '#ffffff',
            color: '#000000',
            align: 'left',
            wordWrap: { width: 300 },
            padding: {
                left: 20,
                right: 20,
                top: 10,
                bottom: 10
            }
        })
        .setOrigin(0.5)
        .setDepth(1001);
    }
}

function volverAPortada(desdeMenu = false) {
    console.log('Volviendo a la portada');
    if (cuadricula) {
        cuadricula.destruir();
        cuadricula = null;
    }
    destruirListaPalabras();
    
    if (desdeMenu) {
        this.scene.stop('MenuScene');
    }
    
    temaSeleccionado = null; // Asegurarse de que no haya tema seleccionado
    this.scene.start('MainScene');
}

function update() {
    // Lógica de actualización si es necesaria
}