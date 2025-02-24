export const REGEX = {
  // Identificadores: comienzan con letra o _ seguido de letras, números o _
  VALID_IDENTIFIER: /^[A-Za-z_]\w*$/,
  
  // Símbolos especiales: coma o punto y coma
  SPECIAL_SYMBOLS: /[,;]/,
  
  // Tokenizador: captura strings entre comillas, identificadores, números (enteros o decimales),
  // operadores y otros símbolos
  TOKENIZER: /(".*?"|[A-Za-z_]\w*|\d*\.?\d+|[=+\-*/;,(){}]|"|[^ \t\n])/g
} 