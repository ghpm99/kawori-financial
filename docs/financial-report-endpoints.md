# Documentacao tecnica da rota `/internal/financial/report`

Data: 2026-03-11
Projeto: `kawori-financial`
Escopo: descrever a implementacao atual do frontend da rota `/internal/financial/report`, os endpoints efetivamente consumidos, os filtros enviados para a API e o significado tecnico dos indicadores exibidos.

## Escopo analisado

- Rota: `/internal/financial/report`
- Arquivos principais:
  - `src/app/internal/financial/report/layout.tsx`
  - `src/app/internal/financial/report/page.tsx`
  - `src/app/internal/financial/report/components/*`
  - `src/components/providers/report/index.tsx`
  - `src/services/financial/report/index.tsx`

## Visao geral tecnica da pagina

A pagina atual e um painel analitico de relatorios financeiros com filtro de periodo via query string. O `ReportProvider` concentra a orquestracao de dados, executa as consultas com React Query, deriva KPIs complementares no frontend e distribui o estado para os componentes visuais.

### Fluxo de carregamento

1. O `layout.tsx` da rota envolve a pagina com `ReportProvider`.
2. O provider le `date_from` e `date_to` dos search params.
3. O provider dispara 9 consultas independentes, todas chaveadas pelos filtros ativos.
4. O `page.tsx` monta a interface nesta ordem:
   - cabecalho com breadcrumb e resumo do periodo
   - card de filtros
   - alerta de erro global
   - cards executivos e KPIs
   - estado vazio quando nao ha dados
   - graficos
   - bloco de insights e cobertura
   - tabela de historico mensal

## Observacoes importantes sobre a implementacao atual

- O frontend atual envia filtro opcional por query string para todos os endpoints desta tela:
  - `date_from`
  - `date_to`
- Quando nenhum filtro e informado, o periodo exibido e `Todo o historico disponivel`.
- A atualizacao de filtros e feita via `updateSearchParams`, o que torna a URL a fonte de verdade da selecao.
- O endpoint `GET /financial/report/metrics/` esta em uso real na tela atual.
- Quando o endpoint de metricas nao responder valores, o provider usa fallback calculado a partir de outros datasets:
  - `revenues`: soma de `credit` da serie principal
  - `expenses`: soma de `debit` da serie principal
  - `profit`: `revenues - expenses`
  - `growth`: `0`
- A tela nao calcula mais uma linha de totais para a tabela mensal.
- O estado vazio aparece quando nao existe nenhum dado em:
  - serie principal
  - historico mensal
  - distribuicao por categoria
- Se qualquer uma das queries falhar, o provider exibe um alerta unico com a mensagem da API ou o fallback:
  - `Nao foi possivel consultar os endpoints de relatorio financeiro.`

## Filtros e contrato de busca

### Query params enviados

Todos os services da rota aceitam o tipo:

```ts
export interface FinancialReportFilters {
  date_from?: string;
  date_to?: string;
}
```

### Regras de envio

- O frontend so envia `date_from` se houver valor nao vazio.
- O frontend so envia `date_to` se houver valor nao vazio.
- Os valores sao serializados no formato `YYYY-MM-DD`.
- Se nenhum campo existir, a request e enviada sem `params`.

### Origem do filtro na interface

- Componente: `ReportFilters`
- Controle principal: `DatePicker.RangePicker`
- Presets disponiveis:
  - `Mes atual`
  - `Proximo mes`
  - `Mes passado`
  - `Ultimos 30 dias`
  - `Ultimo trimestre`
  - `Ano passado`

## Endpoints realmente utilizados

## 1. Serie principal do relatorio

- Endpoint: `GET /financial/report/`
- Funcao no frontend: `fetchPaymentReportService`
- Consumido por:
  - grafico `Entradas x Saidas por mes`
  - grafico `Evolucao do saldo acumulado`
  - KPIs derivados no provider
  - valores de `fixed_credit` e `fixed_debit`

### JSON esperado

```json
{
  "data": {
    "payments": [
      {
        "label": "2026-01-01",
        "debit": 3200.5,
        "credit": 4500.0,
        "total": 7700.5,
        "difference": 1299.5,
        "accumulated": 4200.3
      }
    ],
    "fixed_debit": 1200.0,
    "fixed_credit": 3500.0
  }
}
```

### Campos tecnicos

- `payments[].label`
  - Identificador temporal bruto da serie.
  - O provider formata para `MM/YYYY` usando `formatterMonthYearDate`.

- `payments[].debit`
  - Total de saidas do periodo.
  - Alimenta a serie `Saidas`.

- `payments[].credit`
  - Total de entradas do periodo.
  - Alimenta a serie `Entradas`.

