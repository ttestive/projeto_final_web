'use client'

import { Card, CardContent } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { BarChart, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer } from 'recharts'
import { useState, useEffect } from 'react' // Importe useEffect
import axios from 'axios' // Importe axios
import { useTheme } from '@/context/ThemeContext' // Importe useTheme para estilos dark mode

// Definição de tipos para os dados que vêm do backend
interface TopAluno {
  nome: string;
  pontuacao: number;
}

interface MateriaData {
  nome: string;
  topAlunos: TopAluno[];
}

export default function MateriasPage() {
  const [materias, setMaterias] = useState<MateriaData[]>([]); // Estado para as matérias reais
  const [materiaSelecionada, setMateriaSelecionada] = useState<MateriaData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { theme } = useTheme(); // Obtenha o tema atual

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('http://localhost:3001/materias-com-top-alunos'); // Requisição para o backend
        setMaterias(response.data);
      } catch (err) {
        console.error('Erro ao buscar matérias:', err);
        setError('Não foi possível carregar as matérias. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, []); // Executa apenas uma vez ao montar o componente

  if (loading) {
    return <div className="min-h-screen bg-white px-6 py-8 text-center dark:bg-gray-900 dark:text-gray-100">Carregando matérias...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-white px-6 py-8 text-center text-red-500 dark:bg-gray-900 dark:text-red-300">{error}</div>;
  }

  if (materias.length === 0) {
    return <div className="min-h-screen bg-white px-6 py-8 text-center dark:bg-gray-900 dark:text-gray-100">Nenhuma matéria encontrada. Cadastre alunos e matérias primeiro.</div>;
  }


  // Define as cores do texto do gráfico com base no tema
  const chartTextColor = theme === 'dark' ? '#E2E8F0' : '#142582'; // Cinza claro para dark, seu azul escuro para light
  const chartBarColor = theme === 'dark' ? '#BE79DF' : '#1800DE'; // Uma cor diferente para a barra no dark mode

  return (
    <div className="min-h-screen bg-white px-6 py-8 dark:bg-gray-900 dark:text-gray-100">
      <h1 className="text-xl font-bold text-[#142582] mb-6 dark:text-[#a7a7e6]">Visualizar Matérias do Semestre</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {materias.map((materia, i) => (
          <Card key={materia.nome} onClick={() => setMateriaSelecionada(materia)} className="cursor-pointer hover:shadow-md transition border-[#1800DE] dark:border-[#BE79DF] bg-white dark:bg-gray-800"> {/* Estilos dark mode */}
            <CardContent className="p-4">
              <h2 className="text-[#1800DE] font-semibold text-lg text-center dark:text-[#BE79DF]">{materia.nome}</h2> {/* Estilos dark mode */}
            </CardContent>
          </Card>
        ))}
      </div>

      {materiaSelecionada && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-[#142582] mb-4 text-center dark:text-[#a7a7e6]">
            Top 3 Alunos - {materiaSelecionada.nome}
          </h2>
          <AspectRatio ratio={16 / 9} className="bg-[#EFFFFF] rounded-xl p-4 border border-[#00E0C0] dark:bg-gray-800 dark:border-[#4B8BBE]"> {/* Estilos dark mode */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={materiaSelecionada.topAlunos}>
                <XAxis dataKey="nome" stroke={chartTextColor}/> {/* Cor do texto do eixo X dinâmico */}
                <YAxis stroke={chartTextColor}/> {/* Cor do texto do eixo Y dinâmico */}
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.1)' }} // Cor de fundo do tooltip (para hover)
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', borderColor: theme === 'dark' ? '#555' : '#ccc', color: theme === 'dark' ? '#eee' : '#333' }} // Estilo do conteúdo do tooltip
                  itemStyle={{ color: theme === 'dark' ? '#eee' : '#333' }} // Estilo dos itens do tooltip
                />
                <Bar dataKey="pontuacao" fill={chartBarColor} radius={[8, 8, 0, 0]} /> {/* Cor da barra dinâmica */}
              </BarChart>
            </ResponsiveContainer>
          </AspectRatio>
        </div>
      )}
    </div>
  )
}