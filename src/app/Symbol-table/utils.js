import { REGEX } from './regex'

export function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function getUniqueSymbols(symbols) {
  const uniqueMap = new Map();
  symbols.forEach(symbol => {
    if (!uniqueMap.has(symbol.lexema)) {
      uniqueMap.set(symbol.lexema, symbol);
    }
  });
  return Array.from(uniqueMap.values());
}

export const isArithmeticOperation = (tokens, currentIndex) => {
  return currentIndex + 2 < tokens.length && 
         ['+', '-', '*', '/'].includes(tokens[currentIndex + 2]);
}

export const isValidIdentifier = (identifier) => {
  return REGEX.VALID_IDENTIFIER.test(identifier);
}

export const isUndeclaredVariable = (variable, symbolTableManager) => {
  return isValidIdentifier(variable) && !symbolTableManager.isVariableDeclared(variable);
}

export const isUndeclaredToken = (token, symbolTableManager) => {
  return isValidIdentifier(token) && 
         !['numero', 'decimal', 'palabra'].includes(token) && 
         !symbolTableManager.isVariableDeclared(token);
}

export const isDifferentLine = (text, token, lastIndex, currentLineNumber, getLineNumber) => {
  return getLineNumber(text, text.indexOf(token, lastIndex)) !== currentLineNumber;
}

export const isInvalidDeclarationToken = (token) => {
  return token !== ',' && !isValidIdentifier(token);
}

export const isValidVariableToken = (token) => {
  return isValidIdentifier(token);
}

export const isSpecialSymbol = (token) => {
  return REGEX.SPECIAL_SYMBOLS.test(token);
}

export const isValidAssignment = (token, index, tokens) => {
  return token === '=' && index > 0 && index < tokens.length - 1;
}

export const isDataType = (token) => {
  return ['numero', 'decimal', 'palabra'].includes(token.toLowerCase());
} 