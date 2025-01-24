class Portada {
    constructor(scene) {
        this.scene = scene;
        this.elementos = [];
    }

    crear() {

        const { width, height } = this.scene.scale;


        // Añadir fondo
        this.fondo = this.scene.add.image(width / 2, height / 2, 'fondo_portada').setOrigin(0.5);
        this.fondo.setDisplaySize(width, height);

        // Añadir título del juego
        this.titulo = this.scene.add.text(width / 2, height * 0.2, 'Sopa-Click', {
            fontSize: '48px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.subTitulo = this.scene.add.text(width / 2, height * 0.3, 'Juego Sopa de Letras', {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5);

        // Añadir botón de jugar
        this.botonJugar = this.scene.add.image(width / 2, height * 0.5, 'boton_menu')
            .setInteractive({ useHandCursor: true })
            .setScale(0.75)
            .on('pointerover', () => this.botonJugar.setScale(0.85))
            .on('pointerout', () => this.botonJugar.setScale(0.75))

        this.botonJugar.on('pointerdown', () => {
            this.iniciarJuego();
        });
        this.botonInstrucciones = this.scene.add.text(width / 2, height * 0.6, 'Instrucciones', {
            fontSize: '24px',
            backgroundColor: '#ffffff',
            fontStyle: 'bold',
            fill: '#000000',
            stroke: "#ffffff",
            strokeThickness: 1,
            
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.botonInstrucciones.setStyle({ fill: '#4852c7' }))
        .on('pointerout', () => this.botonInstrucciones.setStyle({ fill: '#000000' }))

        this.botonInstrucciones.on('pointerdown', () => {
            this.mostrarInstrucciones();
        });

        // Crear texto de instrucciones (inicialmente oculto)
        this.textoInstrucciones = this.scene.add.text(width / 2, height * 0.75,
            "Selecciona un tema del menu.\n" + 
            "Encuentra palabras ocultas en la cuadrícula.\n" +
            "Haz clic en las letras para formar palabras.\n" +
            "Puedes utilizar el reloj para registrar tu tiempo (opcional),\n" +
            "así podrías consultar tu mejor tiempo, y tu promedio de tiempo.\n" +
            "Reta a tu destreza visual.\n" +
            "¡Diviértete jugando!", 
            {
                fontSize: '18px',
                backgroundColor: '#ffffff',
                fill: '#000000',
                fontStyle: 'bold',
                stroke: "#ffffff",
                strokeThickness: 1,
                align: 'center',
                wordWrap: { width: width * 0.8 },
                lineSpacing: 1
            })
        .setOrigin(0.5)
        .setVisible(false);
        // Añadir instrucciones
        this.instrucciones = this.scene.add.text(width / 2, height * 0.9, 'Haz click en "Menu" para comenzar', {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5);
        this.elementos.push(this.fondo, this.titulo, this.botonJugar, this.botonInstrucciones, this.instrucciones);
    }
    ocultar() {
        this.elementos.forEach(elemento => elemento.setVisible(false));
        this.textoInstrucciones.setVisible(false);
        
    }

    mostrar() {
        this.elementos.forEach(elemento => elemento.setVisible(true));
        this.textoInstrucciones.setVisible(false);
       
    }

    iniciarJuego() {
        this.scene.events.emit('iniciarJuego');
        
    }
    mostrarInstrucciones() {
        this.textoInstrucciones.setVisible(!this.textoInstrucciones.visible);
    }
}

export default Portada;