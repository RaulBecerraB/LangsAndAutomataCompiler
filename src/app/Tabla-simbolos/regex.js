export const EXPRESIONES = {
  // Identificadores: comienzan con letra o _ seguido de letras, números o _
  IDENTIFICADOR_VALIDO: /^[A-Za-z_]\w*$/,
  
  // Símbolos especiales: coma, punto y coma, comillas simples y dobles
  SIMBOLOS_ESPECIALES: /[,;'"]/,
  
  // Analizador léxico: captura cadenas entre comillas, identificadores, números y símbolos
  ANALIZADOR: /(".*?"|[A-Za-z_]\w*|\d*\.?\d+|[=+\-*/;,(){}]|"|[^ \t\n])/g
} 