- `payments[].total`
  - Valor total movimentado no ponto da serie.
  - O frontend recebe o campo, mas nao o plota diretamente nos graficos atuais.

- `payments[].difference`
  - Saldo mensal liquido do periodo.
  - Alimenta a serie `Saldo mensal`.

- `payments[].accumulated`
  - Saldo acumulado ao longo dos periodos.
  - Alimenta o grafico de evolucao acumulada.

- `fixed_debit`
  - Total consolidado de despesas fixas no recorte consultado.
  - Nao possui exibicao visual dedicada na tela atual, mas compoe os KPIs expostos no contexto.

- `fixed_credit`
  - Total consolidado de receitas fixas no recorte consultado.
  - Nao possui exibicao visual dedicada na tela atual, mas compoe os KPIs expostos no contexto.

## 2. Historico mensal consolidado

- Endpoint: `GET /financial/payment/month/`
- Funcao no frontend: `fetchMonthPayments`
- Consumido por:
  - tabela `Historico mensal consolidado`

### JSON esperado

```json
{
  "data": [
    {
      "id": 1,
      "name": "Janeiro",
      "date": "2026-01-01",
      "dateTimestamp": 1735689600,
      "total": 7700.5,
      "total_value_credit": 4500.0,
      "total_value_debit": 3200.5,
      "total_value_open": 800.0,
      "total_value_closed": 6900.5,
      "total_payments": 42
    }
  ]
}
```

### Campos tecnicos

- `id`
  - Identificador da linha.
  - Usado como `rowKey`.

- `name`
  - Nome descritivo do periodo retornado pela API.
  - So e usado como fallback para montar o rotulo do mes se `date` nao existir.

- `date`
  - Data base do agrupamento mensal.
  - E a principal fonte usada para montar a coluna `Mes`.

- `dateTimestamp`
  - Representacao numerica da data.
  - Nao e usada diretamente na renderizacao atual.

- `total`
  - Total movimentado do periodo.
  - Recebido pela tela, mas nao aparece em coluna propria.

- `total_value_credit`
  - Total de entradas do periodo.
  - Exibido na coluna `Entradas`.

- `total_value_debit`
  - Total de saidas do periodo.
  - Exibido na coluna `Saidas`.

- `total_value_open`
  - Total financeiro em aberto no periodo.
  - Exibido na coluna `Em aberto`.

- `total_value_closed`
  - Total financeiro fechado no periodo.
  - Exibido na coluna `Fechado`.

- `total_payments`
  - Quantidade de lancamentos agregados no periodo.
  - Exibido na coluna `Lancamentos`.

### Campo derivado no frontend

- `Saldo`
  - Calculado no componente da tabela como:
  - `total_value_credit - total_value_debit`
  - Exibido com `Tag` verde quando positivo ou zero, e vermelha quando negativo.

## 3. Quantidade total de pagamentos

- Endpoint: `GET /financial/report/count_payment`
- Funcao no frontend: `fetchCountPaymentReportService`
- Consumido por:
  - Resumo de cobertura (linha `Quantidade de lancamentos`)
  - calculo de `averageTicket`

### JSON esperado

```json
{
  "data": 42
}
```

### Significado tecnico

- Representa a quantidade total de lancamentos no recorte filtrado.
- O provider usa esse valor para compor o ticket medio:
  - `averageTicket = totalPayments / totalCount`

## 4. Valor total de pagamentos

- Endpoint: `GET /financial/report/amount_payment`
- Funcao no frontend: `fetchAmountPaymentReportService`
- Consumido por:
  - KPI `Total movimentado`
  - calculos de `openShare`, `closedShare`, `averageTicket`, `forecastAccuracy` e `forecastGap`

### JSON esperado

```json
{
  "data": 7700.5
}
```

### Significado tecnico

- Representa o montante total movimentado dentro do recorte consultado.
- E a base percentual usada para calcular participacao de aberto e fechado.

## 5. Valor total de pagamentos em aberto

- Endpoint: `GET /financial/report/amount_payment_open`
- Funcao no frontend: `fetchAmountPaymentOpenReportService`
- Consumido por:
  - KPI `Em aberto`
  - grafico `Saude das pendencias`
  - calculo de `openShare`

### JSON esperado

```json
{
  "data": 800.0
}
```

### Significado tecnico

- Representa o valor financeiro ainda nao fechado no periodo.
- O provider calcula:
  - `openShare = (totalOpen / totalPayments) * 100`

## 6. Valor total de pagamentos fechados

- Endpoint: `GET /financial/report/amount_payment_closed`
- Funcao no frontend: `fetchAmountPaymentClosedReportService`
- Consumido por:
  - KPI `Fechados`
  - grafico `Saude das pendencias`
  - calculo de `closedShare`

### JSON esperado

```json
{
  "data": 6900.5
}
```

