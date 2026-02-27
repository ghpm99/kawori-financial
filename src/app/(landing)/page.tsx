import Link from "next/link";
import type { Metadata } from "next";

import styles from "./Home.module.scss";

export const metadata: Metadata = {
    title: "Controle financeiro pessoal: gastos, orçamento e metas",
    description:
        "Organize suas finanças pessoais em um só lugar: dashboard, visão mensal, orçamento, metas, tags e importação CSV. Comece agora no Kawori Financial.",
    alternates: {
        canonical: "/",
    },
    openGraph: {
        type: "website",
        title: "Kawori Financial — Controle financeiro pessoal",
        description:
            "Organize suas finanças pessoais em um só lugar: dashboard, visão mensal, orçamento, metas, tags e importação CSV.",
        locale: "pt_BR",
        url: "/",
    },
};

export default function Home() {
    const jsonLdSoftwareApp = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Kawori Financial",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        url: "https://financeiro.kawori.site/",
        description:
            "Plataforma de controle financeiro pessoal para acompanhar gastos, receitas, orçamento, metas e relatórios.",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "BRL",
        },
    };

    const jsonLdFaq = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "O que é o Kawori Financial?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "O Kawori Financial é uma plataforma de controle financeiro pessoal para registrar movimentações, acompanhar orçamento, metas e visualizar relatórios.",
                },
            },
            {
                "@type": "Question",
                name: "Consigo acompanhar gastos por categoria?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Sim. Você pode organizar suas movimentações por tags/categorias e acompanhar totais por período e por categoria.",
                },
            },
            {
                "@type": "Question",
                name: "O Kawori Financial tem orçamento e metas?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Sim. Você pode definir orçamento doméstico e acompanhar metas, com visão de progresso e comparação com seus gastos.",
                },
            },
            {
                "@type": "Question",
                name: "Posso importar minhas transações por CSV?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Sim. Existe um fluxo de importação CSV para agilizar o cadastro de dados e começar a usar o sistema mais rápido.",
                },
            },
            {
                "@type": "Question",
                name: "É gratuito?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "No momento, você pode criar sua conta e começar a usar. Planos e precificação podem ser adicionados no futuro.",
                },
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftwareApp) }}
            />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />

            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.badge}>Controle financeiro pessoal</div>
                    <h1 className={styles.heroTitle}>Organize seus gastos, orçamento e metas em um só lugar</h1>
                    <p className={styles.heroDescription}>
                        O Kawori Financial te ajuda a registrar movimentações, acompanhar entradas e saídas, entender
                        para onde seu dinheiro vai e tomar decisões melhores com relatórios e gráficos claros.
                    </p>
                    <div className={styles.heroActions}>
                        <Link className={styles.primaryButton} href="/signup">
                            Criar conta
                        </Link>
                        <Link className={styles.secondaryButton} href="/signin">
                            Entrar
                        </Link>
                    </div>
                    <p className={styles.heroNote}>
                        Ideal para finanças pessoais: controle de gastos, orçamento doméstico, metas e visão mensal.
                    </p>
                </div>
                <div className={styles.heroVisual}>
                    <div className={styles.heroCard}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardIcon}>◔</span>
                            <span>Resumo do mês</span>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.metric}>
                                <span className={styles.metricLabel}>Receita</span>
                                <span className={styles.metricValue}>R$ 5.240</span>
                            </div>
                            <div className={styles.metric}>
                                <span className={styles.metricLabel}>Gastos</span>
                                <span className={styles.metricValue}>R$ 3.180</span>
                            </div>
                            <div className={styles.metric}>
                                <span className={styles.metricLabel}>Economia</span>
                                <span className={styles.metricValue}>R$ 2.060</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.features}>
                <div className={styles.featuresContent}>
                    <h2 className={styles.featuresTitle}>O que você consegue fazer</h2>
                    <p className={styles.sectionSubtitle}>
                        Tudo pensado para você ter clareza do seu dinheiro: visão rápida, organização e rotina simples.
                    </p>

                    <div className={styles.featuresGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>▦</div>
                            <h3>Dashboard financeiro</h3>
                            <p>Métricas, gráficos e uma visão geral do seu mês para decidir com confiança.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>≋</div>
                            <h3>Visão mensal</h3>
                            <p>Resumo de entradas, saídas e saldo acumulado para acompanhar sua evolução.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>◎</div>
                            <h3>Orçamento e metas</h3>
                            <p>Planeje seu orçamento doméstico e acompanhe o progresso das suas metas.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>#</div>
                            <h3>Tags e categorias</h3>
                            <p>Organize seus gastos por categoria e entenda para onde seu dinheiro está indo.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>⇅</div>
                            <h3>Importação por CSV</h3>
                            <p>Importe transações e acelere sua organização financeira sem cadastrar tudo na mão.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>✓</div>
                            <h3>Notas e pagamentos</h3>
                            <p>
                                Controle valores, vencimentos, itens em aberto e ações em lote para agilizar o dia a
                                dia.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.howItWorks}>
                <div className={styles.featuresContent}>
                    <h2 className={styles.featuresTitle}>Como funciona</h2>
                    <div className={styles.howGrid}>
                        <div className={styles.howCard}>
                            <div className={styles.howStep}>1</div>
                            <h3>Crie sua conta</h3>
                            <p>Em poucos segundos você já pode acessar o painel e começar a organizar suas finanças.</p>
                        </div>
                        <div className={styles.howCard}>
                            <div className={styles.howStep}>2</div>
                            <h3>Registre ou importe</h3>
                            <p>Cadastre movimentações ou use o CSV para importar dados e começar com histórico.</p>
                        </div>
                        <div className={styles.howCard}>
                            <div className={styles.howStep}>3</div>
                            <h3>Acompanhe e ajuste</h3>
                            <p>
                                Use relatórios, tags e orçamento para ajustar hábitos e atingir metas com mais clareza.
                            </p>
                        </div>
                    </div>
                    <div className={styles.centerCta}>
                        <Link className={styles.primaryButton} href="/signup">
                            Começar agora
                        </Link>
                    </div>
                </div>
            </section>

            <section className={styles.faq}>
                <div className={styles.featuresContent}>
                    <h2 className={styles.featuresTitle}>Perguntas frequentes</h2>
                    <div className={styles.faqGrid}>
                        <details className={styles.faqItem}>
                            <summary>O Kawori Financial é para finanças pessoais?</summary>
                            <p>
                                Sim. Ele foi pensado para controle financeiro pessoal e organização do orçamento
                                doméstico.
                            </p>
                        </details>
                        <details className={styles.faqItem}>
                            <summary>Consigo acompanhar por categorias?</summary>
                            <p>Sim. Use tags/categorias para agrupar gastos e analisar totais por período.</p>
                        </details>
                        <details className={styles.faqItem}>
                            <summary>Tem relatório e gráficos?</summary>
                            <p>
                                Sim. Você encontra visão geral, gráficos e relatórios para entender receitas, despesas e
                                evolução.
                            </p>
                        </details>
                        <details className={styles.faqItem}>
                            <summary>Posso importar CSV?</summary>
                            <p>
                                Sim. A importação CSV ajuda a começar rápido e trazer dados que você já tem em
                                planilhas.
                            </p>
                        </details>
                        <details className={styles.faqItem}>
                            <summary>É gratuito?</summary>
                            <p>Você pode criar conta e usar. Planos e precificação podem ser definidos futuramente.</p>
                        </details>
                    </div>
                </div>
            </section>

            <section className={styles.finalCta}>
                <div className={styles.featuresContent}>
                    <h2 className={styles.featuresTitle}>Mais clareza. Menos ansiedade com dinheiro.</h2>
                    <p className={styles.sectionSubtitle}>
                        Comece hoje a organizar seus gastos, planejar seu orçamento e acompanhar suas metas.
                    </p>
                    <div className={styles.centerCta}>
                        <Link className={styles.primaryButton} href="/signup">
                            Criar conta
                        </Link>
                        <Link className={styles.secondaryButton} href="/signin">
                            Entrar
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
