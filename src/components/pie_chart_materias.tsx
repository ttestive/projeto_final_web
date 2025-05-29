"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"
import axios from 'axios'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig: ChartConfig = {
  grade: {
    label: "Média",
  },
};

export function Component() {
  const [chartData, setChartData] = React.useState<
    { subject: string; grade: number; fill: string }[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Definindo as cores diretamente no JavaScript para o gráfico
  const colorPalette = React.useMemo(() => [
    "hsl(210 100% 30%)", // Azul Escuro
    "hsl(210 100% 45%)", // Azul Médio
    "hsl(210 100% 60%)", // Azul Claro
    "hsl(210 10% 40%)",  // Cinza Azulado Escuro
    "hsl(210 10% 60%)",  // Cinza Azulado Claro
  ], []);

  // Estado para o chartConfig dinâmico
  const [dynamicChartConfig, setDynamicChartConfig] = React.useState<ChartConfig>(chartConfig);

  // Função para buscar os dados do gráfico
  const fetchChartData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:3001/materias/maiores-notas');
      
      const dataWithColors = response.data.map((item: any, index: number) => ({
        ...item,
        fill: colorPalette[index % colorPalette.length], // Cicla pelas cores da paleta
      }));
      
      setChartData(dataWithColors);

      const newDynamicChartConfig: ChartConfig = {
          grade: { label: "Média" },
      };
      dataWithColors.forEach((item: { subject: string; fill: string }) => {
          const normalizedSubject = item.subject.toLowerCase().replace(/\s+/g, '-');
          newDynamicChartConfig[normalizedSubject] = {
              label: item.subject,
              color: item.fill,
          };
      });
      setDynamicChartConfig(newDynamicChartConfig);

    } catch (err) {
      console.error("Erro ao buscar dados do gráfico:", err);
      setError("Não foi possível carregar os dados do gráfico.");
    } finally {
      setLoading(false);
    }
  }, [colorPalette]); // Dependência colorPalette

  // Usa useEffect para buscar os dados na montagem e em intervalos de 10 segundos
  React.useEffect(() => {
    // Chama a função de busca de dados imediatamente na montagem
    fetchChartData();

    // Configura o intervalo para chamar a função a cada 10 segundos (10000 milissegundos)
    const intervalId = setInterval(fetchChartData, 10000);

    // Limpa o intervalo quando o componente for desmontado
    return () => clearInterval(intervalId);
  }, [fetchChartData]); // Dependência fetchChartData para o useEffect


  // Calcula a média das notas das matérias exibidas no gráfico
  const averageOfTopGrades = React.useMemo(() => {
    if (chartData.length === 0) return 0;
    const sumGrades = chartData.reduce((acc, curr) => acc + curr.grade, 0);
    return (sumGrades / chartData.length).toFixed(1);
  }, [chartData]);

  if (loading) {
    return (
      <Card className="flex flex-col items-center justify-center p-6 min-h-[300px]">
        <p className="text-muted-foreground">Carregando dados do gráfico...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col items-center justify-center p-6 min-h-[300px]">
        <p className="text-red-500">{error}</p>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-6 min-h-[300px]">
        <p className="text-muted-foreground">Nenhuma matéria com notas encontrada para exibir.</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Média das Maiores Notas por Matéria</CardTitle>
        <CardDescription>Top {chartData.length} Matérias por Média Geral</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={dynamicChartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="grade"
              nameKey="subject"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {averageOfTopGrades}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Média Geral
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Evolução nas médias das matérias <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Exibindo a média geral das {chartData.length} matérias com as maiores notas
        </div>
      </CardFooter>
    </Card>
  )
}