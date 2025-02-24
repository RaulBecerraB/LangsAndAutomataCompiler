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