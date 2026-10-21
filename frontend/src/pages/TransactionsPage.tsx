import { useMutation, useQuery } from "@apollo/client/react";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "../components/Toast.js";
import { TransactionForm } from "../components/TransactionForm.js";
import { TransactionTable } from "../components/TransactionTable.js";
import { Button, Field, Input, Modal, Select, Spinner } from "../components/ui.js";
import {
  CREATE_TRANSACTION,
  DELETE_TRANSACTION,
  LIST_CATEGORIES,
  LIST_TRANSACTIONS,
  UPDATE_TRANSACTION,
} from "../graphql/operations.js";
import type { Category, Transaction, TransactionInput } from "../types/index.js";

interface CategoriesData {
  categories: Category[];
}
interface TransactionsData {
  transactions: Transaction[];
}

export function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>();
  const [deleting, setDeleting] = useState<Transaction | undefined>();
  const { data: transactionData, loading } = useQuery<TransactionsData>(LIST_TRANSACTIONS);
  const { data: categoryData } = useQuery<CategoriesData>(LIST_CATEGORIES);
  const [createTransaction, createState] = useMutation(CREATE_TRANSACTION);
  const [updateTransaction, updateState] = useMutation(UPDATE_TRANSACTION);
  const [deleteTransaction, deleteState] = useMutation(DELETE_TRANSACTION);
  const transactions = transactionData?.transactions ?? [];
  const categories = categoryData?.categories ?? [];
  const months = useMemo(
    () =>
      [...new Set(transactions.map((transaction) => transaction.date.slice(0, 7)))]
        .sort()
        .reverse(),
    [transactions],
  );
  const filtered = useMemo(
    () =>
      transactions.filter((transaction) => {
        const matchesSearch = transaction.description
          .toLocaleLowerCase("pt-BR")
          .includes(search.toLocaleLowerCase("pt-BR"));
        return (
          matchesSearch &&
          (typeFilter === "ALL" || transaction.type === typeFilter) &&
          (categoryFilter === "ALL" || transaction.category?.id === categoryFilter) &&
          (monthFilter === "ALL" || transaction.date.slice(0, 7) === monthFilter)
        );
      }),
    [transactions, search, typeFilter, categoryFilter, monthFilter],
  );

  async function save(input: TransactionInput) {
    if (editing) {
      await updateTransaction({
        variables: { id: editing.id, input },
        refetchQueries: [LIST_TRANSACTIONS],
      });
      toast.success("Transação atualizada.");
      setEditing(undefined);
    } else {
      await createTransaction({
        variables: { input },
        refetchQueries: [LIST_TRANSACTIONS],
      });
      toast.success("Transação criada.");
      setShowCreate(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteTransaction({
        variables: { id: deleting.id },
        refetchQueries: [LIST_TRANSACTIONS],
      });
      toast.success("Transação excluída.");
      setDeleting(undefined);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir a transação.");
    }
  }

  if (loading)
    return (
      <div className="center-loader">
        <Spinner />
      </div>
    );

  return (
    <section className="content-page">
      <div className="page-heading">
        <div>
          <h1>Transações</h1>
          <p>Gerencie todas as suas transações financeiras</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={17} />
          Nova transação
        </Button>
      </div>
      <div className="filter-panel">
        <Field label="Buscar">
          <div className="input-with-icon">
            <Search size={16} />
            <Input
              placeholder="Buscar por descrição"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </Field>
        <Field label="Tipo">
          <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="ALL">Todos</option>
            <option value="INCOME">Entrada</option>
            <option value="EXPENSE">Saída</option>
          </Select>
        </Field>
        <Field label="Categoria">
          <Select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="ALL">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Período">
          <Select value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)}>
            <option value="ALL">Todos os períodos</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {new Intl.DateTimeFormat("pt-BR", {
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                }).format(new Date(`${month}-01T00:00:00Z`))}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="panel transactions-panel">
        <TransactionTable transactions={filtered} onEdit={setEditing} onDelete={setDeleting} />
        <div className="table-footer">
          <span>
            {filtered.length
              ? `1 a ${filtered.length} | ${filtered.length} resultados`
              : "0 resultados"}
          </span>
          <span>Exibindo todas as transações</span>
        </div>
      </div>
      {(showCreate || editing) && (
        <TransactionForm
          categories={categories}
          transaction={editing}
          onClose={() => {
            setShowCreate(false);
            setEditing(undefined);
          }}
          onSubmit={save}
          submitting={createState.loading || updateState.loading}
        />
      )}
      {deleting && (
        <Modal
          title="Excluir transação?"
          description={`A transação “${deleting.description}” será removida permanentemente.`}
          onClose={() => setDeleting(undefined)}
        >
          <div className="form-actions">
            <Button variant="outline" onClick={() => setDeleting(undefined)}>
              Cancelar
            </Button>
            <Button variant="danger" disabled={deleteState.loading} onClick={confirmDelete}>
              {deleteState.loading ? "Excluindo…" : "Excluir transação"}
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
}