### Significado tecnico

- Representa o valor financeiro ja fechado ou baixado no periodo.
- O provider calcula:
  - `closedShare = (totalClosed / totalPayments) * 100`

## 7. Distribuicao por tag

- Endpoint: `GET /financial/report/amount_invoice_by_tag`
- Funcao no frontend: `fetchAmountInvoiceByTagReportService`
- Consumido por:
  - grafico `Composicao de gastos por categoria`

### JSON esperado

```json
{
  "data": [
    {
      "id": 3,
      "name": "Moradia",
      "color": "#1677ff",
      "amount": 2300.0
    }
  ]
}
```

### Campos tecnicos

- `id`
  - Identificador da categoria/tag.

- `name`
  - Nome exibido no eixo X do grafico.

- `color`
  - Valor retornado pela API para representar a categoria.
  - A tela atual nao usa esse campo no grafico de barras.

- `amount`
  - Valor agregado da categoria.
  - Alimenta a barra `Valor total`.

## 8. Valor previsto ou de referencia

- Endpoint: `GET /financial/report/amount_forecast_value`
- Funcao no frontend: `fetchAmountForecastValueService`
- Consumido por:
  - KPI de aderencia ao planejamento
  - alertas de insight
  - calculos de `forecastAccuracy` e `forecastGap`

### JSON esperado

```json
{
  "data": 7500.0
}
```

### Significado tecnico

- Representa o valor previsto ou meta financeira para o periodo.
- O provider calcula:
  - `forecastAccuracy = (totalPayments / forecast) * 100`, quando `forecast > 0`
  - `forecastGap = totalPayments - forecast`
- Quando `forecast <= 0`, a tela sinaliza ausencia de previsao.

## 9. Metricas executivas

- Endpoint: `GET /financial/report/metrics/`
- Funcao no frontend: `fetchFinancialMetricsService`
- Consumido por:
  - cards `Receitas`, `Despesas`, `Resultado liquido` e `Crescimento`
  - calculo dos indicadores executivos e insights

**Nota:** diferente dos demais endpoints desta tela, o endpoint de metricas nao envolve a resposta em `{ "data": ... }`. O objeto e retornado diretamente no corpo da resposta.

### JSON esperado

```json
{
  "revenues": {
    "value": 12000.0,
    "metric_value": 8.5
  },
  "expenses": {
    "value": 9500.0,
    "metric_value": -2.1
  },
  "profit": {
    "value": 2500.0,
    "metric_value": 14.0
  },
  "growth": {
    "value": 6.4
  }
}
```

### Campos tecnicos

- `revenues.value`
  - Valor principal usado no card `Receitas`.

- `revenues.metric_value`
  - Recebido pela API, mas nao e exibido separadamente na UI atual.

- `expenses.value`
  - Valor principal usado no card `Despesas`.

- `expenses.metric_value`
  - Recebido pela API, mas nao e exibido separadamente na UI atual.

- `profit.value`
  - Valor principal usado no card `Resultado liquido`.

- `profit.metric_value`
  - Recebido pela API, mas nao e exibido separadamente na UI atual.

- `growth.value`
  - Valor exibido no card `Crescimento`.

### Fallback quando o endpoint nao fornecer valores

O provider usa os seguintes calculos locais:

- `revenues = soma(payments[].credit)`
- `expenses = soma(payments[].debit)`
- `profit = revenues - expenses`
- `growth = 0`

## KPIs e formulas derivadas no frontend

O provider centraliza indicadores que nao sao retornados prontos pela API.

Todos os KPIs percentuais sao arredondados para 1 casa decimal via `Number(((value / total) * 100).toFixed(1))`.

### KPIs derivados

- `savingsRate`
  - Formula: `(profit / revenues) * 100`, arredondado para 1 casa decimal
  - Retorna `0` quando `revenues <= 0`

- `averageTicket`
  - Formula: `totalPayments / totalCount`
  - Retorna `0` quando `totalCount <= 0`

- `openShare`
  - Formula: `(totalOpen / totalPayments) * 100`, arredondado para 1 casa decimal
  - Retorna `0` quando `totalPayments <= 0`

- `closedShare`
  - Formula: `(totalClosed / totalPayments) * 100`, arredondado para 1 casa decimal
  - Retorna `0` quando `totalPayments <= 0`

- `forecastAccuracy`
  - Formula: `(totalPayments / forecast) * 100`, arredondado para 1 casa decimal
  - Retorna `0` quando `forecast <= 0`

- `forecastGap`
  - Formula: `totalPayments - forecast`

## Mapeamento completo da interface

### Cabecalho

- Componente: `ReportHeader`
- Exibe:
  - breadcrumb `Kawori / Financeiro / Relatorios`
  - titulo `Relatorios Financeiros`
  - descricao executiva da pagina
  - tag `Periodo: {periodLabel}`

