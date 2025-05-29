'use client';

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import axios from 'axios';

// Definição do tipo para uma matéria
interface Materia {
  nome_materia: string;
  nota: number;
}

// Atualiza o tipo Student para incluir um array de matérias (opcional)
type Student = {
  id: number;
  name: string;
  idade: number;
  present: boolean;
  absent: boolean;
  materias?: Materia[]; // Adiciona a propriedade de matérias, que é opcional no estado inicial
};

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // UseEffect para carregar os alunos quando o componente for montado
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null); // Limpa erros anteriores
        const response = await axios.get('http://localhost:3001/alunos'); // Requisição GET
        const fetchedStudents: Student[] = response.data.map((aluno: any) => ({
          id: aluno.id,
          name: aluno.nome, // Mapeia 'nome' do BD para 'name' no frontend
          idade: aluno.idade,
          present: false, // Define o estado inicial de frequência
          absent: false,  // Define o estado inicial de frequência
        }));
        setStudents(fetchedStudents);
      } catch (err) {
        console.error('Erro ao buscar alunos:', err);
        setError('Não foi possível carregar os alunos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []); // O array vazio garante que o useEffect rode apenas uma vez ao montar

  const handleCheckbox = (index: number, field: 'present' | 'absent') => {
    const updated = students.map((s, i) => {
      if (i !== index) return s;
      return {
        ...s,
        present: field === 'present' ? !s.present : false,
        absent: field === 'absent' ? !s.absent : false,
      };
    });
    setStudents(updated);
  };

  // Função para gerar o PDF, agora buscando os detalhes do aluno
  const generatePDF = async (studentToExport: Student) => {
    try {
      // Faz uma nova requisição para buscar os detalhes (incluindo matérias) do aluno
      const response = await axios.get(`http://localhost:3001/alunos/${studentToExport.id}/detalhes`);
      const fullStudentData: Student = response.data;

      // Adicionado console.log para inspecionar os dados recebidos
      console.log('Dados completos do aluno recebidos do backend:', fullStudentData);

      const doc = new jsPDF();
      const dateNow = new Date(); // Cria um objeto Date com a data e hora atuais AQUI DENTRO

      doc.setFontSize(16);
      doc.text('Relatório de Frequência', 20, 20);
      doc.setFontSize(12);
      doc.text(`Nome: ${fullStudentData.name}`, 20, 40);
      doc.text(`Status: ${studentToExport.present ? 'Presente' : studentToExport.absent ? 'Ausente' : 'Não marcado'}`, 20, 50);
      doc.text(`Data: ${dateNow.toLocaleDateString()}`, 20, 60); // Data formatada
      doc.text(`Turma: 3A`, 20, 70); // Turma ainda está mockada

      // Adicionar as notas das matérias
      if (fullStudentData.materias && fullStudentData.materias.length > 0) {
        doc.setFontSize(14);
        doc.text('Notas por Matéria:', 20, 90);
        doc.setFontSize(12);
        let yPos = 100; // Posição Y inicial para as notas

        fullStudentData.materias.forEach(materia => {
          doc.text(`- ${materia.nome_materia}: ${materia.nota}`, 25, yPos);
          yPos += 10; // Avança 10 unidades para a próxima linha
        });
      } else {
        doc.setFontSize(12);
        doc.text('Nenhuma matéria registrada para este aluno.', 20, 90);
      }

      // Garante que fullStudentData.name seja uma string antes de chamar replaceAll
      const fileName = `relatorio-${(fullStudentData.name || 'aluno').replaceAll(' ', '-')}.pdf`;
      doc.save(fileName);

    } catch (pdfError) {
      console.error('Erro ao gerar PDF ou buscar detalhes do aluno:', pdfError);
      alert('Erro ao gerar relatório. Verifique o console para mais detalhes.');
    }
  };

  // ESTES BLOCOS PRECISAM ESTAR AQUI, NO CORPO PRINCIPAL DO COMPONENTE
  if (loading) {
    return <div className="text-center p-8">Carregando alunos...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  if (students.length === 0) {
    return <div className="text-center p-8">Nenhum aluno encontrado. Cadastre alguns alunos primeiro.</div>;
  }

  return (
    <div className="min-h-screen bg-white p-4">
      {/* Header */}
      <div className="bg-[#4F46E5] text-white p-4 rounded-t-md flex justify-between font-bold">
        <div>Class: <span className="font-normal">3 A</span></div>
        <div>Date: <span className="font-normal">{new Date().toLocaleDateString()}</span></div> {/* Data no cabeçalho */}
      </div>

      {/* Tabela */}
      <table className="w-full border border-gray-300 text-center">
        <thead className="bg-[#4F46E5] text-white">
          <tr>
            <th className="p-2">Nome do Aluno</th>
            <th className="p-2">Presente</th>
            <th className="p-2">Ausente</th>
            <th className="p-2">Relatório</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="border-b">
              <td className="py-2">{student.name}</td>
              <td>
                <input
                  type="checkbox"
                  checked={student.present}
                  onChange={() => handleCheckbox(students.findIndex(s => s.id === student.id), 'present')}
                  className="w-5 h-5 text-purple-600 border-2 rounded"
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={student.absent}
                  onChange={() => handleCheckbox(students.findIndex(s => s.id === student.id), 'absent')}
                  className="w-5 h-5 text-purple-600 border-2 rounded"
                />
              </td>
              <td>
                <Button
                  variant="outline"
                  className="text-xs"
                  onClick={() => generatePDF(student)} // Removemos o 'index' daqui
                >
                  Exportar PDF
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}