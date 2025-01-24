class Menu extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#4a4a4a'); // Puedes cambiar '#4a4a4a' por cualquier color que desees
        const { width, height } = this.scale;

        // Título del menú
        this.add.text(width / 2, height * 0.1, 'Selecciona un tema', {
            fontSize: '38px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5)
          .setDepth(1000);

        // Lista de temas
        const temas = ['Frutas', 'Países', 'Ciudades', 'Colores', 'Animales', 'Programación'];

        // Crear botones para cada tema
        temas.forEach((tema, index) => {
            const button = this.add.text(width / 2, height * (0.3 + index * 0.1), tema, {
                fontSize: '24px',
                fontStyle: 'bold',
                fill: '#1119e8',
                shadow: { color: '#ffffff', offsetX: 2, offsetY: 2, blur: 3, stroke:true, fill:true },
                wordWrap: { width: width - 50 }
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setPadding(10)
            .setStyle({ backgroundColor: '#aeb6bf', })
            .on('pointerover', () => button.setStyle({ fill: '#737480' }))
            .on('pointerout', () => button.setStyle({ fill: '#1119e8' }))
            .on('pointerdown', () => this.seleccionarTema(tema));
        });

        // Botón para volver a la portada
        const botonVolver = this.add.text(width / 2, height * 0.9, 'Volver a la portada', {
            fontSize: '20px',
            fontStyle: "bold",
            fill: '#ffffff',
            shadow: { color: '#000000', offsetX: 2, offsetY: 2, blur: 3, stroke: true, fill: true },
            wordWrap: { width: width - 50 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setPadding(10)
        .setStyle({ backgroundColor: '#4e51db' })
        .on('pointerover', () => botonVolver.setStyle({ fill: '#4852c7' }))
        .on('pointerout', () => botonVolver.setStyle({ fill: '#ffffff' }))
        .on('pointerdown', () => this.volverAPortada());
    }

    seleccionarTema(tema) {
        console.log(`Tema seleccionado: ${tema}`);
        // Emitir el evento para iniciar el juego con el tema seleccionado
        this.scene.get('MainScene').events.emit('iniciarJuegoDesdeMenu', tema);
        // Detener esta escena
        this.scene.stop('MenuScene');
    }

    volverAPortada() {
        console.log('Volviendo a la portada desde el menú');
        this.scene.stop('MenuScene');
        this.scene.start('MainScene');
    }
}

export default Menu;