### Filtros

- Componente: `ReportFilters`
- Fonte de verdade: search params da URL
- Acoes:
  - aplicar intervalo
  - limpar filtro
- Indicadores auxiliares:
  - tags com data inicial e final formatadas
  - texto `Atualizando dados...` enquanto as queries estao em refetch

### Tratamento de erro

- Componente: `ReportError`
- Exibe um `Alert` unico com:
  - titulo: `Falha ao carregar relatorios financeiros`
  - descricao: mensagem retornada pela API ou fallback local

### Estado vazio

- Renderizado em `page.tsx`
- Condicao:
  - `!isLoadingPage && !hasAnyData`
- Mensagem:
  - `Nao ha dados para o periodo selecionado.`

### Cards executivos

- Componente: `ReportStats`
- Cards:
  - `Resultado do periodo`
    - valor: `profit`
    - legenda: `Taxa de poupanca`
  - `Liquidez das contas`
    - valor: `% fechado`
    - legenda: valor ainda em aberto
  - `Aderencia ao planejamento`
    - valor: `% de aderencia` ou `Sem previsao`
    - legenda: `Gap` ou orientacao para cadastrar meta

### Cards numericos de KPI

- Componente: `ReportStats`
- Indicadores:
  - `Receitas`
  - `Despesas`
  - `Resultado liquido`
  - `Crescimento`
  - `Taxa de poupanca`
  - `Ticket medio`
  - `Em aberto`
  - `Fechados`

### Graficos

- Componente: `ReportCharts`

- `Entradas x Saidas por mes`
  - Fonte: `/financial/report/`
  - Tipo atual: grafico de linhas (`LineChart`)
  - Series:
    - `Entradas`
    - `Saidas`
    - `Saldo mensal`

- `Evolucao do saldo acumulado`
  - Fonte: `/financial/report/`
  - Tipo atual: grafico de area (`AreaChart`)
  - Serie:
    - `Acumulado`

- `Composicao de gastos por categoria`
  - Fonte: `/financial/report/amount_invoice_by_tag`
  - Tipo atual: grafico de barras
  - Serie:
    - `Valor total`
  - Estado vazio proprio:
    - `Sem dados por categoria`

- `Saude das pendencias`
  - Fontes:
    - `/financial/report/amount_payment_open`
    - `/financial/report/amount_payment_closed`
  - Tipo atual: grafico de pizza
  - Fatias:
    - `Pagamentos fechados`
    - `Pagamentos em aberto`

### Insights e cobertura

- Componente: `ReportInsights`

- `Plano de acao recomendado`
  - Lista de prioridades geradas no provider a partir de:
    - `profit`
    - `openShare`
    - `forecast`
    - `forecastAccuracy`
    - `forecastGap`
  - Inclui:
    - severidade
    - metrica em destaque
    - contexto
    - acao sugerida
  - Alem das prioridades, o card tambem renderiza:
    - `Alert` informativo com `insights[0]` (primeiro insight textual generico sobre o resultado do periodo)
    - `Alert` de aviso comparando previsao e realizado: `Previsao do periodo: {forecast} | Realizado: {totalPayments}` com a diferenca absoluta

- `Resumo de cobertura`
  - Tabela com:
    - `Total movimentado`
    - `Total em aberto`
    - `Total fechado`
    - `Aderencia ao previsto`
    - `Quantidade de lancamentos`

### Historico mensal

- Componente: `ReportMonthlyHistory`
- Fonte: `/financial/payment/month/`
- Colunas:
  - `Mes`
  - `Entradas`
  - `Saidas`
  - `Saldo`
  - `Em aberto`
  - `Fechado`
  - `Lancamentos`
- Paginacao:
  - `pageSize: 12`

## Contratos TypeScript usados pelo frontend

```ts
export interface FinancialReportFilters {
  date_from?: string;
  date_to?: string;
}

export interface IPaymentChartData {
  label: string;
  debit: number;
  credit: number;
  total: number;
  difference: number;
  accumulated: number;
}

export interface IPaymentMonth {
  id: number;
  name: string;
  date: string;
  dateTimestamp: number;
  total: number;
  total_value_credit: number;
  total_value_debit: number;
  total_value_open: number;
  total_value_closed: number;
  total_payments: number;
}

export interface IInvoiceByTag {
  id: number;
  name: string;
  color: string;
  amount: number;
}

export interface MetricData {
  value: number;
  metric_value: number;
}

export interface GrowthData {
  value: number;
}

export interface FinancialMetricsResponse {
  revenues: MetricData;
  expenses: MetricData;
  profit: MetricData;
  growth: GrowthData;
}
```
