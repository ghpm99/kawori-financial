# Endpoint: Extrato Bancário

## Request

```
GET /financial/payment/statement/?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
```

### Parâmetros (query string)

| Parâmetro   | Tipo   | Obrigatório | Descrição                        |
|-------------|--------|-------------|----------------------------------|
| `date_from` | string | Sim         | Data inicial no formato YYYY-MM-DD |
| `date_to`   | string | Sim         | Data final no formato YYYY-MM-DD   |

## Response (200 OK)

```json
{
  "data": {
    "summary": {
      "opening_balance": 1500.00,
      "total_credits": 8000.00,
      "total_debits": 5200.00,
      "closing_balance": 4300.00
    },
    "transactions": [
      {
        "id": 101,
        "name": "Salário",
        "description": "Pagamento mensal",
        "payment_date": "2026-01-05",
        "date": "2026-01-01",
        "type": 0,
        "value": 8000.00,
        "running_balance": 9500.00,
        "invoice_name": null,
        "tags": []
      },
      {
        "id": 102,
        "name": "Aluguel",
        "description": "Apartamento centro",
        "payment_date": "2026-01-10",
        "date": "2026-01-10",
        "type": 1,
        "value": 2500.00,
        "running_balance": 7000.00,
        "invoice_name": "Fatura Janeiro",
        "tags": [
          { "id": 1, "name": "Moradia", "color": "#ff4d4f" }
        ]
      }
    ]
  }
}
```

## Campos

### `summary`

| Campo             | Tipo   | Descrição                                                              |
|-------------------|--------|------------------------------------------------------------------------|
| `opening_balance` | number | Saldo de abertura no início do período                                 |
| `total_credits`   | number | Soma de todos os créditos (type=0) baixados no período                 |
| `total_debits`    | number | Soma de todos os débitos (type=1) baixados no período                  |
| `closing_balance` | number | Saldo final: opening_balance + total_credits - total_debits            |

### `transactions[]`

| Campo             | Tipo         | Descrição                                                        |
|-------------------|--------------|------------------------------------------------------------------|
| `id`              | number       | ID do pagamento                                                  |
| `name`            | string       | Nome/descrição do pagamento                                      |
| `description`     | string       | Descrição adicional                                              |
| `payment_date`    | string       | Data de baixa (YYYY-MM-DD) — data efetiva do pagamento          |
| `date`            | string       | Data de vencimento original (YYYY-MM-DD)                         |
| `type`            | number       | Tipo: 0 = crédito (entrada), 1 = débito (saída)                 |
| `value`           | number       | Valor absoluto da transação                                      |
| `running_balance` | number       | Saldo corrente após esta transação                               |
| `invoice_name`    | string\|null | Nome da fatura associada, se houver                              |
| `tags`            | array        | Tags associadas: `{ id, name, color }`                           |

## Lógica Financeira

- O extrato mostra apenas **pagamentos baixados** (status=1).
- As transações são ordenadas por `payment_date ASC`, `id ASC`.
- O **saldo de abertura** (`opening_balance`) é calculado como a soma de todos os créditos menos todos os débitos baixados com `payment_date < date_from`.
- O **saldo corrente** (`running_balance`) de cada transação é calculado incrementalmente a partir do saldo de abertura:
  - Para créditos (type=0): `saldo_anterior + value`
  - Para débitos (type=1): `saldo_anterior - value`
- O **saldo final** (`closing_balance`) é o `running_balance` da última transação, ou igual ao `opening_balance` se não houver transações no período.

## Códigos de Status HTTP

| Status | Descrição                                                    |
|--------|--------------------------------------------------------------|
| 200    | Sucesso — retorna summary + transactions                     |
| 400    | Parâmetros inválidos (date_from/date_to ausentes ou mal formatados) |
| 401    | Não autenticado — token JWT ausente ou expirado              |
| 403    | Sem permissão — usuário não pertence ao grupo "financial"    |
| 500    | Erro interno do servidor                                     |
