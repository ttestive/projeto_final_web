'use client'

import Link from 'next/link'
import { ArrowRight, Book, CalendarIcon, DeleteIcon, DropletIcon, Edit2Icon, InfoIcon, LayoutDashboardIcon, LucideDelete, RemoveFormattingIcon, User2Icon, UserCircle2Icon } from 'lucide-react'
import Image from 'next/image'

const features = [
  { label: 'Gerar relatório PDF', icon: CalendarIcon, page: '/pages/relatorio_aluno_pdf' },
  { label: 'Visualizar Matérias do Semestre', icon: Book , page: '/pages/materias_dashboard'},
  { label: 'Resultados', icon: LayoutDashboardIcon, page : '/pages/dashboard_geral' },
  { label: 'Cadastrar Alunos', icon: User2Icon, page: '/pages/cadastro_aluno' },
  { label: 'Regulamentos mandatórios', icon: InfoIcon, page: '#' },
  { label: 'Editar Informações', icon: Edit2Icon, page: '/pages/editar_aluno' }



]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white pb-12">
      {/* Header curvo com avatar */}
      <div className="relative h-40 bg-[#142582] rounded-b-full">
        <div className="absolute inset-x-0 top-24 flex justify-center">
          <div className="w-24 h-24 bg-white rounded-full border-4 border-[#00E0C0] flex items-center justify-center overflow-hidden">
            <Image
              src="/icons/Rectangle.svg"
              alt="Avatar"
              width={60}
              height={80}
            />
          </div>
        </div>
      </div>

      {/* Mensagem de boas-vindas */}
      <div className="mt-16 px-4">
        <div className="bg-[#142582] text-white rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-center">
              Sistema de Gerenciamento de Notas da Católica
            </h2>
            <ArrowRight className="w-5 h-5" />
          </div>
          <p className="text-sm mt-2">
            Relatório Semestral dos Alunos<br />
            "Encontre um relatório dinâmico de desempenho dos alunos da Universidade Católica"
          </p>
        </div>
      </div>

      {/* Grid de funcionalidades */}
      <div className="mt-8 px-4 grid grid-cols-3 gap-4">
        {features.map((item, i) => {
          const content = (
            <div
              className="bg-[#EFFFFF] text-[#142582] rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <div className="text-3xl">
                <item.icon className="w-8 h-8" />
              </div>
              <span className="mt-2 text-sm font-medium">{item.label}</span>
            </div>
          )

          return item.page ? (
            <Link key={i} href={item.page}>{content}</Link>
          ) : (
            <div key={i}>{content}</div>
          )
        })}
      </div>
    </div>
  )
}
