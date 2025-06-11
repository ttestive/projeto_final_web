'use client' // Mantenha esta linha para indicar que é um Client Component

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import axios from 'axios'
import { useTheme } from '@/context/ThemeContext'
import { PlusCircle, MinusCircle, Search, Trash2 } from 'lucide-react'
import dynamic from 'next/dynamic'; // Importe dynamic do next/dynamic

// Importação dinâmica do QRCode, para garantir que ele só seja carregado no cliente
// E que ele pegue o default export do módulo
const QRCode = dynamic(() => import('qrcode.react').then(mod => mod.default), { ssr: false });

// Definição de tipos
interface MateriaInput {
  id: number;
  nome: string;
  nota: string;
}

interface AlunoData {
  id: number;
  nome: string;
  idade: string;
  faltas: string;
  materias: { nome: string; nota: string }[];
}

export default function EditarAlunoPage() {
  const [alunoId, setAlunoId] = useState<string>('');
  const [alunoData, setAlunoData] = useState<AlunoData | null>(null);
  const [materiasForm, setMateriasForm] = useState<MateriaInput[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const { theme } = useTheme();

  // Função para buscar o aluno pelo ID
  const handleSearchAluno = async () => {
    setFeedbackMessage(null);
    setAlunoData(null);
    setMateriasForm([]);

    if (!alunoId.trim() || isNaN(parseInt(alunoId.trim(), 10))) {
      setFeedbackMessage({ type: 'error', message: 'Por favor, insira um ID de aluno válido.' });
      return;
    }

    try {
      setFeedbackMessage({ type: 'info', message: 'Buscando aluno...' });
      const response = await axios.get(`http://localhost:3001/alunos/${alunoId}`);
      const fetchedAluno = response.data;

      if (!fetchedAluno) {
        setFeedbackMessage({ type: 'error', message: 'Aluno não encontrado.' });
        return;
      }

      const loadedMaterias: MateriaInput[] = fetchedAluno.materias.map((m: { nome_materia: string; nota: number | string }, index: number) => ({
          id: index + 1,
          nome: String(m.nome_materia || ''),
          nota: String(m.nota || '')
      }));

      setAlunoData({
          id: fetchedAluno.id,
          nome: String(fetchedAluno.nome || ''),
          idade: String(fetchedAluno.idade || ''),
          faltas: String(fetchedAluno.faltas || '0'),
          materias: fetchedAluno.materias
      });
      setMateriasForm(loadedMaterias.length > 0 ? loadedMaterias : [{ id: Date.now(), nome: '', nota: '' }]);

      setFeedbackMessage({ type: 'success', message: 'Aluno carregado com sucesso!' });
    } catch (error) {
      console.error('Erro ao buscar aluno:', error);
      setFeedbackMessage({ type: 'error', message: 'Erro ao buscar aluno. Verifique o ID e a conexão com o servidor.' });
    }
  };

  // Funções para gerenciar matérias
  const handleAddMateria = () => {
    setMateriasForm([...materiasForm, { id: Date.now(), nome: '', nota: '' }]);
  };

  const handleRemoveMateria = (id: number) => {
    setMateriasForm(materiasForm.filter(materia => materia.id !== id));
  };

  const handleMateriaChange = (id: number, field: 'nome' | 'nota', value: string) => {
    setMateriasForm(materiasForm.map(materia =>
      materia.id === id ? { ...materia, [field]: value } : materia
    ));
  };

  // Função para lidar com o envio do formulário de edição
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedbackMessage(null);

    if (!alunoData || !alunoData.id) {
        setFeedbackMessage({ type: 'error', message: 'Nenhum aluno selecionado para edição.' });
        return;
    }

    const nomeValidado = alunoData.nome.trim();
    const idadeNum = parseInt(alunoData.idade.trim(), 10);
    const faltasNum = parseInt(alunoData.faltas.trim(), 10);

    if (!nomeValidado || isNaN(idadeNum) || idadeNum <= 0) {
      setFeedbackMessage({ type: 'error', message: 'Nome e Idade são campos obrigatórios e devem ser válidos.' });
      return;
    }

    if (isNaN(faltasNum) || faltasNum < 0) {
      setFeedbackMessage({ type: 'error', message: 'O total de faltas deve ser um número não negativo.' });
      return;
    }

    const materiasValidas = materiasForm
        .filter(m => m.nome.trim() !== '' && m.nota.trim() !== '')
        .map(m => ({ nome: m.nome.trim(), nota: parseFloat(m.nota.replace(',', '.')) }));

    if (materiasValidas.some(m => isNaN(m.nota))) {
        setFeedbackMessage({ type: 'error', message: 'Alguma nota de matéria é inválida (ex: ponto em vez de vírgula, texto em vez de número).' });
        return;
    }

    try {
      setFeedbackMessage({ type: 'info', message: 'Atualizando aluno...' });
      await axios.put(`http://localhost:3001/alunos/${alunoData.id}`, {
        nome: nomeValidado,
        idade: idadeNum,
        faltas: faltasNum,
        materias: materiasValidas,
      });

      setFeedbackMessage({ type: 'success', message: 'Aluno atualizado com sucesso!' });
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      setFeedbackMessage({ type: 'error', message: 'Erro ao atualizar aluno. Verifique o console do navegador e do servidor.' });
    }
  };

  // Função para excluir aluno
  const handleDeleteAluno = async () => {
    setFeedbackMessage(null);

    if (!alunoData || !alunoData.id) {
      setFeedbackMessage({ type: 'error', message: 'Nenhum aluno selecionado para exclusão.' });
      return;
    }

    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir o aluno "${alunoData.nome}" (ID: ${alunoData.id}) e todas as suas matérias? Esta ação é irreversível.`
    );

    if (!confirmDelete) {
      setFeedbackMessage({ type: 'info', message: 'Exclusão cancelada.' });
      return;
    }

    try {
      setFeedbackMessage({ type: 'info', message: `Excluindo aluno ${alunoData.nome}...` });
      await axios.delete(`http://localhost:3001/alunos/${alunoData.id}`);

      setFeedbackMessage({ type: 'success', message: 'Aluno excluído com sucesso!' });
      setAlunoId('');
      setAlunoData(null);
      setMateriasForm([]);
    } catch (error) {
      console.error('Erro ao excluir aluno:', error);
      setFeedbackMessage({ type: 'error', message: 'Erro ao excluir aluno. Verifique o console do navegador e do servidor.' });
    }
  };

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      <h1 className="text-2xl font-bold mb-6 text-[#142582] dark:text-[#a7a7e6]">Editar Aluno</h1>

      {feedbackMessage && (
        <div className={`p-3 rounded-md mb-4 ${feedbackMessage.type === 'success' ? 'bg-green-100 text-green-700' : feedbackMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {feedbackMessage.message}
        </div>
      )}

      {/* Seção de Busca de Aluno */}
      <div className={`mb-8 p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h2 className="text-xl font-semibold mb-4 text-[#1800DE] dark:text-[#be79df]">Buscar Aluno para Edição</h2>
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Label htmlFor="alunoIdSearch" className="text-gray-700 dark:text-gray-300">ID do Aluno</Label>
            <Input
              id="alunoIdSearch"
              type="number"
              value={alunoId}
              onChange={(e) => setAlunoId(e.target.value)}
              placeholder="Ex: 1"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            />
          </div>
          <Button onClick={handleSearchAluno} className="bg-[#1800DE] hover:bg-[#142582] text-white dark:bg-[#a7a7e6] dark:text-gray-900 dark:hover:bg-[#be79df]">
            <Search className="h-5 w-5 mr-2" /> Buscar Aluno
          </Button>
        </div>
      </div>

      {/* Formulário de Edição do Aluno (visível apenas após buscar um aluno) */}
      {alunoData && (
        <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-xl font-semibold mb-4 text-[#1800DE] dark:text-[#be79df]">Editar Informações do Aluno (ID: {alunoData.id})</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome" className="text-gray-700 dark:text-gray-300">Nome do Aluno</Label>
              <Input
                id="nome"
                type="text"
                value={alunoData.nome}
                onChange={(e) => setAlunoData(prev => prev ? { ...prev, nome: e.target.value } : null)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="idade" className="text-gray-700 dark:text-gray-300">Idade</Label>
              <Input
                id="idade"
                  type="number"
                value={alunoData.idade}
                onChange={(e) => setAlunoData(prev => prev ? { ...prev, idade: e.target.value } : null)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              />
            </div>
            {/* Campo de Faltas */}
            <div>
              <Label htmlFor="faltas" className="text-gray-700 dark:text-gray-300">Total de Faltas</Label>
              <Input
                id="faltas"
                type="number"
                value={alunoData.faltas}
                onChange={(e) => setAlunoData(prev => prev ? { ...prev, faltas: e.target.value } : null)}
                min="0"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              />
            </div>

            {/* Campos de Matérias e Notas */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Matérias e Notas</h3>
              {materiasForm.map((materia, index) => (
                <div key={materia.id} className="flex space-x-2 items-end">
                  <div className="flex-1">
                    <Label htmlFor={`materia-nome-${materia.id}`} className="text-gray-700 dark:text-gray-300">Matéria</Label>
                    <Input
                      id={`materia-nome-${materia.id}`}
                      type="text"
                      value={materia.nome}
                      onChange={(e) => handleMateriaChange(materia.id, 'nome', e.target.value)}
                      placeholder="Nome da matéria"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`materia-nota-${materia.id}`} className="text-gray-700 dark:text-gray-300">Nota</Label>
                    <Input
                      id={`materia-nota-${materia.id}`}
                      type="number"
                      step="0.1"
                      value={materia.nota}
                      onChange={(e) => handleMateriaChange(materia.id, 'nota', e.target.value)}
                      placeholder="Nota"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                    />
                  </div>
                  {materiasForm.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMateria(materia.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600"
                    >
                      <MinusCircle className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddMateria}
                className="bg-[#1800DE] hover:bg-[#142582] text-white dark:bg-green-700 dark:hover:bg-green-800"
              >
                <PlusCircle className="h-5 w-5 mr-2" /> Adicionar Matéria
              </Button>
            </div>

            <div className="flex justify-between items-center mt-6 space-x-4">
                <Button type="submit" className="bg-[#1800DE] hover:bg-[#142582] text-white dark:bg-[#a7a7e6] dark:text-gray-900 dark:hover:bg-[#be79df] flex-1">
                    Salvar Alterações
                </Button>
                <Button
                    type="button"
                    onClick={handleDeleteAluno}
                    className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800 flex-1"
                >
                    <Trash2 className="h-5 w-5 mr-2" /> Excluir Aluno
                </Button>
            </div>
          </form>
        </div>
      )}

      {/* Seção do QR Code - Renderiza apenas se alunoData existir */}
      {alunoData && (
        <div className="mt-8 p-4 rounded-lg shadow-md dark:bg-gray-800 bg-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-[#1800DE] dark:text-[#be79df]">QR Code para Busca via Curl</h2>
          {/* O componente QRCode só é renderizado aqui após a importação dinâmica */}
          <QRCode
            value={`curl http://localhost:3001/alunos/${alunoData.id}`}
            size={128}
            level="H"
            bgColor={theme === 'dark' ? '#1f2937' : '#ffffff'}
            fgColor={theme === 'dark' ? '#f3f4f6' : '#000000'}
          />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Escaneie este QR code para executar o comando <code className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 p-1 rounded font-mono">curl http://localhost:3001/alunos/{alunoData.id}</code> no seu terminal.
          </p>
        </div>
      )}
    </div>
  );
}