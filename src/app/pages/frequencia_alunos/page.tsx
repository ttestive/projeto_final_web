'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useTheme } from '@/context/ThemeContext';

interface FrequenciaRegistro {
  aluno_id: number;
  data_aula: string;
  status_presenca: 'P' | 'F';
}

interface RawFrequenciaRow {
  [key: string]: any;
}

export default function ImportarFrequenciaPage() {
  const [file, setFile] = useState<File | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const { theme } = useTheme();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setFeedbackMessage(null);
    }
  };

  const handleImportFrequencia = () => {
    if (!file) {
      setFeedbackMessage({ type: 'error', message: 'Por favor, selecione um arquivo CSV ou XLSX.' });
      return;
    }

    setFeedbackMessage({ type: 'info', message: 'Processando arquivo...' });

    const fileName = file.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = e.target?.result;
      let parsedData: RawFrequenciaRow[] = [];

      try {
        if (fileExtension === 'csv') {
          Papa.parse<RawFrequenciaRow>(data as string, {
            header: true,
            skipEmptyLines: true,
            delimiter: ',', // <--- ADICIONE ESTA LINHA: Garante que a vírgula é o delimitador
            transformHeader: (header) => header.trim(),
            complete: (results) => {
                if (results.errors.length) {
                  console.error('Erros de parsing CSV:', results.errors);
                  // ADICIONE ESTA LINHA PARA MAIS DETALHES:
                  results.errors.forEach(err => {
                      console.log(`Erro: ${err.message} (Código: ${err.code}) na Linha: ${err.row}, Coluna: ${err.column}`);
                      console.log('Contexto:', err.row && results.data[err.row]); // Tenta mostrar a linha dos dados se disponível
                  });
                  setFeedbackMessage({ type: 'error', message: 'Erro ao analisar o CSV. Verifique o formato e o delimitador (deve ser vírgula). Veja o console para mais detalhes.' });
                  return;
                }
              parsedData = results.data;
              processAndSendFrequencia(parsedData);
            },
          });
        } else if (fileExtension === 'xlsx') {
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

          if (excelData.length < 2) {
            setFeedbackMessage({ type: 'error', message: 'Arquivo XLSX vazio ou sem dados válidos.' });
            return;
          }

          const headers: string[] = excelData[0].map(h => String(h || '').trim());
          const rows = excelData.slice(1);

          parsedData = rows.map(row => {
            const obj: RawFrequenciaRow = {};
            headers.forEach((header, index) => {
              obj[header] = row[index];
            });
            return obj;
          });
          
          processAndSendFrequencia(parsedData);

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

  const processAndSendFrequencia = async (rawData: RawFrequenciaRow[]) => {
    const frequenciaParaImportar: FrequenciaRegistro[] = [];
    const aulaHeaders: string[] = [];

    if (rawData.length === 0) {
      setFeedbackMessage({ type: 'error', message: 'Nenhum dado encontrado no arquivo para processar.' });
      return;
    }

    const firstRowKeys = Object.keys(rawData[0]);
    firstRowKeys.forEach(key => {
      if (key.startsWith('Aula_')) {
        aulaHeaders.push(key);
      }
    });

    if (aulaHeaders.length === 0) {
      setFeedbackMessage({ type: 'error', message: 'Nenhuma coluna de aula identificada no arquivo. Certifique-se de que os cabeçalhos das aulas começam com "Aula_".' });
      return;
    }

    rawData.forEach((row: RawFrequenciaRow) => {
      const alunoId = parseInt(String(row.aluno_id).trim(), 10);

      if (isNaN(alunoId)) {
        console.warn(`Pulando linha devido a aluno_id inválido: ${row.aluno_id}`);
        return;
      }

      aulaHeaders.forEach(aulaHeader => {
        const status = String(row[aulaHeader]).trim().toUpperCase();

        if (status === 'P' || status === 'F') {
          const match = aulaHeader.match(/Aula_(\d{2}-\d{2})_(\d{2}h\d{2})_Semana\d+/);
          if (match) {
            const [_, diaMes] = match;
            const anoAtual = new Date().getFullYear();
            const [dia, mes] = diaMes.split('-');
            
            const dataAula = `${anoAtual}-${mes}-${dia}`;

            frequenciaParaImportar.push({
              aluno_id: alunoId,
              data_aula: dataAula,
              status_presenca: status as 'P' | 'F',
            });
          } else {
            console.warn(`Cabeçalho de aula com formato inesperado: ${aulaHeader}. Pulando.`);
          }
        }
      });
    });

    if (frequenciaParaImportar.length === 0) {
      setFeedbackMessage({ type: 'error', message: 'Nenhum registro de frequência válido para importar após processamento.' });
      return;
    }

    console.log('Registros de frequência processados para importação:', frequenciaParaImportar);

    try {
      setFeedbackMessage({ type: 'info', message: `Importando ${frequenciaParaImportar.length} registros de frequência...` });
      await axios.post('http://localhost:3001/frequencia/import', { frequencia: frequenciaParaImportar });
      setFeedbackMessage({ type: 'success', message: 'Frequência importada com sucesso!' });
      setFile(null);
    } catch (error) {
      console.error('Erro ao importar frequência:', error);
      setFeedbackMessage({ type: 'error', message: 'Erro ao importar frequência. Verifique o console do navegador e do servidor.' });
    }
  };

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      <h1 className="text-2xl font-bold mb-6 text-[#142582] dark:text-[#a7a7e6]">Importar Frequência de Alunos</h1>

      {feedbackMessage && (
        <div className={`p-3 rounded-md mb-4 ${feedbackMessage.type === 'success' ? 'bg-green-100 text-green-700' : feedbackMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {feedbackMessage.message}
        </div>
      )}

      <div className={`mb-8 p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h2 className="text-xl font-semibold mb-4 text-[#1800DE] dark:text-[#be79df]">Importar Arquivo de Frequência (CSV/XLSX)</h2>
        <div className="flex items-center space-x-2">
          <Input
            id="frequenciaFile"
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileChange}
            className={`file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-[#1800DE] hover:file:bg-blue-100
                        ${theme === 'dark' ? 'dark:file:bg-gray-700 dark:file:text-gray-100 dark:border-gray-600' : ''}`}
          />
          <Button onClick={handleImportFrequencia} className="bg-[#1800DE] hover:bg-[#142582] text-white dark:bg-[#a7a7e6] dark:text-gray-900 dark:hover:bg-[#be79df]">
            Importar Frequência
          </Button>
        </div>
      </div>
    </div>
  );
}