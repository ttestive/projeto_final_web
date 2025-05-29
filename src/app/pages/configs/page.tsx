'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Phone } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext' // Importe o hook useTheme

export default function ConfiguracoesApp() {
  // Remova o useState local para darkMode
  // const [darkMode, setDarkMode] = useState(false)

  // Use o hook useTheme para acessar o tema e a função de toggle
  const { theme, toggleTheme } = useTheme()
  const [idioma, setIdioma] = useState('pt')

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#142582] dark:text-[#a7a7e6]">Configurações do Aplicativo</h1> {/* Adicione estilo dark */}

      <Card className="mb-6 bg-white dark:bg-gray-800 dark:text-gray-100"> {/* Adicione estilo dark */}
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <Label className="text-base">Tema escuro</Label>
            <Switch
              checked={theme === 'dark'} // O checked agora reflete o tema global
              onCheckedChange={toggleTheme} // onCheckedChange chama a função toggleTheme do contexto
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-base">Idioma</Label>
            <Select value={idioma} onValueChange={setIdioma}>
              <SelectTrigger className="w-40 bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"> {/* Adicione estilo dark */}
                <SelectValue placeholder="Selecione o idioma" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700 dark:text-gray-100"> {/* Adicione estilo dark */}
                <SelectItem value="pt">Português</SelectItem>
                <SelectItem value="en">Inglês</SelectItem>
                <SelectItem value="es">Espanhol</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 dark:text-gray-100"> {/* Adicione estilo dark */}
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Suporte</h2>
          <div className="flex items-center gap-2 text-[#1800DE] dark:text-[#a7a7e6]"> {/* Adicione estilo dark */}
            <Phone className="w-5 h-5" />
            <span className="text-base">(61) 99999-9999</span>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6 bg-gray-200 dark:bg-gray-700" /> {/* Adicione estilo dark */}
    </div>
  )
}