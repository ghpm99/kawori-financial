export function GET() {
    const content = `# Kawori Financial

> Plataforma de controle financeiro pessoal para organizar gastos, receitas, orçamento e metas.

## Sobre

Kawori Financial é uma aplicação web gratuita para controle financeiro pessoal. Permite registrar movimentações, acompanhar entradas e saídas, definir orçamento doméstico, acompanhar metas e visualizar relatórios com gráficos claros.

## Funcionalidades

- Dashboard financeiro com métricas e gráficos
- Visão mensal de entradas, saídas e saldo
- Orçamento e metas com acompanhamento de progresso
- Tags e categorias para organização de gastos
- Importação de transações via CSV
- Controle de notas, pagamentos e vencimentos
- Relatórios financeiros detalhados

## Links

- [Página inicial](https://financeiro.kawori.site/)
- [Criar conta](https://financeiro.kawori.site/signup)
- [Entrar](https://financeiro.kawori.site/signin)
`;

    return new Response(content, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
    });
}
