# Sistema de Testes para CRM de Alunos

Este diretório contém ferramentas e utilitários para testar os componentes e funcionalidades do sistema de gerenciamento de alunos.

## Estrutura de Testes

O sistema de testes é composto por diversos módulos:

### 1. Testes de Componentes (`componentTests.js`)

Utilitários para testar componentes React e endpoints da API:

- `testComponent()`: Testa se um componente React renderiza corretamente
- `testApiEndpoint()`: Testa se um endpoint da API responde como esperado
- `testDatabaseConnection()`: Verifica a conexão com o banco de dados

### 2. Testes Unitários (`unitTests.js`)

Ferramentas para testes unitários de funções e lógica de negócio:

- `runTest()`: Executa um único teste e reporta o resultado
- `runTestSuite()`: Executa uma suíte de testes e coleta os resultados
- Funções de assertions: `assertEquals()`, `assertTruthy()`, `assertFalsy()`, etc.
- Testes específicos para dados de alunos: `validateStudentObject()`, `calculateStudentAverage()`, etc.

### 3. Testes de Gráficos (`chartTests.js`)

Funções específicas para testar componentes de visualização de dados:

- `validateChartDataFormat()`: Verifica se o formato dos dados do gráfico é válido
- `validateChartDataRanges()`: Verifica se os valores dos dados estão dentro dos intervalos válidos
- `calculateAverageFromChartData()`: Calcula a média a partir dos dados do gráfico
- `findHighestGradeFromChartData()`: Encontra a maior nota a partir dos dados do gráfico

## Executando os Testes

Para executar os testes:

1. Acesse a página de testes do sistema através do menu principal
2. Clique no botão "Executar Todos os Testes"
3. Observe os resultados exibidos na interface

Os testes incluem:
- Verificação de componentes visuais
- Testes unitários de lógica de negócio
- Validação de dados de gráficos
- Verificação de endpoints da API
- Teste de conexão com o banco de dados

## Estendendo os Testes

Para adicionar novos testes:

1. Crie funções de teste em um dos arquivos existentes ou crie um novo arquivo
2. Adicione os testes à suíte de testes apropriada
3. Atualize o `TestRunner` para incluir os novos testes

## Testes Automatizados

Os testes são executados automaticamente ao acessar a página de testes, mas também podem ser executados manualmente a qualquer momento clicando no botão "Executar Todos os Testes".