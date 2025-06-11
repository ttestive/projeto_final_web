'use client'

import Link from 'next/link'
import { ArrowRight, Book, CalendarIcon, LayoutDashboardIcon, User2Icon } from 'lucide-react'
import Image from 'next/image'
import { Component } from '@/components/pie_chart_materias'
import { Component2 } from '@/components/bar_chart'
import { Component3 } from '@/components/bar_chart2'


export default function DashboardGeral() {
  return (
    <div className="min-h-screen bg-white pb-12">
      <div className="relative h-40 w-full bg-[#142582] flex items-center justify-center">
        <div className="flex items-center text-white text-3xl font-bold">
          <User2Icon className="h-9 w-9 mr-3" />
          <h1>Overview Alunos</h1>
        </div>
      </div>

      <div className="flex flex-col gap-8 p-6">
        <div className="flex-1 min-h-[300px]">
          <Component />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-8 min-h-[450px] w-300">
            <div className="flex-1">
                <Component2 />
            </div>
        </div>
      </div>
    </div>
  )
}