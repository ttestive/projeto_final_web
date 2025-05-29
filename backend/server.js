require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise'); // Usar a versão com promessas
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors()); // Habilita CORS para todas as requisições
app.use(express.json()); // Permite que o Express parseie JSON no corpo das requisições

// Configuração da conexão com o banco de dados
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};

// Rota para cadastrar aluno e suas matérias
app.post('/register', async (req, res) => {
    const { nome, idade, materias } = req.body;

    if (!nome || !idade || !materias || !Array.isArray(materias)) {
        return res.status(400).json({ message: 'Dados inválidos. Nome, idade e matérias são obrigatórios.' });
    }

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.beginTransaction(); // Inicia uma transação

        // Inserir o aluno
        const [alunoResult] = await connection.execute(
            'INSERT INTO alunos (nome, idade) VALUES (?, ?)',
            [nome, idade]
        );
        const alunoId = alunoResult.insertId;

        // Inserir as matérias do aluno
        for (const materia of materias) {
            if (!materia.nome || materia.nota === undefined) {
                await connection.rollback(); // Desfaz a transação em caso de erro
                return res.status(400).json({ message: 'Dados de matéria inválidos.' });
            }
            await connection.execute(
                'INSERT INTO materias_aluno (aluno_id, nome_materia, nota) VALUES (?, ?, ?)',
                [alunoId, materia.nome, materia.nota]
            );
        }

        await connection.commit(); // Confirma a transação
        res.status(201).json({ message: 'Aluno e matérias cadastrados com sucesso!', alunoId });

    } catch (error) {
        if (connection) {
            await connection.rollback(); // Desfaz a transação em caso de erro
        }
        console.error('Erro ao cadastrar aluno:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao cadastrar aluno.' });
    } finally {
        if (connection) {
            connection.end(); // Fecha a conexão
        }
    }
});
app.get('/alunos', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT id, nome, idade FROM alunos');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar alunos.' });
    } finally {
        if (connection) {
            connection.end();
        }
    }
});

// Opcional: Rota para buscar alunos com suas matérias (se precisar de mais detalhes no relatório)
app.get('/alunos/:id/detalhes', async (req, res) => {
    const alunoId = req.params.id;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [alunoRows] = await connection.execute('SELECT id, nome, idade FROM alunos WHERE id = ?', [alunoId]);
        if (alunoRows.length === 0) {
            return res.status(404).json({ message: 'Aluno não encontrado.' });
        }

        const [materiasRows] = await connection.execute('SELECT nome_materia, nota FROM materias_aluno WHERE aluno_id = ?', [alunoId]);

        const alunoDetalhes = {
            ...alunoRows[0],
            materias: materiasRows
        };

        res.status(200).json(alunoDetalhes);
    } catch (error) {
        console.error('Erro ao buscar detalhes do aluno:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar detalhes do aluno.' });
    } finally {
        if (connection) {
            connection.end();
        }
    }
});

