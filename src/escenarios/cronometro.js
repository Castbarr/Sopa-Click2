export default class Cronometro {
    constructor(scene, x, y) {
        this.scene = scene;
        this.segundos = 0;
        this.tiempoTexto = scene.add.text(x, y, '00:00',
             { fontSize: '20px', fill: '#ffffff', backgroundColor: "#000000", padding: { x: 10, y: 5 } });
        this.timer = null;
    }
    reiniciar() {
        this.detener();
        this.segundos = -1;
        this.actualizarTiempo();
    }

    iniciar() {
        this.segundos = 0;
        this.timer = this.scene.time.addEvent({
            delay: 1000,
            callback: this.actualizarTiempo,
            callbackScope: this,
            loop: true
        });
    }

    detener() {
        if (this.timer) {
            this.timer.remove();
        }
    }

    actualizarTiempo() {
        this.segundos++;
        const minutos = Math.floor(this.segundos / 60);
        const segundosRestantes = this.segundos % 60;
        this.tiempoTexto.setText(`${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`);
    }

    obtenerTiempo() {
        return this.segundos;
    }
}