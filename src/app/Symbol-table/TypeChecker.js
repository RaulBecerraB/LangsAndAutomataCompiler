export class TypeChecker {
  static typeCompatibility = {
    numero: { numero: true, decimal: false, palabra: false },
    decimal: { numero: true, decimal: true, palabra: false },
    palabra: { numero: false, decimal: false, palabra: true }
  }

  static operationResultTypes = {
    numero: { numero: 'numero', decimal: 'decimal', palabra: null },
    decimal: { numero: 'decimal', decimal: 'decimal', palabra: null },
    palabra: { numero: null, decimal: null, palabra: null }
  }

  static getValueType(value, declaredVariables) {
    if (!value) return ''
    if (value === '"') return ''
    if (value.startsWith('"') && value.endsWith('"')) return 'palabra'
    if (value.includes('.')) return 'decimal'
    if (!isNaN(value)) return 'numero'
    return declaredVariables[value] || null
  }

  static isCompatible(varType, valueType) {
    return this.typeCompatibility[varType]?.[valueType] || false
  }

  static getOperationResultType(type1, type2) {
    return this.operationResultTypes[type1]?.[type2]
  }
} 