"use client"
import { useState } from 'react'

function App() {
    const [input, setInput] = useState('')
    const [isValid, setIsValid] = useState(false)
    const [symbolTable, setSymbolTable] = useState([])

    const validateInput = (text) => {
        const regex = /^[A-Z][a-zA-Z0-9_]*$/
        setIsValid(regex.test(text))
        setInput(text)

        // Crear tabla de símbolos - capturamos todos los caracteres incluyendo operadores
        const tokens = text.match(/(".*?"|[A-Za-z_]\w*|\d*\.?\d+|[=+\-*/;,()]|[^ \t\n])/g) || []
        const uniqueTokens = [...new Set(tokens)]
        const symbols = uniqueTokens.map(token => ({
            lexema: token,
            tipo: getTokenType(token)
        }))
        setSymbolTable(symbols)
    }

    const getTokenType = (token) => {
        // Tipos de datos (palabras reservadas)
        if (token === 'int') return 'int'
        if (token === 'float') return 'float'
        if (token === 'string') return 'string'

        // Valores
        if (/^[A-Za-z_]\w*$/.test(token)) return 'string'
        if (/^\d*\.\d+$/.test(token)) return 'float'
        if (/^\d+$/.test(token)) return 'int'

        // Variables (identificadores)
        if (/^[A-Za-z_]\w*$/.test(token)) return 'int'

        return '' // Ahora todos los demás símbolos aparecerán con tipo vacío
    }

    return (
        <div className="flex items-center justify-center">
            <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-[#0A2F7B] px-6 py-5 ">
                    <h1 className="text-white text-xl font-semibold m-0">
                        Validador de regex - Unidad 1 - Lenguajes y autómatas II - Equipo 5
                    </h1>
                </div>
                <div className="p-6">
                    <h2 className="text-[#0A2F7B] text-2xl font-semibold mb-3">
                        Expresión regular
                    </h2>
                    <div className="mb-6 font-normal text-2xl">
                        (A-Z)(a-z U A-Z U 0-9 U _)*
                    </div>

                    <h2 className="text-[#0A2F7B] text-2xl font-semibold mb-3">
                        Entrada
                    </h2>
                    <textarea
                        value={input}
                        onChange={(e) => validateInput(e.target.value)}
                        placeholder="Ingrese código..."
                        className="w-full px-4 py-3 rounded-lg border border-[#0A2F7B] mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="5"
                    />

                    <h2 className="text-[#0A2F7B] text-2xl font-semibold mb-3">
                        Salida
                    </h2>
                    <div className={`min-h-[45px] px-4 py-3 rounded-lg border border-[#0A2F7B] bg-gray-50 ${input ? (isValid ? 'text-green-600' : 'text-red-600') : ''
                        }`}>
                        {input && (isValid ? 'Palabra correcta' : 'Palabra incorrecta')}
                    </div>

                    {input && (
                        <>
                            <h2 className="text-[#0A2F7B] text-2xl font-semibold mb-3 mt-6">
                                Tabla de Símbolos
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-[#0A2F7B]">
                                    <thead>
                                        <tr className="bg-[#0A2F7B] text-white">
                                            <th className="px-4 py-2 border border-[#0A2F7B]">Lexema</th>
                                            <th className="px-4 py-2 border border-[#0A2F7B]">Tipo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {symbolTable.map((symbol, index) => (
                                            <tr key={index} className="bg-white">
                                                <td className="px-4 py-2 border border-[#0A2F7B] text-center">{symbol.lexema}</td>
                                                <td className="px-4 py-2 border border-[#0A2F7B] text-center">{symbol.tipo}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
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

export default App
