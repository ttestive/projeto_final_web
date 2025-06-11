"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
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
    color: "hsl(var(--chart-1))",
  },
};

export function Component2() {
  const [chartData, setChartData] = React.useState<
    { subject: string; grade: number; fill?: string }[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const lineColor = "hsl(210 100% 45%)";

  const [dynamicChartConfig, setDynamicChartConfig] = React.useState<ChartConfig>(chartConfig);

  const fetchChartData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:3001/materias/maiores-notas');
      
      const data = response.data.map((item: any) => ({
        subject: item.subject,
        grade: item.grade,
      }));
      
      setChartData(data);

      const newDynamicChartConfig: ChartConfig = {
          grade: { label: "Média", color: lineColor },
      };
      setDynamicChartConfig(newDynamicChartConfig);

    } catch (err) {
      console.error("Erro ao buscar dados do gráfico:", err);
      setError("Não foi possível carregar os dados do gráfico.");
    } finally {
      setLoading(false);
    }
  }, [lineColor]);

  React.useEffect(() => {
    fetchChartData();
    const intervalId = setInterval(fetchChartData, 10000);
    return () => clearInterval(intervalId);
  }, [fetchChartData]);

  const averageOfTopGrades = React.useMemo(() => {
    if (chartData.length === 0) return "0.0";
    const sumGrades = chartData.reduce((acc, curr) => acc + curr.grade, 0);
    return (sumGrades / chartData.length).toFixed(1);
  }, [chartData]);

  if (loading) {
    return (
      <Card className="flex flex-col items-center justify-center p-6 min-h-[400px]"> {/* Increased min-h */}
        <p className="text-muted-foreground">Carregando dados do gráfico...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col items-center justify-center p-6 min-h-[400px]"> {/* Increased min-h */}
        <p className="text-red-500">{error}</p>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-6 min-h-[400px]"> {/* Increased min-h */}
        <p className="text-muted-foreground">Nenhuma matéria com notas encontrada para exibir.</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Média das Notas por Matéria</CardTitle>
        <CardDescription>Visualizando a Média das Notas nas Top {chartData.length} Matérias</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={dynamicChartConfig}
          className="mx-auto aspect-[16/9] h-[350px] sm:h-[400px] md:h-[450px]" // Adjusted height to be larger and responsive
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="subject"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              dataKey="grade"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toFixed(0)}
              domain={[0, 10]}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Line
              dataKey="grade"
              type="monotone"
              stroke="var(--color-grade)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-grade)",
                stroke: "var(--color-grade)",
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
                fill: "var(--color-grade)",
                stroke: "var(--color-grade)",
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Média geral das notas: {averageOfTopGrades} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Cada ponto representa a média da matéria correspondente
        </div>
      </CardFooter>
    </Card>
  )
}