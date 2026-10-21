import { ArrowDownCircle, ArrowUpCircle, Pencil, Trash2 } from "lucide-react";
import { categoryIcon, currency, shortDate, toneFor } from "../lib/format.js";
import type { Transaction } from "../types/index.js";
import { CategoryIcon } from "./icons.js";
import { EmptyState, IconButton } from "./ui.js";

export function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  compact = false,
}: {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  compact?: boolean;
}) {
  if (!transactions.length)
    return (
      <EmptyState
        title="Nenhuma transação encontrada"
        description="Quando você registrar uma movimentação, ela aparecerá aqui."
      />
    );
  return (
    <div className="table-wrap">
      <table className={`data-table${compact ? " data-table--compact" : ""}`}>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Data</th>
            <th>Categoria</th>
            <th>Tipo</th>
            <th className="align-right">Valor</th>
            <th className="align-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const income = transaction.type === "INCOME";
            return (
              <tr key={transaction.id}>
                <td>
                  <div className="transaction-name">
                    <span
                      className={`category-icon category-icon--${toneFor(transaction.category)}`}
                    >
                      <CategoryIcon
                        name={categoryIcon(transaction.category?.icon, transaction.category?.title)}
                        size={16}
                      />
                    </span>
                    <span className="transaction-name__text">
                      {transaction.description}
                      <small>{shortDate(transaction.date)}</small>
                    </span>
                  </div>
                </td>
                <td className="date-cell">{shortDate(transaction.date)}</td>
                <td>
                  {transaction.category ? (
                    <span
                      className={`category-pill category-pill--${toneFor(transaction.category)}`}
                    >
                      {transaction.category.title}
                    </span>
                  ) : (
                    <span className="muted">Sem categoria</span>
                  )}
                </td>
                <td>
                  <span
                    className={`transaction-type transaction-type--${income ? "income" : "expense"}`}
                  >
                    {income ? <ArrowUpCircle size={15} /> : <ArrowDownCircle size={15} />}
                    {income ? "Entrada" : "Saída"}
                  </span>
                </td>
                <td
                  className={`amount-cell align-right ${income ? "amount-cell--income" : "amount-cell--expense"}`}
                >
                  {income ? "+" : "−"} {currency(transaction.amount)}
                </td>
                <td>
                  <div className="row-actions">
                    <IconButton label="Editar transação" onClick={() => onEdit(transaction)}>
                      <Pencil size={15} />
                    </IconButton>
                    <IconButton
                      label="Excluir transação"
                      danger
                      onClick={() => onDelete(transaction)}
                    >
                      <Trash2 size={15} />
                    </IconButton>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
