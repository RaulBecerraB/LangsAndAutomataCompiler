export class GestorErrores {
  constructor() {
    this.errores = []
    this.contadorErrores = 1
  }

  agregarError(lexema, linea, descripcion) {
    this.errores.push({
      token: `ErrSem${this.contadorErrores++}`,
      lexema,
      linea,
      descripcion
    })
  }

  obtenerErrores() {
    return this.errores
  }
} 