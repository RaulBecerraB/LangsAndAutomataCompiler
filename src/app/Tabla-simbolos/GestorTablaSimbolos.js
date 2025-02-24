export class GestorTablaSimbolos {
  constructor() {
    this.mapaSimbolos = new Map()
    //Almacena las variables declaradas
    //Ejemplo: { variable: 'numero' }
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
      console.log(this.variablesDeclaradas)
      this.agregarSimbolo(variable, tipo)
    })
  }

  esVariableDeclarada(variable) {
    return this.variablesDeclaradas.hasOwnProperty(variable)
  }

  obtenerTablaSimbolos() {
    console.log(this.mapaSimbolos)
    return Array.from(this.mapaSimbolos.values())
  }
} 