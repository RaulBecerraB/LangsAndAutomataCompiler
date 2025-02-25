export const EXPRESIONES = {
  // Identificadores: deben comenzar con mayúscula y seguir con letras, números o guiones bajos
  IDENTIFICADOR_VALIDO: /^[A-Z][a-zA-Z0-9_]*$/,
  
  // Símbolos especiales: coma, punto y coma, comillas simples y dobles
  SIMBOLOS_ESPECIALES: /[,;'"+*=/-]/,
  
  // Analizador léxico: captura comillas, identificadores, números y símbolos por separado
  ANALIZADOR: /([A-Za-z_]\w*|\d*\.?\d+|[=+\-*/;,(){}"]|[^ \t\n])/g
} 