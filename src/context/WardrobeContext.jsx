import { createContext, useContext, useState } from 'react'

const WardrobeContext = createContext(null)

export function WardrobeProvider({ children }) {
  const [style, setStyle] = useState('eastern') // 'eastern' | 'western'

  return (
    <WardrobeContext.Provider value={{ style, setStyle }}>
      {children}
    </WardrobeContext.Provider>
  )
}

export function useWardrobe() {
  const ctx = useContext(WardrobeContext)
  if (!ctx) throw new Error('useWardrobe must be used within WardrobeProvider')
  return ctx
}
