import { EXPRESIONES } from './regex'

export function dividirEnGrupos(arreglo, tamaño) {
  const grupos = [];
  for (let i = 0; i < arreglo.length; i += tamaño) {
    grupos.push(arreglo.slice(i, i + tamaño));
  }
  return grupos;
}

export function obtenerSimbolosUnicos(simbolos) {
  const mapaUnico = new Map();
  simbolos.forEach(simbolo => {
    if (!mapaUnico.has(simbolo.lexema)) {
      mapaUnico.set(simbolo.lexema, simbolo);
    }
  });
  return Array.from(mapaUnico.values());
}

export const esOperacionAritmetica = (tokens, indiceActual) => {
  let i = indiceActual + 2; // Empezamos después del primer operando
  let encontroOperador = false;

  while (i < tokens.length && tokens[i] !== ';') {
    const token = tokens[i].trim();
    
    // Si encontramos un operador, marcamos que la operación continúa
    if (['+', '-', '*', '/'].includes(token)) {
      encontroOperador = true;
      i++;
      continue;
    }
    
    // Si después de un operador no hay otro operando, terminamos
    if (encontroOperador && !['+', '-', '*', '/', ';'].includes(token)) {
      return true;
    }
    
    i++;
  }

  return encontroOperador;
}

export const esIdentificadorValido = (identificador) => {
  return EXPRESIONES.IDENTIFICADOR_VALIDO.test(identificador);
}

export const esVariableNoDeclarada = (variable, gestorTablaSimbolos) => {
  return esIdentificadorValido(variable) && !gestorTablaSimbolos.esVariableDeclarada(variable);
}

export const esTokenNoDeclarado = (token, gestorTablaSimbolos) => {
  return esIdentificadorValido(token) && 
         !['numero', 'decimal', 'palabra'].includes(token) && 
         !gestorTablaSimbolos.esVariableDeclarada(token);
}

export const esLineaDiferente = (texto, token, ultimoIndice, numeroLineaActual, obtenerNumeroLinea) => {
  return obtenerNumeroLinea(texto, texto.indexOf(token, ultimoIndice)) !== numeroLineaActual;
}

export const esTokenDeclaracionInvalido = (token) => {
  return token !== ',' && !esIdentificadorValido(token);
}

export const esTokenVariableValido = (token) => {
  return esIdentificadorValido(token);
}

export const esSimboloEspecial = (token) => {
  return ['+', '-', '*', '/', '=', ',', ';'].includes(token);
}

export const esAsignacion = (token, indice, tokens) => {
  return token === '=' && indice > 0 && indice < tokens.length - 1;
}

export const esTipoDato = (token) => {
  return ['numero', 'decimal', 'palabra'].includes(token.toLowerCase());
}

export const obtenerNumeroLinea = (texto, posicion) => {
  return texto.substring(0, posicion).split('\n').length
} 