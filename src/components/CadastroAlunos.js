// routes/aluno.js
'use client'
import { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

export default function CadastroAluno() {
  const [formData, setFormData] = useState({
    nome: '',
    idade: '',
    materias: [{ nome: '', nota: '' }],
  });

  const [file, setFile] = useState(null);

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;

    if (name.startsWith('materia')) {
      const updatedMaterias = [...formData.materias];
      updatedMaterias[index][name.split('.')[1]] = value;
      setFormData(prev => ({ ...prev, materias: updatedMaterias }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addMateria = () => {
    setFormData(prev => ({
      ...prev,
      materias: [...prev.materias, { nome: '', nota: '' }],
    }));
  };

  const handleSubmitManual = () => {
    axios.post('http://localhost:3001/register', formData)
      .then(res => alert('Aluno cadastrado!'))
      .catch(err => console.error(err));
  };

  const handleFileUpload = async () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      // POST cada aluno individualmente
      for (const aluno of data) {
        const alunoData = {
          nome: aluno.Nome,
          idade: aluno.Idade,
          materias: Object.keys(aluno)
            .filter(key => !['Nome', 'Idade'].includes(key))
            .map(mat => ({ nome: mat, nota: aluno[mat] })),
        };

        await axios.post('http://localhost:3001/register', alunoData);
      }

      alert('Alunos importados com sucesso!');
    };

    reader.readAsBinaryString(file);
  };