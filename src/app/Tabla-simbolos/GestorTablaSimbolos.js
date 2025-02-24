export class GestorTablaSimbolos {
  constructor() {
    //Almacena tal cual el contenido de la tabla de simbolos
    this.mapaSimbolos = new Map()
    //Almacena las variables declaradas
    this.variablesDeclaradas = {}
    /* Ejemplo de variablesDeclaradas:
    {
      "A": "numero",
      "B": "numero",
      "C": "numero",
      "D": "decimal",
      "E": "decimal",
      "F": "decimal",
      "W1": "palabra",
      "W2": "palabra",
      "W3": "palabra"
    }
    */
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