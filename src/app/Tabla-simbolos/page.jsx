"use client"
import { useState, useEffect } from 'react'
import RenderizadorTablas from '@/components/SymbolTableRenderer'
import { VerificadorTipos } from './VerificadorTipos'
import { GestorTablaSimbolos } from './GestorTablaSimbolos'
import { GestorErrores } from './GestorErrores'
import { EXPRESIONES } from './regex'
import {
  esOperacionAritmetica,
  esVariableNoDeclarada,
  esTokenNoDeclarado,
  esLineaDiferente,
  esTokenDeclaracionInvalido,
  esTokenVariableValido,
  esSimboloEspecial,
  esAsignacion,
  esTipoDato,
  obtenerNumeroLinea
} from './utilidades'

export default function TablaSimbolos() {
  const entradaPredeterminada = `numero A,B,C;
decimal D,E,F;
palabra W1,W2,W3;
A = "Hola";
E = "Mundo";
C = 123;
W1 = 22;
W2 = "Hi";
W3 = "World";
D = 12.2;
E = 3.14;
F = 2.33;
D = E + F;
F = E / W2;
W2 = W3 * D;
C = C + W2;`

  const [entrada, setEntrada] = useState(entradaPredeterminada)
  const [tablaSimbolos, setTablaSimbolos] = useState([])
  const [erroresSemanticos, setErroresSemanticos] = useState([])

  const analizarEntrada = (texto) => {
    // Paso 1: Crear gestores
    const gestorTablaSimbolos = new GestorTablaSimbolos()
    const gestorErrores = new GestorErrores()
    gestorErrores.reiniciarContador()

    // Paso 2: Verificar punto y coma al final de cada línea (una sola vez)
    const lineas = texto.split('\n')
    lineas.forEach((linea, index) => {
      const lineaTrimmed = linea.trim()
      if (lineaTrimmed.length > 0 && !lineaTrimmed.endsWith(';')) {
        gestorErrores.agregarError(
          lineaTrimmed,
          index + 1,
          'Falta punto y coma (;) al final de la instrucción'
        )
      }

      // Verificar comillas sin cerrar en cada línea
      const comillasEnLinea = (lineaTrimmed.match(/"/g) || []).length
      if (comillasEnLinea % 2 !== 0) {
        gestorErrores.agregarError(
          lineaTrimmed,
          index + 1,
          'Falta comilla de cierre en la cadena'
        )
        return; // Saltar esta línea si tiene error de comillas
      }
    })

    // Paso 3: Dividir el texto en tokens usando una expresión regular
    const tokens = texto.match(EXPRESIONES.ANALIZADOR) || []

    // Paso 4: Definir variables para obtener numero de linea
    let lineaActual = 1
    let ultimoIndice = 0

    // Paso 5: Procesar tokens
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i].trim()
      if (!token) continue

      ultimoIndice = texto.indexOf(token, ultimoIndice)
      lineaActual = obtenerNumeroLinea(texto, ultimoIndice)
      ultimoIndice += token.length

      // Si la línea tiene error de comillas, saltarla
      const lineaActualTexto = lineas[lineaActual - 1]
      const comillasEnLinea = (lineaActualTexto.match(/"/g) || []).length
      if (comillasEnLinea % 2 !== 0) {
        // Saltar al siguiente token que esté en la siguiente línea
        while (i < tokens.length) {
          const nextToken = tokens[i + 1]
          if (!nextToken) break
          const nextTokenLine = obtenerNumeroLinea(texto, texto.indexOf(nextToken, ultimoIndice))
          if (nextTokenLine > lineaActual) break
          i++
        }
        continue
      }

      // Manejar tokens dentro de strings
      if (token === '"' || token === "'") {
        // Agregar la comilla de apertura a la tabla de símbolos
        gestorTablaSimbolos.agregarSimbolo(token)

        // Avanzar hasta encontrar la comilla de cierre
        i++
        while (i < tokens.length && tokens[i] !== '"' && tokens[i] !== "'") {
          gestorTablaSimbolos.agregarSimbolo(tokens[i].trim(), 'palabra')
          i++
        }
        // Agregar la comilla de cierre a la tabla de símbolos
        if (i < tokens.length) {
          gestorTablaSimbolos.agregarSimbolo(tokens[i])
        }
        continue
      }

      if (esTipoDato(token)) {
        const tipo = token.toLowerCase()
        gestorTablaSimbolos.agregarSimbolo(token)

        //Paso 4.3.1: Obtener variables
        let j = i + 1
        const numeroLineaActual = lineaActual
        let variables = []
        while (j < tokens.length) {
          const siguienteToken = tokens[j].trim()
          if (esLineaDiferente(texto, siguienteToken, ultimoIndice, numeroLineaActual, obtenerNumeroLinea)) break
          if (esTokenDeclaracionInvalido(siguienteToken) && !esTokenVariableValido(siguienteToken)) break
          if (esTokenVariableValido(siguienteToken)) {
            variables.push(siguienteToken)

            // Verificar si el siguiente token es una coma y agregarla después de la variable
            if (j + 1 < tokens.length && tokens[j + 1].trim() === ',') {
              gestorTablaSimbolos.agregarSimbolo(tokens[j + 1].trim())
            }
          }
          j++
        }
        gestorTablaSimbolos.declararVariables(tipo, variables)
        i = j - 1
        continue
      }

      let variablesVerificadas = new Set(); // Agregamos un Set para trackear variables ya verificadas

      let tieneError = false;
      // Verificar variables no declaradas y nombres de variables inválidos
      if (!esSimboloEspecial(token) &&
        !esTipoDato(token) &&
        token !== '"' &&
        token !== "'" &&
        isNaN(token)) {
        if (!esTokenVariableValido(token)) {
          gestorErrores.agregarError(token, lineaActual, 'Nombre de variable inválido')
          tieneError = true;
        } else if (!gestorTablaSimbolos.esVariableDeclarada(token) && !variablesVerificadas.has(token)) {
          gestorErrores.agregarError(token, lineaActual, 'Variable indefinida')
          variablesVerificadas.add(token); // Agregamos la variable al Set
          tieneError = true;
        }
        if (tieneError) continue;
      }

      if (!tieneError && esAsignacion(token, i, tokens)) {
        // Verificar si es una declaración y asignación en la misma línea
        const esTipoDatoAnterior = i > 0 && esTipoDato(tokens[i - 2]);
        if (!esTipoDatoAnterior) {
          manejarAsignacion(
            tokens, i, lineaActual,
            gestorTablaSimbolos,
            gestorErrores,
            texto,
            ultimoIndice
          );
        }
      }

      const tipo = VerificadorTipos.obtenerTipoValor(token, gestorTablaSimbolos.variablesDeclaradas)
      gestorTablaSimbolos.agregarSimbolo(token, tipo)
    }

    // Ordenar y recalcular tokens de errores
    const erroresOrdenados = gestorErrores.obtenerErrores()
    erroresOrdenados.forEach((error, index) => {
      error.token = `ErrSem${index + 1}`
    })

    setErroresSemanticos(erroresOrdenados)
    setTablaSimbolos(gestorTablaSimbolos.obtenerTablaSimbolos())
    setEntrada(texto)
  }

  const manejarAsignacion = (tokens, i, lineaActual, gestorTablaSimbolos, gestorErrores, entrada, ultimoIndice) => {
    const variable = tokens[i - 1]
    let valor = tokens[i + 1]
    const tipoVariable = gestorTablaSimbolos.variablesDeclaradas[variable]

    if (!gestorTablaSimbolos.esVariableDeclarada(variable)) {
      return;
    }

    // Manejar strings que vienen como tokens separados
    if (valor === '"' || valor === "'") {
      let stringCompleto = ''
      let j = i + 2  // Empezamos después de la comilla de apertura
      let lineaInicial = lineaActual
      let encontroComillaCierre = false

      while (j < tokens.length && tokens[j] !== '"' && tokens[j] !== "'") {
        let posicionToken = entrada.indexOf(tokens[j], ultimoIndice)
        let lineaToken = obtenerNumeroLinea(entrada, posicionToken)

        if (lineaToken !== lineaInicial) {
          gestorErrores.agregarError(
            variable + ' = "' + stringCompleto + tokens[j - 1],
            lineaInicial,
            'Falta comilla de cierre en la cadena'
          )
          // Saltar al final de la línea actual
          while (j < tokens.length) {
            let nextTokenLine = obtenerNumeroLinea(entrada, entrada.indexOf(tokens[j], ultimoIndice))
            if (nextTokenLine > lineaInicial) break;
            j++;
          }
          return i = j - 1; // Actualizar el índice principal para saltar tokens
        }
        stringCompleto += tokens[j].trim()
        j++
      }

      if (j < tokens.length && (tokens[j] === '"' || tokens[j] === "'")) {
        encontroComillaCierre = true;
      }

      // Si no se encontró la comilla de cierre, agregar error
      if (!encontroComillaCierre) {
        gestorErrores.agregarError(
          variable + ' = "' + stringCompleto,
          lineaInicial,
          'Falta comilla de cierre en la cadena'
        )
        return;
      }

      valor = stringCompleto
    }

    if (esOperacionAritmetica(tokens, i)) {
      manejarOperacion(
        tokens, i, lineaActual, variable, valor,
        gestorTablaSimbolos, gestorErrores,
        entrada, ultimoIndice
      )
    } else {
      const tipoValor = VerificadorTipos.obtenerTipoValor(valor, gestorTablaSimbolos.variablesDeclaradas)
      if (!VerificadorTipos.esCompatible(tipoVariable, tipoValor)) {
        gestorErrores.agregarError(
          `${variable}, ${valor}`,
          lineaActual,
          `Incompatibilidad de tipos, ${tipoVariable}`
        )
      }
    }
  }

  const manejarOperacion = (tokens, i, lineaActual, variable, valor, gestorTablaSimbolos, gestorErrores, entrada, ultimoIndice) => {
    const operador = tokens[i + 2]
    let segundoOperando = tokens[i + 3]
    const tipoVariable = gestorTablaSimbolos.variablesDeclaradas[variable]

    // Manejar strings en el segundo operando
    if (segundoOperando === '"' || segundoOperando === "'") {
      let stringCompleto = ''
      let j = i + 4  // Empezamos después de la comilla de apertura
      let lineaInicial = lineaActual

      while (j < tokens.length && tokens[j] !== '"' && tokens[j] !== "'") {
        let posicionToken = entrada.indexOf(tokens[j], ultimoIndice)
        let lineaToken = obtenerNumeroLinea(entrada, posicionToken)

        if (lineaToken !== lineaInicial) {
          gestorErrores.agregarError(
            `${variable} = ${valor} ${operador} "${stringCompleto}`,
            lineaInicial,
            'Falta comilla de cierre en la cadena'
          )
          return;
        }
        stringCompleto += tokens[j].trim()
        j++
      }
      segundoOperando = stringCompleto
    }

    const tipoPrimerOperando = VerificadorTipos.obtenerTipoValor(valor, gestorTablaSimbolos.variablesDeclaradas)
    const tipoSegundoOperando = VerificadorTipos.obtenerTipoValor(segundoOperando, gestorTablaSimbolos.variablesDeclaradas)

    console.log('Operación:', {
      valor,
      operador,
      segundoOperando,
      tipoPrimerOperando,
      tipoSegundoOperando
    });

    // Verificar incompatibilidad de tipos en la operación
    if (tipoPrimerOperando !== tipoSegundoOperando) {
      gestorErrores.agregarError(
        `${valor} ${operador} ${segundoOperando}`,
        lineaActual,
        'Incompatibilidad de tipos en operación'
      )
      return
    }

    // Verificar variables no declaradas
    if (esVariableNoDeclarada(segundoOperando, gestorTablaSimbolos)) {
      return;
    }

    // Verificar compatibilidad con la variable de asignación
    if (!VerificadorTipos.esCompatible(tipoVariable, tipoPrimerOperando)) {
      gestorErrores.agregarError(
        `${variable} = ${valor} ${operador} ${segundoOperando}`,
        lineaActual,
        `Incompatibilidad de tipos, ${tipoVariable}`
      )

    }
  }

  useEffect(() => {
    analizarEntrada(entradaPredeterminada)
  }, [])

  return (
    <RenderizadorTablas
      input={entrada}
      symbolTable={tablaSimbolos}
      semanticErrors={erroresSemanticos}
      onInputChange={analizarEntrada}
    />
  )
}

