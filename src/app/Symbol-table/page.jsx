"use client"
import { useState, useEffect } from 'react'
import SymbolTableRenderer from './SymbolTableRenderer'
import { TypeChecker } from './TypeChecker'
import { SymbolTableManager } from './SymbolTableManager'
import { ErrorManager } from './ErrorManager'
import {isUndeclaredVariable, isUndeclaredToken, isDifferentLine, isInvalidDeclarationToken, isValidVariableToken, isArithmeticOperation, isSpecialSymbol, isValidAssignment, isDataType } from './utils'

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
    const tokens = text.match(/(".*?"|[A-Za-z_]\w*|\d*\.?\d+|[=+\-*/;,(){}]|"|[^ \t\n])/g) || []
    const symbolTableManager = new SymbolTableManager()
    const errorManager = new ErrorManager()
    let currentLine = 1
    
    const getLineNumber = (text, position) => {
      return text.substring(0, position).split('\n').length
    }

    let lastIndex = 0
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i].trim()
      if (!token) continue

      lastIndex = text.indexOf(token, lastIndex)
      currentLine = getLineNumber(text, lastIndex)
      lastIndex += token.length

      // Procesar declaraciones de variables
      if (isDataType(token)) {
        const type = token.toLowerCase()
        symbolTableManager.addSymbol(token)

        let j = i + 1
        const currentLineNumber = currentLine
        let variables = []
        while (j < tokens.length) {
          const nextToken = tokens[j].trim()
          if (isDifferentLine(text, nextToken, lastIndex, currentLineNumber, getLineNumber)) break
          if (isInvalidDeclarationToken(nextToken)) break
          if (isValidVariableToken(nextToken)) {
            variables.push(nextToken)
          }
          j++
        }
        symbolTableManager.declareVariables(type, variables)
        i = j - 1
        continue
      }

      // Verificar variables no declaradas (solo si no es una declaración)
      if (isUndeclaredToken(token, symbolTableManager)) {
        errorManager.addError(token, currentLine, 'Variable indefinida')
      }

      // Verificar asignaciones y operaciones
      if (isValidAssignment(token, i, tokens)) {
        handleAssignment(
          tokens, i, currentLine,
          symbolTableManager,
          errorManager
        )
      }

      // Agregar otros símbolos
      if (!isSpecialSymbol(token)) {
        const tipo = TypeChecker.getValueType(token, symbolTableManager.declaredVariables)
        symbolTableManager.addSymbol(token, tipo)
      }
    }

    setSemanticErrors(errorManager.getErrors())
    setSymbolTable(symbolTableManager.getSymbolTable())
    setInput(text)
  }

  const handleAssignment = (tokens, i, currentLine, symbolTableManager, errorManager) => {
    const variable = tokens[i - 1]
    let value = tokens[i + 1]
    const varType = symbolTableManager.declaredVariables[variable]

    if (!symbolTableManager.isVariableDeclared(variable)) {
      errorManager.addError(variable, currentLine, 'Variable indefinida')
      return
    }

    // Caso de operación aritmética
    if (isArithmeticOperation(tokens, i)) {
      handleOperation(
        tokens, i, currentLine, variable, value,
        symbolTableManager, errorManager
      )
    } else {
      // Asignación simple
      const valueType = TypeChecker.getValueType(value, symbolTableManager.declaredVariables)
      if (!TypeChecker.isCompatible(varType, valueType)) {
        errorManager.addError(
          `${variable}, ${value}`,
          currentLine,
          `Incompatibilidad de tipos, ${varType}`
        )
      }
    }
  }

  const handleOperation = (tokens, i, currentLine, variable, value, symbolTableManager, errorManager) => {
    const operator = tokens[i + 2]
    const secondOperand = tokens[i + 3]
    const varType = symbolTableManager.declaredVariables[variable]

    if (isUndeclaredVariable(secondOperand, symbolTableManager)) {
      errorManager.addError(secondOperand, currentLine, 'Variable indefinida')
      return
    }

    const firstOperandType = TypeChecker.getValueType(value, symbolTableManager.declaredVariables)
    const secondOperandType = TypeChecker.getValueType(secondOperand, symbolTableManager.declaredVariables)
    const resultType = TypeChecker.getOperationResultType(firstOperandType, secondOperandType)

    if (!resultType) {
      errorManager.addError(
        `${value} ${operator} ${secondOperand}`,
        currentLine,
        'Incompatibilidad de tipos en operación'
      )
      return
    }

    if (!TypeChecker.isCompatible(varType, resultType)) {
      errorManager.addError(
        `${variable} = ${value} ${operator} ${secondOperand}`,
        currentLine,
        `Incompatibilidad de tipos, ${varType}`
      )
    }
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