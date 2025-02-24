"use client"
import { useState, useEffect } from 'react'
import SymbolTableRenderer from './SymbolTableRenderer'

export default function SymbolTable() {
  const defaultInput = `numero A,B,C
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

  const [input, setInput] = useState(defaultInput)
  const [symbolTable, setSymbolTable] = useState([])
  const [semanticErrors, setSemanticErrors] = useState([])

  const analyzeInput = (text) => {
    const lines = text.split('\n')
    const tokens = text.match(/(".*?"|[A-Za-z_]\w*|\d*\.?\d+|[=+\-*/;,(){}]|"|[^ \t\n])/g) || []
    let declaredVariables = {}
    const symbolsMap = new Map()
    const errors = []
    let currentLine = 1
    let errorCounter = 1

    // Función para obtener el número de línea basado en la posición del texto
    const getLineNumber = (text, position) => {
      return text.substring(0, position).split('\n').length
    }

    // Función auxiliar para determinar el tipo de un valor
    const getValueType = (value) => {
      if (!value) return ''
      if (value === '"') return ''
      if (value.startsWith('"') && value.endsWith('"')) {
        symbolsMap.set(`"_${symbolsMap.size}`, { lexema: '"', tipo: '' })
        return 'palabra'
      }
      if (value.includes('.')) return 'decimal'
      if (!isNaN(value)) return 'numero'
      return declaredVariables[value] || null
    }

    let lastIndex = 0
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i].trim()
      if (!token) continue

      lastIndex = text.indexOf(token, lastIndex)
      currentLine = getLineNumber(text, lastIndex)
      lastIndex += token.length

      // Procesar declaraciones de variables (numero, decimal, palabra)
      if (['numero', 'decimal', 'palabra'].includes(token.toLowerCase())) {
        const type = token.toLowerCase()
        symbolsMap.set(`${token}_${symbolsMap.size}`, { lexema: token, tipo: '' })

        // Obtener todos los tokens hasta el final de la línea actual
        let j = i + 1
        const currentLineNumber = currentLine
        let variables = []
        while (j < tokens.length) {
          const nextToken = tokens[j].trim()
          if (getLineNumber(text, text.indexOf(nextToken, lastIndex)) !== currentLineNumber) {
            break
          }
          if (nextToken !== ',' && !/^[A-Za-z_]\w*$/.test(nextToken)) {
            break
          }
          if (/^[A-Za-z_]\w*$/.test(nextToken)) {
            variables.push(nextToken)
          }
          j++
        }
        // Registrar cada variable declarada
        variables.forEach(variable => {
          declaredVariables[variable] = type
          symbolsMap.set(`${variable}_${symbolsMap.size}`, { lexema: variable, tipo: type })
        })
        i = j - 1
        continue
      }

      // Verificar variables no declaradas (si no es parte de una declaración)
      if (/^[A-Za-z_]\w*$/.test(token) &&
        !['numero', 'decimal', 'palabra'].includes(token) &&
        !declaredVariables.hasOwnProperty(token)) {
        errors.push({
          token: `ErrSem${errorCounter++}`,
          lexema: token,
          linea: currentLine,
          descripcion: 'Variable indefinida'
        })
      }

      // Almacenar literales de cadena sin las comillas
      if (token.startsWith('"') && token.endsWith('"')) {
        const cleanToken = token.slice(1, -1)
        symbolsMap.set(`${cleanToken}_${symbolsMap.size}`, {
          lexema: cleanToken,
          tipo: 'palabra'
        })
        continue
      }

      if (token === '=' && i > 0 && i < tokens.length - 1) {
        const variable = tokens[i - 1]
        let value = tokens[i + 1]
        const varType = declaredVariables[variable]

        // Verificar si la variable está declarada
        if (!declaredVariables.hasOwnProperty(variable)) {
          errors.push({
            token: `ErrSem${errorCounter++}`,
            lexema: variable,
            linea: currentLine,
            descripcion: 'Variable indefinida'
          })
          continue
        }

        // Caso de operación aritmética
        if (i + 2 < tokens.length && ['+', '-', '*', '/'].includes(tokens[i + 2])) {
          const operator = tokens[i + 2]
          const secondOperand = tokens[i + 3]

          if (/^[A-Za-z_]\w*$/.test(secondOperand) && !declaredVariables.hasOwnProperty(secondOperand)) {
            errors.push({
              token: `ErrSem${errorCounter++}`,
              lexema: secondOperand,
              linea: currentLine,
              descripcion: 'Variable indefinida'
            })
            continue
          }

          const firstOperandType = getValueType(value)
          const secondOperandType = getValueType(secondOperand)

          // Si alguno es de tipo palabra, se considera incompatibilidad
          if (firstOperandType === 'palabra' || secondOperandType === 'palabra') {
            errors.push({
              token: `ErrSem${errorCounter++}`,
              lexema: `${value} ${operator} ${secondOperand}`,
              linea: currentLine,
              descripcion: 'Incompatibilidad de tipos, palabra'
            })
            continue
          }

          // Determinar tipo resultante (si alguno es decimal, resulta decimal; sino, número)
          const resultType = (firstOperandType === 'decimal' || secondOperandType === 'decimal') ? 'decimal' : 'numero'
          if (varType !== resultType && !(varType === 'decimal' && resultType === 'numero')) {
            errors.push({
              token: `ErrSem${errorCounter++}`,
              lexema: `${variable} = ${value} ${operator} ${secondOperand}`,
              linea: currentLine,
              descripcion: `Incompatibilidad de tipos, ${varType}`
            })
          }
        } else {
          // Asignación simple
          const valueType = getValueType(value)
          if (varType && valueType) {
            const isCompatible = (
              (varType === 'numero' && valueType === 'numero') ||
              (varType === 'decimal' && (valueType === 'decimal' || valueType === 'numero')) ||
              (varType === 'palabra' && valueType === 'palabra')
            )
            if (!isCompatible) {
              errors.push({
                token: `ErrSem${errorCounter++}`,
                lexema: `${variable}, ${value}`,
                linea: currentLine,
                descripcion: `Incompatibilidad de tipos, ${varType}`
              })
            }
          }
        }
      }

      // Procesar operadores aritméticos y de asignación
      if (/[=+\-*/]/.test(token)) {
        symbolsMap.set(`${token}_${symbolsMap.size}`, {
          lexema: token,
          tipo: ''
        })
        continue
      }

      // Manejar las comillas como lexemas separados
      if (token === '"') {
        symbolsMap.set(`"_${symbolsMap.size}`, { lexema: '"', tipo: '' })
        continue
      }

      // Agregar otros tokens a la tabla de símbolos
      if (!/[,;]/.test(token)) {
        symbolsMap.set(`${token}_${symbolsMap.size}`, {
          lexema: token,
          tipo: getValueType(token) || ''
        })
      }
    }

    setSemanticErrors(errors)
    setSymbolTable(Array.from(symbolsMap.values()))
    setInput(text)
  }

  useEffect(() => {
    analyzeInput(defaultInput)
  }, [])

  return (
    <SymbolTableRenderer
      input={input}
      symbolTable={symbolTable}
      semanticErrors={semanticErrors}
      onInputChange={analyzeInput}
    />
  )
}