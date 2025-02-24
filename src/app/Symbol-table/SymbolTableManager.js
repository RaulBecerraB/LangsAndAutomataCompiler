export class SymbolTableManager {
  constructor() {
    this.symbolsMap = new Map()
    this.declaredVariables = {}
  }

  addSymbol(token, tipo = '') {
    this.symbolsMap.set(`${token}_${this.symbolsMap.size}`, { 
      lexema: token, 
      tipo 
    })
  }

  declareVariables(type, variables) {
    variables.forEach(variable => {
      this.declaredVariables[variable] = type
      this.addSymbol(variable, type)
    })
  }

  isVariableDeclared(variable) {
    return this.declaredVariables.hasOwnProperty(variable)
  }

  getSymbolTable() {
    return Array.from(this.symbolsMap.values())
  }
} 