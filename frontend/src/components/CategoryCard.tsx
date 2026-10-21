import { Pencil, Trash2 } from "lucide-react";
import { categoryIcon, toneFor } from "../lib/format.js";
import type { Category, Transaction } from "../types/index.js";
import { CategoryIcon } from "./icons.js";
import { IconButton } from "./ui.js";

export function CategoryCard({
  category,
  transactions,
  onEdit,
  onDelete,
}: {
  category: Category;
  transactions: Transaction[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const count = transactions.filter(
    (transaction) => transaction.category?.id === category.id,
  ).length;
  return (
    <article className="category-card">
      <div className="category-card__header">
        <span className={`category-icon category-icon--${toneFor(category)}`}>
          <CategoryIcon name={categoryIcon(category.icon, category.title)} size={17} />
        </span>
        <div className="row-actions">
          <IconButton label={`Editar ${category.title}`} onClick={onEdit}>
            <Pencil size={15} />
          </IconButton>
          <IconButton label={`Excluir ${category.title}`} danger onClick={onDelete}>
            <Trash2 size={15} />
          </IconButton>
        </div>
      </div>
      <div className="category-card__copy">
        <h3>{category.title}</h3>
        <p>{category.description || "Sem descrição"}</p>
      </div>
      <div className="category-card__footer">
        <span className={`category-pill category-pill--${toneFor(category)}`}>
          {category.title}
        </span>
        <span>
          {count} {count === 1 ? "item" : "itens"}
        </span>
      </div>
    </article>
  );
}
