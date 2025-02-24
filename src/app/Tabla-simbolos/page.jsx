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
  esAsignacionValida,
  esTipoDato
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
    const tokens = texto.match(EXPRESIONES.ANALIZADOR) || []
    const gestorTablaSimbolos = new GestorTablaSimbolos()
    const gestorErrores = new GestorErrores()
    let lineaActual = 1
    
    const obtenerNumeroLinea = (texto, posicion) => {
      return texto.substring(0, posicion).split('\n').length
    }

    let ultimoIndice = 0
    for (let i = 0; i < tokens.length; i++) {
      const tokenOriginal = tokens[i]
      // Separar las comillas como tokens independientes
      const tokensSeparados = tokenOriginal.split(/(["'])/).filter(Boolean).map(t => t.trim())
      
      for (const token of tokensSeparados) {
        if (!token) continue

        ultimoIndice = texto.indexOf(token, ultimoIndice)
        lineaActual = obtenerNumeroLinea(texto, ultimoIndice)
        ultimoIndice += token.length

        // Procesar declaraciones de variables
        if (esTipoDato(token)) {
          const tipo = token.toLowerCase()
          gestorTablaSimbolos.agregarSimbolo(token)

          let j = i + 1
          const numeroLineaActual = lineaActual
          let variables = []
          while (j < tokens.length) {
            const siguienteToken = tokens[j].trim()
            if (esLineaDiferente(texto, siguienteToken, ultimoIndice, numeroLineaActual, obtenerNumeroLinea)) break
            if (esTokenDeclaracionInvalido(siguienteToken)) break
            if (esTokenVariableValido(siguienteToken)) {
              variables.push(siguienteToken)
            }
            j++
          }
          gestorTablaSimbolos.declararVariables(tipo, variables)
          i = j - 1
          continue
        }

        // Verificar variables no declaradas
        if (esTokenNoDeclarado(token, gestorTablaSimbolos)) {
          gestorErrores.agregarError(token, lineaActual, 'Variable indefinida')
        }

        // Verificar asignaciones y operaciones
        if (esAsignacionValida(token, i, tokens)) {
          manejarAsignacion(
            tokens, i, lineaActual,
            gestorTablaSimbolos,
            gestorErrores
          )
        }

        // Agregar otros símbolos (incluyendo las comillas)
        if (!esSimboloEspecial(token)) {
          const tipo = VerificadorTipos.obtenerTipoValor(token, gestorTablaSimbolos.variablesDeclaradas)
          gestorTablaSimbolos.agregarSimbolo(token, tipo)
        }
      }
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

    // Caso de operación aritmética
    if (esOperacionAritmetica(tokens, i)) {
      manejarOperacion(
        tokens, i, lineaActual, variable, valor,
        gestorTablaSimbolos, gestorErrores
      )
    } else {
      // Asignación simple
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
    const operador = tokens[i + 2]
    const segundoOperando = tokens[i + 3]
    const tipoVariable = gestorTablaSimbolos.variablesDeclaradas[variable]

    if (esVariableNoDeclarada(segundoOperando, gestorTablaSimbolos)) {
      gestorErrores.agregarError(segundoOperando, lineaActual, 'Variable indefinida')
      return
    }

    const tipoPrimerOperando = VerificadorTipos.obtenerTipoValor(valor, gestorTablaSimbolos.variablesDeclaradas)
    const tipoSegundoOperando = VerificadorTipos.obtenerTipoValor(segundoOperando, gestorTablaSimbolos.variablesDeclaradas)
    const tipoResultado = VerificadorTipos.obtenerTipoResultado(tipoPrimerOperando, tipoSegundoOperando)

    if (!tipoResultado) {
      gestorErrores.agregarError(
        `${valor} ${operador} ${segundoOperando}`,
        lineaActual,
        'Incompatibilidad de tipos en operación'
      )
      return
    }

    if (!VerificadorTipos.esCompatible(tipoVariable, tipoResultado)) {
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

