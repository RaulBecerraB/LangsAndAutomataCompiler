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
W2= "Hi"
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

    // Procesar primero las declaraciones de variables
    lines.forEach((line, index) => {
      const lineTokens = line.trim().split(/[\s,]+/)
      if (['numero', 'decimal', 'palabra'].includes(lineTokens[0].toLowerCase())) {
        const type = lineTokens[0].toLowerCase()
        lineTokens.slice(1).forEach(variable => {
          if (/^[A-Za-z_]\w*$/.test(variable)) {
            declaredVariables[variable] = type
            symbolsMap.set(`${variable}_${symbolsMap.size}`, { lexema: variable, tipo: type })
          }
        })
      }
    })

    // Procesar las operaciones y asignaciones
    let lastIndex = 0
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i].trim()
      if (!token) continue

      // Encontrar la posición real del token en el texto
      lastIndex = text.indexOf(token, lastIndex)
      currentLine = getLineNumber(text, lastIndex)
      lastIndex += token.length

      // Verificar si el token es una variable (identificador)
      if (/^[A-Za-z_]\w*$/.test(token) && 
          !['numero', 'decimal', 'palabra'].includes(token) && 
          !declaredVariables.hasOwnProperty(token)) {
        errors.push({
          lexema: token,
          linea: currentLine,
          descripcion: 'Variable no declarada'
        })
      }

      // Manejar las comillas como lexemas separados
      if (token === '"') {
        symbolsMap.set(`"_${symbolsMap.size}`, { lexema: '"', tipo: '' })
        continue
      }

      // Eliminar las comillas al almacenar el token en la tabla de símbolos
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
            lexema: variable,
            linea: currentLine,
            descripcion: 'Variable no declarada'
          })
          continue
        }

        // Si hay una operación después del valor
        if (i + 2 < tokens.length && ['+', '-', '*', '/'].includes(tokens[i + 2])) {
          const operator = tokens[i + 2]
          const secondOperand = tokens[i + 3]

          // Verificar si el segundo operando está declarado (si es una variable)
          if (/^[A-Za-z_]\w*$/.test(secondOperand) && !declaredVariables.hasOwnProperty(secondOperand)) {
            errors.push({
              lexema: secondOperand,
              linea: currentLine,
              descripcion: 'Variable no declarada'
            })
            continue
          }

          const firstOperandType = getValueType(value)
          const secondOperandType = getValueType(secondOperand)

          // Validar tipos en operaciones
          if (firstOperandType === 'palabra' || secondOperandType === 'palabra') {
            errors.push({
              lexema: `${value} ${operator} ${secondOperand}`,
              linea: currentLine,
              descripcion: 'No se pueden realizar operaciones con tipos palabra'
            })
            continue
          }

          // Validar resultado de la operación con el tipo de la variable
          const resultType = firstOperandType === 'decimal' || secondOperandType === 'decimal' ? 'decimal' : 'numero'

          if (varType !== resultType && !(varType === 'decimal' && resultType === 'numero')) {
            errors.push({
              lexema: `${variable} = ${value} ${operator} ${secondOperand}`,
              linea: currentLine,
              descripcion: `Tipo incompatible en asignación: se esperaba ${varType} pero la operación resulta en ${resultType}`
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
                lexema: `${variable},${value}`,
                linea: currentLine,
                descripcion: `Tipo incompatible en asignación: se esperaba ${varType} pero se recibió ${valueType}`
              })
            }
          }
        }
      }

      // Actualizar tabla de símbolos
      if (!/[=+\-*/;,]/.test(token)) {
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

  // Move this useEffect after analyzeInput is defined
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

            {/* Nueva columna - Tabla de errores semánticos */}
            {input && (
              <div className="w-full md:w-1/3">
                <h2 className="text-[#0A2F7B] text-2xl font-semibold mb-3">
                  Errores Semánticos
                </h2>
                <div className="w-full">
                  <table className="w-full border-collapse border border-[#0A2F7B] text-sm">
                    <thead>
                      <tr className="bg-[#0A2F7B] text-white">
                        <th className="px-2 py-1 border border-[#0A2F7B]">Lexema</th>
                        <th className="px-2 py-1 border border-[#0A2F7B]">Línea</th>
                        <th className="px-2 py-1 border border-[#0A2F7B]">Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {semanticErrors.map((error, index) => (
                        <tr key={index} className="bg-white">
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
