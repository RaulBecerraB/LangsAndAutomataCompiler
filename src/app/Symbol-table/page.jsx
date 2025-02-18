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
    const tokens = text.match(/(".*?"|[A-Za-z_]\w*|\d*\.?\d+|[=+\-*/;,(){}]|"|[^ \t\n])/g) || []
    let declaredVariables = {}
    let currentType = null
    const symbolsMap = new Map()

    // Función auxiliar para determinar el tipo de un valor
    const getValueType = (value) => {
      if (value === '"') return ''  // Las comillas solas no tienen tipo
      if (value.startsWith('"') && value.endsWith('"')) {
        // Separamos las comillas del contenido
        symbolsMap.set(`"_${symbolsMap.size}`, { lexema: '"', tipo: '' })
        return 'palabra'
      }
      if (value.includes('.')) return 'decimal'
      if (!isNaN(value)) return 'numero'
      return null
    }

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i].trim()
      if (!token) continue

      if (['numero', 'decimal', 'palabra'].includes(token.toLowerCase())) {
        currentType = token.toLowerCase()
        if (i + 1 < tokens.length && /^[A-Za-z_]\w*$/.test(tokens[i + 1])) {
          symbolsMap.set(`${token}_${symbolsMap.size}`, { lexema: token, tipo: '' })
        }
        continue
      }

      if (currentType && /^[A-Za-z_]\w*$/.test(token)) {
        declaredVariables[token] = currentType
        symbolsMap.set(`${token}_${symbolsMap.size}`, { lexema: token, tipo: currentType })
      }
      else if (token === ',') {
        symbolsMap.set(`${token}_${symbolsMap.size}`, { lexema: token, tipo: '' })
      }
      else if (token === ';') {
        currentType = null
        symbolsMap.set(`${token}_${symbolsMap.size}`, { lexema: token, tipo: '' })
      }
      else if (token === '=' || token === '"') {  // Agregamos las comillas como token
        symbolsMap.set(`${token}_${symbolsMap.size}`, { lexema: token, tipo: '' })
      }
      else {
        // Si es un valor después de un signo igual
        if (i > 0 && tokens[i - 1] === '=') {
          const valueType = getValueType(token)
          if (token.startsWith('"') && token.endsWith('"')) {
            // Agregamos el contenido sin las comillas
            const content = token.slice(1, -1)
            symbolsMap.set(`${content}_${symbolsMap.size}`, { lexema: content, tipo: 'palabra' })
            // Agregamos la comilla de cierre
            symbolsMap.set(`"_${symbolsMap.size}`, { lexema: '"', tipo: '' })
          } else {
            symbolsMap.set(`${token}_${symbolsMap.size}`, { lexema: token, tipo: valueType || '' })
          }
        }
        // Para variables ya declaradas u otros tokens
        else if (declaredVariables[token]) {
          symbolsMap.set(`${token}_${symbolsMap.size}`, { lexema: token, tipo: declaredVariables[token] })
        }
        else {
          symbolsMap.set(`${token}_${symbolsMap.size}`, { lexema: token, tipo: '' })
        }
      }
    }

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
                rows="20"
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
