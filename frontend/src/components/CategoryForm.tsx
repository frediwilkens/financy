import { useState } from "react";
import type { Category, CategoryInput } from "../types/index.js";
import { Button, Field, Input, Modal, Select, Textarea } from "./ui.js";

const categoryIcons = [
  "utensils",
  "shopping-cart",
  "car-front",
  "ticket",
  "tool-case",
  "piggy-bank",
  "briefcase-business",
  "heart-pulse",
  "house",
  "wallet",
  "tag",
];

export function CategoryForm({
  category,
  onClose,
  onSubmit,
  submitting,
}: {
  category?: Category;
  onClose: () => void;
  onSubmit: (input: CategoryInput) => Promise<void>;
  submitting: boolean;
}) {
  const [title, setTitle] = useState(category?.title ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [color, setColor] = useState(category?.color ?? "#2563EB");
  const [icon, setIcon] = useState(category?.icon ?? "tag");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        color,
        icon,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível salvar a categoria.");
    }
  }

  return (
    <Modal
      title={category ? "Editar categoria" : "Nova categoria"}
      description="Organize suas movimentações com categorias personalizadas."
      onClose={onClose}
    >
      <form className="form-stack" onSubmit={handleSubmit}>
        <Field label="Nome">
          <Input
            autoFocus
            required
            maxLength={32}
            placeholder="Ex.: Alimentação"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
        <Field label="Descrição">
          <Textarea
            rows={3}
            maxLength={100}
            placeholder="O que esta categoria representa?"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <Field label="Ícone">
          <Select value={icon} onChange={(event) => setIcon(event.target.value)}>
            {categoryIcons.map((name) => (
              <option value={name} key={name}>
                {name.replace(/-/g, " ")}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Cor">
          <div className="color-input">
            <input
              aria-label="Escolher cor"
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
            />
            <Input
              aria-label="Código hexadecimal"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              pattern="^#[0-9a-fA-F]{6}$"
            />
          </div>
        </Field>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Salvando…" : "Salvar categoria"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
