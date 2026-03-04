# Auditoria de Autenticação Frontend

Data: 2026-03-03  
Projeto: `kawori-financial`  
Escopo: comparar implementação atual do frontend com a documentação do backend `authentication` (`/auth/*`) e investigar bug de sessão após longo tempo com a página fechada.

## Resumo executivo

Foi identificado e corrigido o bug principal reportado: após reabrir a página com sessão envelhecida, o refresh de token ocorria, mas o estado de autenticação do frontend ficava inconsistente, causando ausência de dados no sidebar/header.

Causa raiz principal:
- O `AuthProvider` considerava autenticado apenas quando `verifyToken` retornava exatamente a string `"Token válido"`.
- A documentação/backend utiliza `"Token valido"` (sem acento).
- Resultado: requests de dados podiam voltar a funcionar via refresh, mas `isAuthenticated` continuava `false` em partes da UI.

Correção aplicada:
- Autenticação no provider passou a ser definida por `status === 200` da chamada `/auth/token/verify/`.

## Correções aplicadas

1. Correção do critério de autenticação no provider
- Arquivo: `src/components/providers/auth/index.tsx`
- Antes: comparação textual exata da mensagem.
- Depois: autenticação por `verifyTokenData?.status === 200`.

2. Correção de endpoint CSRF
- Arquivo: `src/services/auth/index.ts`
- Antes: `apiAuth.get("/csrf/")` (quebrava o prefixo `/auth/`).
- Depois: `apiAuth.get("csrf/")` (resolve para `/auth/csrf/`).

3. Ajuste de payload de login para contrato do backend
- Arquivo: `src/services/auth/index.ts`
- Antes: enviava `remember` junto com login.
- Depois: envia apenas `{ username, password }` para `/auth/token/`.

4. Inclusão de serviços faltantes de verificação de email
- Arquivo: `src/services/auth/index.ts`
- Adicionados:
  - `verifyEmailService` -> `POST /auth/email/verify/`
  - `resendEmailVerificationService` -> `POST /auth/email/resend-verification/`

5. Reforço de testes
- Arquivo novo: `src/components/providers/auth/index.test.tsx`
- Garante regressão do bug corrigido (status 200 autentica mesmo com mensagem `"Token valido"`).
- Arquivo ajustado: `src/services/auth/index.test.ts`
  - Atualizado teste de login para payload correto.
  - Cobertura para endpoints de email verification.

## Checklist endpoint a endpoint (doc backend x frontend)

1. `POST /auth/token/`
- Status: Atende.
- Implementação em `signinService`; usado em login e auto-login pós-signup.

2. `GET /auth/signout`
- Status: Atende.
- Implementado e usado no fluxo de logout do provider.

3. `POST /auth/token/verify/`
- Status: Atende.
- Usado para estado de sessão no `AuthProvider`.
- Bug relacionado corrigido (critério por status HTTP).

4. `POST /auth/token/refresh/`
- Status: Atende.
- Implementado com retry automático nos interceptors de `apiDjango`/`apiAuth`.

5. `POST /auth/signup`
- Status: Atende.
- Implementado e utilizado na tela de cadastro.

6. `GET /auth/csrf/`
- Status: Atende.
- Corrigido path para respeitar prefixo `/auth/`.

7. `POST /auth/password-reset/request/`
- Status: Atende.
- Implementado e utilizado no fluxo de reset.

8. `GET /auth/password-reset/validate/`
- Status: Atende.
- Implementado e utilizado no fluxo de reset.

9. `POST /auth/password-reset/confirm/`
- Status: Atende.
- Implementado e utilizado no fluxo de reset.

10. `POST /auth/email/verify/`
- Status: Parcial.
- Service implementado.
- Não há integração visível em tela/fluxo do app no momento.

11. `POST /auth/email/resend-verification/`
- Status: Parcial.
- Service implementado.
- Não há integração visível em tela/fluxo do app no momento.

## Evidências técnicas importantes

- Gate de rotas no Next proxy usa cookie `lifetimetoken`:
  - `src/proxy.ts`
- Estado de autenticação alimenta queries de usuário/grupos, que afetam sidebar/menu:
  - `src/components/providers/user/index.tsx`
  - `src/components/providers/layout/index.tsx`
- Refresh automático ao receber 401 nas APIs de domínio:
  - `src/services/index.ts` (interceptor de `apiDjango`)
  - `src/services/auth/index.ts` (refresh + eventos)

## Testes executados

1. `yarn test src/services/auth/index.test.ts src/services/auth/auth.interceptors.test.ts`
- Resultado: 2 suites, 18 testes, passando.

2. `yarn test src/components/providers/auth/index.test.tsx src/services/auth/index.test.ts src/services/auth/auth.interceptors.test.ts`
- Resultado: 3 suites, 20 testes, passando.

3. `yarn test src/app/app.core.test.tsx src/components/providers/user/index.test.tsx src/components/providers/layout/index.test.tsx`
- Resultado: suites passando (com warnings não bloqueantes do Ant Design em testes).

4. `yarn compile`
- Resultado: TypeScript OK.

## Pendências recomendadas

1. Integrar UI para verificação de email
- Implementar tela/rota para consumir `verifyEmailService`.
- Implementar ação de reenvio com `resendEmailVerificationService` para usuário autenticado.

2. Endurecer fallback de autenticação
- Hoje o critério principal por status 200 resolve o problema reportado e reduz acoplamento a string.
- Opcionalmente, pode-se validar também payload `{ msg }` apenas para logging/telemetria, sem bloquear estado auth.

3. Reforçar testes E2E de sessão longa
- Cenário: sessão expirada -> primeiro 401 -> refresh -> sucesso -> estado auth e sidebar consistentes.

