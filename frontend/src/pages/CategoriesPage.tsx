import { useMutation, useQuery } from "@apollo/client/react";
import { ArrowUpDown, Plus, Tag, Utensils } from "lucide-react";
import { useMemo, useState } from "react";
import { CategoryCard } from "../components/CategoryCard.js";
import { CategoryForm } from "../components/CategoryForm.js";
import { toast } from "../components/Toast.js";
import { Button, EmptyState, Modal, Spinner } from "../components/ui.js";
import {
  CREATE_CATEGORY,
  DELETE_CATEGORY,
  LIST_CATEGORIES,
  LIST_TRANSACTIONS,
  UPDATE_CATEGORY,
} from "../graphql/operations.js";
import type { Category, CategoryInput, Transaction } from "../types/index.js";

interface CategoriesData {
  categories: Category[];
}
interface TransactionsData {
  transactions: Transaction[];
}

export function CategoriesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>();
  const [deleting, setDeleting] = useState<Category | undefined>();
  const { data: categoryData, loading } = useQuery<CategoriesData>(LIST_CATEGORIES);
  const { data: transactionData } = useQuery<TransactionsData>(LIST_TRANSACTIONS);
  const [createCategory, createState] = useMutation(CREATE_CATEGORY);
  const [updateCategory, updateState] = useMutation(UPDATE_CATEGORY);
  const [deleteCategory, deleteState] = useMutation(DELETE_CATEGORY);
  const categories = categoryData?.categories ?? [];
  const transactions = transactionData?.transactions ?? [];
  const mostUsed = useMemo(
    () =>
      categories
        .map((category) => ({
          category,
          count: transactions.filter((item) => item.category?.id === category.id).length,
        }))
        .sort((a, b) => b.count - a.count)[0],
    [categories, transactions],
  );

  async function save(input: CategoryInput) {
    if (editing) {
      await updateCategory({
        variables: { id: editing.id, input },
        refetchQueries: [LIST_CATEGORIES, LIST_TRANSACTIONS],
      });
      toast.success("Categoria atualizada.");
      setEditing(undefined);
    } else {
      await createCategory({
        variables: { input },
        refetchQueries: [LIST_CATEGORIES],
      });
      toast.success("Categoria criada.");
      setShowCreate(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteCategory({
        variables: { id: deleting.id },
        refetchQueries: [LIST_CATEGORIES, LIST_TRANSACTIONS],
      });
      toast.success("Categoria excluída.");
      setDeleting(undefined);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir a categoria.");
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
          <h1>Categorias</h1>
          <p>Organize suas transações por categorias</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={17} />
          Nova categoria
        </Button>
      </div>
      <div className="category-stats">
        <article className="category-stat">
          <span className="category-stat__icon category-stat__icon--slate">
            <Tag size={21} />
          </span>
          <div>
            <strong>{categories.length}</strong>
            <span>total de categorias</span>
          </div>
        </article>
        <article className="category-stat">
          <span className="category-stat__icon category-stat__icon--purple">
            <ArrowUpDown size={21} />
          </span>
          <div>
            <strong>{transactions.length}</strong>
            <span>total de transações</span>
          </div>
        </article>
        <article className="category-stat">
          <span className="category-stat__icon category-stat__icon--blue">
            <Utensils size={21} />
          </span>
          <div>
            <strong>{mostUsed?.category.title ?? "—"}</strong>
            <span>categoria mais utilizada</span>
          </div>
        </article>
      </div>
      {categories.length ? (
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              transactions={transactions}
              onEdit={() => setEditing(category)}
              onDelete={() => setDeleting(category)}
            />
          ))}
        </div>
      ) : (
        <div className="panel category-empty">
          <EmptyState
            title="Nenhuma categoria ainda"
            description="Crie categorias para deixar suas finanças mais organizadas."
          />
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} />
            Nova categoria
          </Button>
        </div>
      )}
      {(showCreate || editing) && (
        <CategoryForm
          category={editing}
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
          title="Excluir categoria?"
          description={`A categoria “${deleting.title}” será removida. As transações vinculadas permanecerão sem categoria.`}
          onClose={() => setDeleting(undefined)}
        >
          <div className="form-actions">
            <Button variant="outline" onClick={() => setDeleting(undefined)}>
              Cancelar
            </Button>
            <Button variant="danger" disabled={deleteState.loading} onClick={confirmDelete}>
              {deleteState.loading ? "Excluindo…" : "Excluir categoria"}
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
}
