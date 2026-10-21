import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { Category, Transaction, TransactionInput, TransactionType } from "../types/index.js";
import { Button, Field, Input, Modal, Select, Textarea } from "./ui.js";

export function TransactionForm({
  categories,
  transaction,
  onClose,
  onSubmit,
  submitting,
}: {
  categories: Category[];
  transaction?: Transaction;
  onClose: () => void;
  onSubmit: (input: TransactionInput) => Promise<void>;
  submitting: boolean;
}) {
  const [description, setDescription] = useState(transaction?.description ?? "");
  const [amount, setAmount] = useState(transaction?.amount.toString() ?? "");
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "EXPENSE");
  const [categoryId, setCategoryId] = useState(transaction?.category?.id ?? "");
  const [date, setDate] = useState(
    transaction
      ? new Date(transaction.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  );
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (categories.length && !categoryId) setCategoryId(categories[0]?.id ?? "");
  }, [categories, categoryId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const numericAmount = Number(amount.replace(",", "."));
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError("Informe um valor maior que zero.");
      return;
    }
    try {
      await onSubmit({
        description: description.trim(),
        amount: numericAmount,
        type,
        date: new Date(`${date}T12:00:00`).toISOString(),
        categoryId: categoryId || null,
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Não foi possível salvar a transação.");
    }
  }

  return (
    <Modal
      title={transaction ? "Editar transação" : "Nova transação"}
      description="Preencha os dados da movimentação financeira."
      onClose={onClose}
    >
      <form className="form-stack" onSubmit={handleSubmit}>
        <Field label="Descrição">
          <Input
            autoFocus
            required
            maxLength={100}
            placeholder="Ex.: Jantar no restaurante"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <div className="form-grid">
          <Field label="Valor">
            <div className="money-input">
              <span>R$</span>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                required
                placeholder="0,00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
          </Field>
          <Field label="Data">
            <Input
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </Field>
        </div>
        <Field label="Tipo">
          <div className="type-switch">
            <button
              type="button"
              className={
                type === "EXPENSE" ? "type-switch__option is-active expense" : "type-switch__option"
              }
              onClick={() => setType("EXPENSE")}
            >
              <ArrowDownCircle size={17} />
              Despesa
            </button>
            <button
              type="button"
              className={
                type === "INCOME" ? "type-switch__option is-active income" : "type-switch__option"
              }
              onClick={() => setType("INCOME")}
            >
              <ArrowUpCircle size={17} />
              Receita
            </button>
          </div>
        </Field>
        <Field label="Categoria">
          <Select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            required
          >
            <option value="" disabled>
              Selecione uma categoria
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Observações (opcional)">
          <Textarea rows={2} placeholder="Adicione mais detalhes" />
        </Field>
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        <div className="form-actions">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting || !categories.length}>
            {submitting ? "Salvando…" : "Salvar transação"}
          </Button>
        </div>
        {!categories.length && (
          <p className="field__hint">Crie uma categoria antes de cadastrar transações.</p>
        )}
      </form>
    </Modal>
  );
}