app.get('/materias-com-top-alunos', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        // SQL para obter top 3 alunos por matéria
        // Esta query usa CTEs (Common Table Expressions) e ROW_NUMBER()
        // para classificar os alunos por nota dentro de cada matéria.
        const [rows] = await connection.execute(`
            WITH AlunosNotas AS (
                SELECT
                    ma.nome_materia,
                    a.nome AS aluno_nome,
                    ma.nota AS pontuacao,
                    ROW_NUMBER() OVER (PARTITION BY ma.nome_materia ORDER BY ma.nota DESC, a.nome ASC) as rn
                FROM
                    materias_aluno ma
                JOIN
                    alunos a ON ma.aluno_id = a.id
            )
            SELECT
                an.nome_materia,
                an.aluno_nome,
                an.pontuacao
            FROM
                AlunosNotas an
            WHERE
                an.rn <= 3 -- Pega os 3 melhores de cada matéria
            ORDER BY
                an.nome_materia, an.pontuacao DESC;
        `);

        // Processar os resultados para o formato desejado pelo frontend
        const materiasFormatadas = {};
        rows.forEach(row => {
            if (!materiasFormatadas[row.nome_materia]) {
                materiasFormatadas[row.nome_materia] = {
                    nome: row.nome_materia,
                    topAlunos: []
                };
            }
            materiasFormatadas[row.nome_materia].topAlunos.push({
                nome: row.aluno_nome,
                pontuacao: row.pontuacao
            });
        });

        // Converte o objeto em um array de valores
        const resultadoFinal = Object.values(materiasFormatadas);

        res.status(200).json(resultadoFinal);

    } catch (error) {
        console.error('Erro ao buscar matérias com top alunos:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar dados de matérias.' });
    } finally {
        if (connection) {
            connection.end();
        }
    }
});
app.post('/alunos/import', async (req, res) => {
    let connection;
    try {
        const { alunos } = req.body;

        // Validação básica
        if (!alunos || !Array.isArray(alunos) || alunos.length === 0) {
            return res.status(400).json({ message: 'Nenhum aluno fornecido para importação.' });
        }

        connection = await mysql.createConnection(dbConfig);
        await connection.beginTransaction(); // Inicia uma transação

        for (const alunoData of alunos) {
            const { nome, idade, materias } = alunoData;

            // Validação de dados essenciais
            if (!nome || !idade) {
                console.warn(`Aviso: Pulando aluno devido a dados ausentes (nome ou idade). Aluno: ${JSON.stringify(alunoData)}`);
                continue; // Pula este aluno e continua com o próximo
            }

            // Inserir o aluno na tabela 'alunos'
            const [alunoResult] = await connection.execute(
                'INSERT INTO alunos (nome, idade) VALUES (?, ?)',
                [String(nome).trim(), parseInt(String(idade).trim())]
            );
            const alunoId = alunoResult.insertId;

            // Inserir as matérias/notas associadas
            if (materias && Array.isArray(materias) && materias.length > 0) {
                const materiaValues = materias
                    .map(m => {
                        // Validação para nome e nota da matéria
                        if (!m.nome || !m.nota || String(m.nota).trim() === '') {
                            console.warn(`Aviso: Matéria ou nota inválida para aluno ${nome}. Matéria: ${m.nome}, Nota: ${m.nota}`);
                            return null; // Retorna null para filtrar depois
                        }
                        return [
                            alunoId,
                            String(m.nome).trim(),
                            parseFloat(String(m.nota).replace(',', '.')) // Lida com vírgula como decimal
                        ];
                    })
                    .filter(Boolean); // Remove os nulls (matérias inválidas)

                if (materiaValues.length > 0) {
                    await connection.query(
                        'INSERT INTO materias_aluno (aluno_id, nome_materia, nota) VALUES ?',
                        [materiaValues]
                    );
                }
            }
        }

        await connection.commit(); // Confirma todas as inserções
        res.status(200).json({ message: 'Alunos importados com sucesso!' });

    } catch (error) {
        if (connection) {
            await connection.rollback(); // Desfaz tudo em caso de erro
        }
        console.error('Erro detalhado no servidor ao importar alunos:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao importar alunos.' });
    } finally {
        if (connection) {
            connection.end();
        }
    }
});

app.get('/materias/maiores-notas', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(`
            SELECT
                ma.nome_materia AS subject,
                AVG(ma.nota) AS grade
            FROM
                materias_aluno ma
            GROUP BY
                ma.nome_materia
            ORDER BY
                grade DESC
            LIMIT 5;
        `);

        const formattedData = rows.map(row => {
            // Nova verificação e conversão para número:
            const rawGrade = parseFloat(row.grade); // Garante que row.grade seja um número
            
            // Agora, verifique se rawGrade é um número válido antes de toFixed
            const grade = !isNaN(rawGrade) ? parseFloat(rawGrade.toFixed(1)) : 0; 
            
            return {
                subject: row.subject,
                grade: grade,
            };
        });

        res.status(200).json(formattedData);

    } catch (error) {
        console.error('Erro ao buscar matérias com maiores notas:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar dados do gráfico.' });
    } finally {
        if (connection) {
            connection.end();
        }
    }
});

app.post('/frequencia/import', async (req, res) => {
    const { frequencia } = req.body; // Espera um array de objetos FrequenciaRegistro
    let connection;

    if (!frequencia || !Array.isArray(frequencia) || frequencia.length === 0) {
        return res.status(400).json({ message: 'Nenhum registro de frequência fornecido.' });
    }

    try {
        connection = await mysql.createConnection(dbConfig); // Usar sua configuração de BD

        // Preparar os valores para a inserção em massa
        const values = frequencia.map(record => [
            record.aluno_id,
            record.data_aula,
            record.status_presenca
        ]);

        // Consulta SQL para inserção em massa
        const query = `
            INSERT INTO frequencia_aluno (aluno_id, data_aula, status_presenca)
            VALUES ?
            ON DUPLICATE KEY UPDATE
                status_presenca = VALUES(status_presenca);
            -- Adicione ON DUPLICATE KEY UPDATE se o professor pedir ou você quiser atualizar a frequência
           
        `;

        await connection.query(query, [values]); // Use .query para INSERT INTO VALUES ?

        res.status(200).json({ message: `Frequência de ${frequencia.length} registros importada com sucesso.` });

    } catch (error) {
        console.error('Erro ao importar frequência para o banco de dados:', error);
        // Pode verificar se o erro é de chave duplicada ou outro tipo para dar um feedback mais específico
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ message: 'Conflito: Alguns registros de frequência já existem para a mesma data e aluno.' });
        } else {
            res.status(500).json({ message: 'Erro interno do servidor ao importar frequência.' });
        }
    } finally {
        if (connection) {
            connection.end();
        }
    }
});

app.listen(port, () => {
    console.log(`Backend rodando em http://localhost:${port}`);
});