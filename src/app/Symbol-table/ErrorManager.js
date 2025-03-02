export class ErrorManager {
  constructor() {
    this.errors = []
    this.errorCounter = 1
  }

  addError(lexema, linea, descripcion) {
    this.errors.push({
      token: `ErrSem${this.errorCounter++}`,
      lexema,
      linea,
      descripcion
    })
  }

  getErrors() {
    console.log(this.errors)
    return this.errors
  }
} 