'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import axios from 'axios'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { useTheme } from '@/context/ThemeContext'
import { PlusCircle, MinusCircle } from 'lucide-react' // Ícones para adicionar/remover

// Definição de tipos
interface MateriaInput {
  id: number; // Para controle interno no React (key prop)
  nome: string;
  nota: string;
}

interface AlunoFormData {
  nome: string;
  idade: string;
  materias: { nome: string; nota: string }[];
}

interface RawAlunoRow {
  [key: string]: any;
}

export default function CadastroAlunoPage() {
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  // Novo estado para as matérias/notas no formulário individual
  const [materiasForm, setMateriasForm] = useState<MateriaInput[]>([{ id: 1, nome: '', nota: '' }]);
  const [file, setFile] = useState<File | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { theme } = useTheme();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleImportFile = () => {
    if (!file) {
      setFeedbackMessage({ type: 'error', message: 'Por favor, selecione um arquivo CSV ou XLSX.' });
      return;
    }

    setFeedbackMessage(null);

    const fileName = file.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = e.target?.result;
      let parsedData: RawAlunoRow[] = [];

      try {
        if (fileExtension === 'csv') {
          Papa.parse<RawAlunoRow>(data as string, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.errors.length) {
                console.error('Erros de parsing CSV:', results.errors);
                setFeedbackMessage({ type: 'error', message: 'Erro ao analisar o CSV. Verifique o formato.' });
                return;
              }
              parsedData = results.data;
              processAndSendStudents(parsedData);
            },
          });
        } else if (fileExtension === 'xlsx') {
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as RawAlunoRow[];

          if (parsedData.length === 0) {
            setFeedbackMessage({ type: 'error', message: 'Arquivo XLSX vazio ou sem dados.' });
            return;
          }

          const headers: string[] = parsedData[0].map((h: string) => String(h || '').trim());
          const rows = parsedData.slice(1);

          const formattedRows = rows.map(row => {
            const obj: RawAlunoRow = {};
            headers.forEach((header, index) => {
              obj[header] = row[index];
            });
            return obj;
          });
          parsedData = formattedRows;
          processAndSendStudents(parsedData);

        } else {
          setFeedbackMessage({ type: 'error', message: 'Formato de arquivo não suportado. Use .csv ou .xlsx.' });
          return;
        }
      } catch (parseError) {
        console.error('Erro ao processar arquivo:', parseError);
        setFeedbackMessage({ type: 'error', message: 'Erro ao processar o arquivo. Verifique se está formatado corretamente.' });
      }
    };

    reader.onerror = () => {
      setFeedbackMessage({ type: 'error', message: 'Falha ao ler o arquivo.' });
    };

    if (fileExtension === 'csv') {
      reader.readAsText(file);
    } else if (fileExtension === 'xlsx') {
      reader.readAsArrayBuffer(file);
    }
  };

  const processAndSendStudents = async (rawData: RawAlunoRow[]) => {
    const alunosParaImportar: AlunoFormData[] = rawData.map((row: RawAlunoRow) => {
      const normalizedRow: { [key: string]: any } = {};
      for (const key in row) {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
          normalizedRow[key.toLowerCase().trim()] = row[key];
        }
      }

      const nomeAluno = String(normalizedRow.nome || normalizedRow['nome do aluno'] || '').trim();
      const idadeAluno = String(normalizedRow.idade || normalizedRow.age || '').trim();

      const materias: { nome: string; nota: string }[] = [];
      for (const key in normalizedRow) {
        if (Object.prototype.hasOwnProperty.call(normalizedRow, key)) {
          const lowerKey = key.toLowerCase().trim();
          if (
            lowerKey !== 'id' &&
            lowerKey !== 'nome' &&
            lowerKey !== 'nome do aluno' &&
            lowerKey !== 'idade' &&
            lowerKey !== 'age' &&
            normalizedRow[key] !== undefined &&
            normalizedRow[key] !== null &&
            String(normalizedRow[key]).trim() !== ''
          ) {
            materias.push({
              nome: key.trim(),
              nota: String(normalizedRow[key]).trim()
            });
          }
        }
      }

      return {
        nome: nomeAluno,
        idade: idadeAluno,
        materias: materias,
      };
    }).filter(aluno => aluno.nome !== '' && aluno.idade !== '');

    if (alunosParaImportar.length === 0) {
      setFeedbackMessage({ type: 'error', message: 'Nenhum aluno válido encontrado no arquivo após processamento.' });
      return;
    }

    console.log('Alunos processados para importação:', alunosParaImportar);

    try {
      await axios.post('http://localhost:3001/alunos/import', { alunos: alunosParaImportar });
      setFeedbackMessage({ type: 'success', message: 'Alunos importados com sucesso!' });
      setFile(null);
    } catch (error) {
      console.error('Erro ao importar alunos:', error);
      setFeedbackMessage({ type: 'error', message: 'Erro ao importar alunos. Verifique o console do navegador e do servidor.' });
    }
  };

  // --- Funções para gerenciar matérias no formulário individual ---
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
  // --- Fim das funções de gerenciamento de matérias ---


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedbackMessage(null);

    if (!nome || !idade) {
      setFeedbackMessage({ type: 'error', message: 'Por favor, preencha nome e idade.' });
      return;
    }

    // Filtra matérias vazias antes de enviar
    const materiasValidas = materiasForm.filter(m => m.nome.trim() !== '' && m.nota.trim() !== '');

    const alunoData: AlunoFormData = {
      nome,
      idade: idade,
      materias: materiasValidas.map(m => ({ nome: m.nome, nota: m.nota }))
    };

    console.log('Dados do aluno para cadastro individual:', alunoData);

    try {
      await axios.post('http://localhost:3001/alunos', alunoData);
      setFeedbackMessage({ type: 'success', message: 'Aluno cadastrado com sucesso!' });
      setNome('');
      setIdade('');
      setMateriasForm([{ id: 1, nome: '', nota: '' }]); // Reseta as matérias
    } catch (error) {
      console.error('Erro ao cadastrar aluno:', error);
      setFeedbackMessage({ type: 'error', message: 'Erro ao cadastrar aluno. Tente novamente.' });
    }
  };

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      <h1 className="text-2xl font-bold mb-6 text-[#142582] dark:text-[#a7a7e6]">Cadastro de Alunos</h1>

      {feedbackMessage && (
        <div className={`p-3 rounded-md mb-4 ${feedbackMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {feedbackMessage.message}
        </div>
      )}

      {/* Seção de Importação CSV/XLSX */}
      <div className={`mb-8 p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h2 className="text-xl font-semibold mb-4 text-[#1800DE] dark:text-[#be79df]">Importar Alunos via CSV/XLSX</h2>
        <div className="flex items-center space-x-2">
          <Input
            id="csvFile"
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileChange}
            className={`file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-[#1800DE] hover:file:bg-blue-100
                        ${theme === 'dark' ? 'dark:file:bg-gray-700 dark:file:text-gray-100 dark:border-gray-600' : ''}`}
          />
          <Button onClick={handleImportFile} className="bg-[#1800DE] hover:bg-[#142582] text-white dark:bg-[#a7a7e6] dark:text-gray-900 dark:hover:bg-[#be79df]">
            Importar Arquivo
          </Button>
        </div>
      </div>

      {/* Seção de Cadastro de Aluno Individual */}
      <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h2 className="text-xl font-semibold mb-4 text-[#1800DE] dark:text-[#be79df]">Cadastrar Aluno Individualmente</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome" className="text-gray-700 dark:text-gray-300">Nome do Aluno</Label>
            <Input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            />
          </div>
          <div>
            <Label htmlFor="idade" className="text-gray-700 dark:text-gray-300">Idade</Label>
            <Input
              id="idade"
              type="number"
              value={idade}
              onChange={(e) => setIdade(e.target.value)}
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
                    step="0.1" // Permite notas decimais
                    value={materia.nota}
                    onChange={(e) => handleMateriaChange(materia.id, 'nota', e.target.value)}
                    placeholder="Nota"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  />
                </div>
                {materiasForm.length > 1 && ( // Só mostra o botão de remover se houver mais de uma matéria
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

          <Button type="submit" className="bg-[#1800DE] hover:bg-[#142582] text-white dark:bg-[#a7a7e6] dark:text-gray-900 dark:hover:bg-[#be79df]">
            Cadastrar Aluno
          </Button>
        </form>
      </div>
    </div>
  );
}