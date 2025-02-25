export class GestorErrores {
  constructor() {
    this.errores = []
    this.contadorErrores = 0
  }

  reiniciarContador() {
    this.contadorErrores = 0
  }

  agregarError(lexema, linea, descripcion) {
    this.contadorErrores++
    this.errores.push({
      token: `ErrSem${this.contadorErrores}`,
      lexema,
      linea,
      descripcion
    })
  }

  obtenerErrores() {
    // Ordenar errores por número de línea
    return this.errores.sort((a, b) => {
      // Primero ordenar por línea
      if (a.linea !== b.linea) {
        return a.linea - b.linea;
      }
      // Si están en la misma línea, mantener el orden original
      return this.errores.indexOf(a) - this.errores.indexOf(b);
    });
  }
} 