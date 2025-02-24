export class VerificadorTipos {
  static compatibilidadTipos = {
    numero: { numero: true, decimal: false, palabra: false },
    decimal: { numero: true, decimal: true, palabra: false },
    palabra: { numero: false, decimal: false, palabra: true }
  }

  static tiposResultadoOperaciones = {
    numero: { numero: 'numero', decimal: 'decimal', palabra: null },
    decimal: { numero: 'decimal', decimal: 'decimal', palabra: null },
    palabra: { numero: null, decimal: null, palabra: null }
  }

  static obtenerTipoValor(valor, variablesDeclaradas) {
    if (!valor) return ''
    if (valor === '"') return ''
    if (valor.startsWith('"') && valor.endsWith('"')) return 'palabra'
    if (valor.includes('.')) return 'decimal'
    if (!isNaN(valor)) return 'numero'
    return variablesDeclaradas[valor] || null
  }

  static esCompatible(tipoVariable, tipoValor) {
    return this.compatibilidadTipos[tipoVariable]?.[tipoValor] || false
  }

  static obtenerTipoResultado(tipo1, tipo2) {
    return this.tiposResultadoOperaciones[tipo1]?.[tipo2]
  }
} 