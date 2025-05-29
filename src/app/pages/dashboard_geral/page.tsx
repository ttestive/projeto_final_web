'use client'

import Link from 'next/link'
import { ArrowRight, Book, CalendarIcon, LayoutDashboardIcon, User2Icon } from 'lucide-react'
import Image from 'next/image'
import { Component } from '@/components/pie_chart_materias' // Seu primeiro gráfico (que está na primeira linha)
import { Component2 } from '@/components/bar_chart'      // Seu segundo gráfico (vai para a segunda linha, coluna 1)
import { Component3 } from '@/components/bar_chart2' // Seu terceiro gráfico (vai para a segunda linha, coluna 2)


export default function DashboardGeral() {
  return (
    <div className="min-h-screen bg-white pb-12">
      {/* Header curvo com avatar */}
      <div className="relative h-40 w-full bg-[#142582]">
        {/* Conteúdo do seu cabeçalho */}
      </div>

      {/* Container para a primeira linha de gráficos (ex: Component) */}
      <div className="flex flex-col gap-8 p-6"> {/* p-6 para padding, gap-8 para espaço vertical entre linhas */}
        {/* Primeiro Gráfico (ocupa a primeira linha inteira) */}
        <div className="flex-1 min-h-[300px]">
          <Component />
        </div>

        {/* Container para a segunda linha: Component2 e Component3 lado a lado em 2 colunas */}
        {/* Usamos grid e grid-cols-2 aqui */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[300px] w-300">
            {/* Component2 na primeira coluna da segunda linha */}
            <div className="flex-1"> {/* Flex-1 aqui ainda é útil se o componente interno precisar de altura flexível */}
                <Component2 />
            </div>
            {/* Component3 na segunda coluna da segunda linha */}
            <div className="flex-0">
                <Component3 />
            </div>
        </div>
      </div>
    </div>
  )
}