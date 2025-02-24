export class GestorTablaSimbolos {
  constructor() {
    this.mapaSimbolos = new Map()
    this.variablesDeclaradas = {}
  }

  agregarSimbolo(token, tipo = '') {
    this.mapaSimbolos.set(`${token}_${this.mapaSimbolos.size}`, { 
      lexema: token, 
      tipo 
    })
  }

  declararVariables(tipo, variables) {
    variables.forEach(variable => {
      this.variablesDeclaradas[variable] = tipo
      this.agregarSimbolo(variable, tipo)
    })
  }

  esVariableDeclarada(variable) {
    return this.variablesDeclaradas.hasOwnProperty(variable)
  }

  obtenerTablaSimbolos() {
    return Array.from(this.mapaSimbolos.values())
  }
} 