import { useMutation, useQuery } from "@apollo/client/react";
import { ArrowDownCircle, ArrowRight, ArrowUpCircle, Plus, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CategoryIcon } from "../components/icons.js";
import { toast } from "../components/Toast.js";
import { TransactionForm } from "../components/TransactionForm.js";
import { Button, EmptyState, Spinner } from "../components/ui.js";
import { CREATE_TRANSACTION, LIST_CATEGORIES, LIST_TRANSACTIONS } from "../graphql/operations.js";
import { currency, shortDate, toneFor } from "../lib/format.js";
import type { Category, Transaction, TransactionInput } from "../types/index.js";

interface CategoriesData {
  categories: Category[];
}
interface TransactionsData {
  transactions: Transaction[];
}

export function DashboardPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { data: transactionData, loading: transactionsLoading } =
    useQuery<TransactionsData>(LIST_TRANSACTIONS);
  const { data: categoryData, loading: categoriesLoading } =
    useQuery<CategoriesData>(LIST_CATEGORIES);
  const [createTransaction, createState] = useMutation(CREATE_TRANSACTION);
  const transactions = transactionData?.transactions ?? [];
  const categories = categoryData?.categories ?? [];
  const recent = useMemo(
    () => [...transactions].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 5),
    [transactions],
  );
  const now = new Date();
  const monthTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  });
  const income = monthTransactions
    .filter((item) => item.type === "INCOME")
    .reduce((sum, item) => sum + item.amount, 0);
  const expense = monthTransactions
    .filter((item) => item.type === "EXPENSE")
    .reduce((sum, item) => sum + item.amount, 0);
  const balance = transactions.reduce(
    (sum, item) => sum + (item.type === "INCOME" ? item.amount : -item.amount),
    0,
  );
  const categoryStats = categories
    .map((category) => ({
      category,
      items: monthTransactions.filter(
        (item) => item.category?.id === category.id && item.type === "EXPENSE",
      ),
    }))
    .sort(
      (a, b) =>
        b.items.reduce((sum, item) => sum + item.amount, 0) -
        a.items.reduce((sum, item) => sum + item.amount, 0),
    )
    .slice(0, 5);

  async function create(input: TransactionInput) {
    await createTransaction({
      variables: { input },
      refetchQueries: [LIST_TRANSACTIONS],
    });
    toast.success("Transação criada.");
    setShowCreate(false);
  }

  if (transactionsLoading || categoriesLoading)
    return (
      <div className="center-loader">
        <Spinner />
      </div>
    );

  return (
    <div className="dashboard-page">
      <section className="summary-grid">
        <SummaryCard
          icon={<Wallet size={20} />}
          label="Saldo total"
          amount={balance}
          tone="purple"
        />
        <SummaryCard
          icon={<ArrowUpCircle size={20} />}
          label="Receitas do mês"
          amount={income}
          tone="green"
        />
        <SummaryCard
          icon={<ArrowDownCircle size={20} />}
          label="Despesas do mês"
          amount={expense}
          tone="red"
        />
      </section>
      <section className="dashboard-grid">
        <article className="panel recent-panel">
          <div className="panel__header">
            <h2>Transações recentes</h2>
            <Link className="panel-link" to="/transactions">
              Ver todas <ArrowRight size={16} />
            </Link>
          </div>
          {recent.length ? (
            <>
              <div className="recent-list">
                {recent.map((transaction) => (
                  <RecentTransaction key={transaction.id} transaction={transaction} />
                ))}
              </div>
              <button
                type="button"
                className="panel-footer-link"
                onClick={() => setShowCreate(true)}
              >
                <Plus size={17} />
                Nova transação
              </button>
            </>
          ) : (
            <div className="panel-empty">
              <EmptyState
                title="Ainda sem movimentações"
                description="Adicione sua primeira transação para começar."
              />
              <Button onClick={() => setShowCreate(true)}>
                <Plus size={16} />
                Nova transação
              </Button>
            </div>
          )}
        </article>
        <article className="panel category-summary">
          <div className="panel__header">
            <h2>Categorias</h2>
            <Link className="panel-link" to="/categories">
              Gerenciar <ArrowRight size={16} />
            </Link>
          </div>
          {categoryStats.length ? (
            <div className="category-summary__list">
              {categoryStats.map(({ category, items }) => (
                <div className="category-summary__row" key={category.id}>
                  <span className={`category-pill category-pill--${toneFor(category)}`}>
                    {category.title}
                  </span>
                  <span className="category-summary__count">
                    {items.length} {items.length === 1 ? "item" : "itens"}
                  </span>
                  <strong>{currency(items.reduce((sum, item) => sum + item.amount, 0))}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="panel-empty">
              <EmptyState
                title="Sem categorias"
                description="Crie categorias para organizar as despesas."
              />
              <Link className="text-link" to="/categories">
                Criar categoria
              </Link>
            </div>
          )}
        </article>
      </section>
      {showCreate && (
        <TransactionForm
          categories={categories}
          onClose={() => setShowCreate(false)}
          onSubmit={create}
          submitting={createState.loading}
        />
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  amount,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  amount: number;
  tone: string;
}) {
  return (
    <article className="summary-card">
      <div className="summary-card__label">
        <span className={`summary-card__icon summary-card__icon--${tone}`}>{icon}</span>
        <span>{label}</span>
      </div>
      <strong>{currency(amount)}</strong>
    </article>
  );
}

function RecentTransaction({ transaction }: { transaction: Transaction }) {
  const income = transaction.type === "INCOME";
  const icon = transaction.category?.icon;
  return (
    <div className="recent-row">
      <span className={`category-icon category-icon--${toneFor(transaction.category)}`}>
        <CategoryIcon name={icon} size={16} />
      </span>
      <div className="recent-row__title">
        <strong>{transaction.description}</strong>
        <span>{shortDate(transaction.date)}</span>
      </div>
      <span className={`category-pill category-pill--${toneFor(transaction.category)}`}>
        {transaction.category?.title ?? "Sem categoria"}
      </span>
      <strong
        className={`recent-row__amount ${income ? "amount-cell--income" : "amount-cell--expense"}`}
      >
        {income ? "+" : "−"} {currency(transaction.amount)}
      </strong>
      <span
        className={`recent-row__type ${income ? "amount-cell--income" : "amount-cell--expense"}`}
      >
        {income ? <ArrowUpCircle size={15} /> : <ArrowDownCircle size={15} />}
      </span>
    </div>
  );
}
