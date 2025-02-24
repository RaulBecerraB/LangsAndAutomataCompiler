import { esSimboloEspecial } from './utilidades'

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
    if (/^\d+\.\d+$/.test(valor)) return 'decimal'
    if (/^\d+$/.test(valor)) return 'numero'
    if (esSimboloEspecial(valor)) return ''
    return variablesDeclaradas[valor] || 'palabra'
  }

  static esCompatible(tipoVariable, tipoValor) {
    return this.compatibilidadTipos[tipoVariable]?.[tipoValor] || false
  }

  static obtenerTipoResultado(tipo1, tipo2) {
    return this.tiposResultadoOperaciones[tipo1]?.[tipo2]
  }
} 