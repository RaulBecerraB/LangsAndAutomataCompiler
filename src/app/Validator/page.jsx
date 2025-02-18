"use client"
import { useState } from 'react'

function App() {
    const [input, setInput] = useState('')
    const [isValid, setIsValid] = useState(false)

    const validateInput = (text) => {
        // Expresión regular: debe comenzar con mayúscula y seguir con letras, números o guiones bajos
        const regex = /^[A-Z][a-zA-Z0-9_]*$/
        setIsValid(regex.test(text))
        setInput(text)
    }

    return (
        <div className="flex items-center justify-center">
            <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-[#0A2F7B] px-6 py-5">
                    <h1 className="text-white text-xl font-semibold m-0">
                        Compilador Unidad 1 - Lenguajes y autómatas II
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
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => validateInput(e.target.value)}
                        placeholder="Ingrese texto..."
                        className="w-full px-4 py-3 rounded-lg border border-[#0A2F7B] mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    <h2 className="text-[#0A2F7B] text-2xl font-semibold mb-3">
                        Salida
                    </h2>
                    <div className={`min-h-[45px] px-4 py-3 rounded-lg border border-[#0A2F7B] bg-gray-50 ${input ? (isValid ? 'text-green-600' : 'text-red-600') : ''
                        }`}>
                        {input && (isValid ? 'Palabra correcta' : 'Palabra incorrecta')}
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

export default App
