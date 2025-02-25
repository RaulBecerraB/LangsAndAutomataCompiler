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
  const entradaPredeterminada = `numero A,B,C
decimal D,E,F
palabra W1,W2,W3
A = "Hola"
E = "Mundo"
C = 123
W1 = 22
W2 = "Hi"
W3 = "World"
D = 12.2
E = 3.14
F = 2.33
D = E + F
F = E / W2
W2 = W3 * D
C = C + W2`

  const [entrada, setEntrada] = useState(entradaPredeterminada)
  const [tablaSimbolos, setTablaSimbolos] = useState([])
  const [erroresSemanticos, setErroresSemanticos] = useState([])

  const analizarEntrada = (texto) => {
    ///////////////////////////////////////////////////////////////////////////////
    //Casos de uso: ANALIZADOR
    ///////////////////////////////////////////////////////////////////////////////
    //Paso 1: Dividir el texto en tokens usando una expresión regular
    const tokens = texto.match(EXPRESIONES.ANALIZADOR) || []
    ///////////////////////////////////////////////////////////////////////////////
    //Paso 2: Crear gestores, aquí se almacenan los errores y la tabla de simbolos
    const gestorTablaSimbolos = new GestorTablaSimbolos()
    const gestorErrores = new GestorErrores()

    //Paso 3: Definir variables para obtener numero de linea
    let lineaActual = 1
    let ultimoIndice = 0

    //Paso 4: Procesar tokens y obtener numero de linea
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i].trim()
      if (!token) continue

      ultimoIndice = texto.indexOf(token, ultimoIndice)
      lineaActual = obtenerNumeroLinea(texto, ultimoIndice)
      ultimoIndice += token.length

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
          continue;
        } else if (!gestorTablaSimbolos.esVariableDeclarada(token)) {
          gestorErrores.agregarError(token, lineaActual, 'Variable indefinida')
          tieneError = true;
          continue;
        }
      }

      if (!tieneError && esAsignacion(token, i, tokens)) {
        // Verificar si es una declaración y asignación en la misma línea
        const esTipoDatoAnterior = i > 0 && esTipoDato(tokens[i - 2]);
        if (!esTipoDatoAnterior) {
          manejarAsignacion(
            tokens, i, lineaActual,
            gestorTablaSimbolos,
            gestorErrores
          );
        }
      }

      const tipo = VerificadorTipos.obtenerTipoValor(token, gestorTablaSimbolos.variablesDeclaradas)
      gestorTablaSimbolos.agregarSimbolo(token, tipo)
    }

    setErroresSemanticos(gestorErrores.obtenerErrores())
    setTablaSimbolos(gestorTablaSimbolos.obtenerTablaSimbolos())
    setEntrada(texto)
  }

  const manejarAsignacion = (tokens, i, lineaActual, gestorTablaSimbolos, gestorErrores) => {
    const variable = tokens[i - 1]
    let valor = tokens[i + 1]
    const tipoVariable = gestorTablaSimbolos.variablesDeclaradas[variable]

    if (!gestorTablaSimbolos.esVariableDeclarada(variable)) {
      gestorErrores.agregarError(variable, lineaActual, 'Variable indefinida')
      return
    }

    // Nuevo: Manejar strings que vienen como tokens separados
    if (valor === '"' || valor === "'") {
      // Si el valor empieza con comillas, concatenamos los tokens hasta encontrar la comilla de cierre
      let stringCompleto = ''
      let j = i + 2  // Empezamos después de la comilla de apertura
      while (j < tokens.length && tokens[j] !== '"' && tokens[j] !== "'") {
        stringCompleto += tokens[j].trim()
        j++
      }
      valor = stringCompleto
    }

    if (esOperacionAritmetica(tokens, i)) {
      manejarOperacion(
        tokens, i, lineaActual, variable, valor,
        gestorTablaSimbolos, gestorErrores
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

  const manejarOperacion = (tokens, i, lineaActual, variable, valor, gestorTablaSimbolos, gestorErrores) => {
    ///////////////////////////////////////////////////////////////////////////////
    //Caso de uso: OPERACIONES ARITMETICAS
    //Estas variables sirven como base para determinar si existe un error en la operación
    ///////////////////////////////////////////////////////////////////////////////
    const operador = tokens[i + 2]
    const segundoOperando = tokens[i + 3]
    const tipoVariable = gestorTablaSimbolos.variablesDeclaradas[variable]

    const tipoPrimerOperando = VerificadorTipos.obtenerTipoValor(valor, gestorTablaSimbolos.variablesDeclaradas)
    const tipoSegundoOperando = VerificadorTipos.obtenerTipoValor(segundoOperando, gestorTablaSimbolos.variablesDeclaradas)
    const tipoResultado = VerificadorTipos.obtenerTipoResultado(tipoPrimerOperando, tipoSegundoOperando)
    ///////////////////////////////////////////////////////////////////////////////
    //Casos de uso: ERRORES SEMANTICOS 
    ///////////////////////////////////////////////////////////////////////////////
    //Caso 1: Variable no declarada
    if (esVariableNoDeclarada(segundoOperando, gestorTablaSimbolos)) {
      gestorErrores.agregarError(segundoOperando, lineaActual, 'Variable indefinida')
      return
    }

    //Caso 2: Incompatibilidad de tipos
    if (!tipoResultado) {
      gestorErrores.agregarError(
        `${valor} ${operador} ${segundoOperando}`,
        lineaActual,
        'Incompatibilidad de tipos en operación'
      )
      return
    }

    //Caso 3: Incompatibilidad de tipos
    if (!VerificadorTipos.esCompatible(tipoVariable, tipoResultado)) {
      gestorErrores.agregarError(
        `${variable} = ${valor} ${operador} ${segundoOperando}`,
        lineaActual,
        `Incompatibilidad de tipos, ${tipoVariable}`
      )
    }
    ///////////////////////////////////////////////////////////////////////////////
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

