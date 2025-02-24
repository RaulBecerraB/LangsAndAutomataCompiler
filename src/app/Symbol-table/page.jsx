"use client"
import { useState, useEffect } from 'react'

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

  // Función auxiliar para obtener símbolos únicos
  const getUniqueSymbols = (symbols) => {
    const uniqueMap = new Map();
    symbols.forEach(symbol => {
      if (!uniqueMap.has(symbol.lexema)) {
        uniqueMap.set(symbol.lexema, symbol);
      }
    });
    return Array.from(uniqueMap.values());
  }

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
    <div className="flex items-start justify-center px-6">
      <div className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-[#0A2F7B] px-6 py-5">
          <h1 className="text-white text-xl font-semibold m-0">
            Compilador Unidad 1 - Lenguajes y autómatas II
          </h1>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Columna izquierda - Entrada */}
            <div className="w-full md:w-1/4">
              <h2 className="text-[#0A2F7B] text-2xl font-semibold mb-3">
                Entrada del compilador
              </h2>
              <textarea
                value={input}
                onChange={(e) => analyzeInput(e.target.value)}
                placeholder="Ingrese código para analizar..."
                className="w-full px-4 py-3 rounded-lg border border-[#0A2F7B] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="17"
              />
            </div>

            {/* Columna central - Tabla de símbolos */}
            {input && (
              <div className="w-full md:w-2/5">
                <h2 className="text-[#0A2F7B] text-2xl font-semibold mb-3">
                  Tabla de símbolos
                </h2>
                <div className="flex flex-wrap gap-4">
                  {chunk(getUniqueSymbols(symbolTable), 15).map((tableChunk, chunkIndex) => (
                    <div key={chunkIndex} className="w-[200px]">
                      <table className="w-full border-collapse border border-[#0A2F7B] text-sm">
                        <thead>
                          <tr className="bg-[#0A2F7B] text-white">
                            <th className="px-2 py-1 border border-[#0A2F7B]">Lexema</th>
                            <th className="px-2 py-1 border border-[#0A2F7B]">Tipo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableChunk.map((symbol, index) => (
                            <tr key={`${chunkIndex}-${index}`} className="bg-white">
                              <td className="px-2 py-1 border border-[#0A2F7B] text-center">{symbol.lexema}</td>
                              <td className="px-2 py-1 border border-[#0A2F7B] text-center">{symbol.tipo}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Columna derecha - Tabla de errores semánticos */}
            {input && (
              <div className="w-full md:w-1/3">
                <h2 className="text-[#0A2F7B] text-2xl font-semibold mb-3">
                  Errores Semánticos
                </h2>
                <div className="w-full">
                  <table className="w-full border-collapse border border-[#0A2F7B] text-sm">
                    <thead>
                      <tr className="bg-[#0A2F7B] text-white">
                        <th className="px-2 py-1 border border-[#0A2F7B]">Token</th>
                        <th className="px-2 py-1 border border-[#0A2F7B]">Lexema</th>
                        <th className="px-2 py-1 border border-[#0A2F7B]">Línea</th>
                        <th className="px-2 py-1 border border-[#0A2F7B]">Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {semanticErrors.map((error, index) => (
                        <tr key={index} className="bg-white">
                          <td className="px-2 py-1 border border-[#0A2F7B] text-center">{error.token}</td>
                          <td className="px-2 py-1 border border-[#0A2F7B] text-center">{error.lexema}</td>
                          <td className="px-2 py-1 border border-[#0A2F7B] text-center">{error.linea}</td>
                          <td className="px-2 py-1 border border-[#0A2F7B] text-center">{error.descripcion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#0A2F7B] px-6 py-4 text-center">
          <p className="text-white text-sm">
            Powered by Raúl Becerra
          </p>
        </div>
      </div>
    </div>
  )
}

// Función auxiliar para dividir el array en chunks
function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
