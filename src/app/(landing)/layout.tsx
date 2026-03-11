import React from "react";

import LandingHeaderClient from "./LandingHeaderClient";

import styles from "./landing.module.scss";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className={styles["container"]}>
            <a href="#main-content" className={styles["skip-link"]}>
                Pular para o conteúdo principal
            </a>
            <header>
                <LandingHeaderClient />
            </header>
            <main id="main-content" className={styles["body"]}>
                <div className={styles["internal-page"]}>{children}</div>
            </main>
            <footer className={styles["footer"]}>
                <nav aria-label="Links do rodapé">
                    <a href="/signin">Entrar</a>
                    <span aria-hidden="true"> | </span>
                    <a href="/signup">Criar conta</a>
                    <span aria-hidden="true"> | </span>
                    <a href="/sitemap.xml">Sitemap</a>
                </nav>
                <p>&copy; {new Date().getFullYear()} Kawori Financial. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
};

export default LandingLayout;
