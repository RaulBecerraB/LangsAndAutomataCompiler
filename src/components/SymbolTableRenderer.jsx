"use client"
import { chunk } from '../app/Symbol-table/utils'
import { getUniqueSymbols } from '../app/Symbol-table/utils'

export default function SymbolTableRenderer({ input, symbolTable, semanticErrors, onInputChange }) {
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
                onChange={(e) => onInputChange(e.target.value)}
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