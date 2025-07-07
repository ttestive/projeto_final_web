'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { testComponent, testApiEndpoint, testDatabaseConnection } from '@/tests/componentTests';
import { runTestSuite, studentDataTestSuite } from '@/tests/unitTests';
import { chartDataTestSuite } from '@/tests/chartTests';
import { Component2 } from '@/components/bar_chart';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function TestRunner() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    // Test components
    const componentTests = [
      {
        name: 'Bar Chart Component',
        result: testComponent(Component2, {}, ['Média das Notas por Matéria'])
      }
    ];
    
    // Run unit tests
    const unitTestResults = runTestSuite(studentDataTestSuite);
    const unitTests = unitTestResults.map(result => ({
      name: `Unit Test: ${result.name}`,
      result: {
        success: result.passed,
        message: result.message
      }
    }));
    
    // Run chart tests
    const chartTestResults = runTestSuite(chartDataTestSuite);
    const chartTests = chartTestResults.map(result => ({
      name: `Chart Test: ${result.name}`,
      result: {
        success: result.passed,
        message: result.message
      }
    }));
    
    // Test API endpoints
    let apiTests = [];
    try {
      const alunosTest = await testApiEndpoint('http://localhost:3001/alunos');
      apiTests.push({
        name: 'GET /alunos Endpoint',
        result: alunosTest
      });
      
      const materiasTest = await testApiEndpoint('http://localhost:3001/materias/maiores-notas');
      apiTests.push({
        name: 'GET /materias/maiores-notas Endpoint',
        result: materiasTest
      });
    } catch (error) {
      apiTests.push({
        name: 'API Tests',
        result: { success: false, message: 'API server not running or unreachable' }
      });
    }
    
    // Test database connection
    const dbTest = await testDatabaseConnection();
    
    setTestResults([
      ...componentTests,
      ...unitTests,
      ...chartTests,
      ...apiTests,
      {
        name: 'Database Connection',
        result: dbTest
      }
    ]);
    
    setIsRunning(false);
  };

  useEffect(() => {
    // Run tests automatically when component mounts
    runAllTests();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Test Runner</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sistema de Testes Automatizados</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Esta página executa testes automatizados para verificar se os componentes e APIs do sistema estão funcionando corretamente.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={runAllTests} disabled={isRunning}>
            {isRunning ? 'Executando testes...' : 'Executar Todos os Testes'}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="grid gap-4">
        {testResults.length > 0 ? (
          testResults.map((test, index) => (
            <Card key={index} className={`border-l-4 ${test.result.success ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                {test.result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <CardTitle className="text-lg">{test.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={test.result.success ? 'text-green-700' : 'text-red-700'}>
                  {test.result.message || (test.result.success ? 'Teste passou com sucesso' : 'Teste falhou')}
                </p>
                
                {test.result.data && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Detalhes da resposta:</p>
                    <pre className="bg-gray-100 p-2 rounded text-xs mt-1 max-h-32 overflow-auto">
                      {JSON.stringify(test.result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          isRunning ? (
            <Card>
              <CardContent className="flex justify-center items-center py-8">
                <p>Executando testes...</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex justify-center items-center py-8">
                <p>Clique em "Executar Todos os Testes" para iniciar</p>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}