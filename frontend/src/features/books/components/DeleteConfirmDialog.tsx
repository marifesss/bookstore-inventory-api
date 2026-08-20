import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import type { Book } from '../../../types/book';
import { useDeleteBook } from '../hooks/useBookMutations';

interface DeleteConfirmDialogProps {
  book: Book;
  onClose: () => void;
}

export function DeleteConfirmDialog({ book, onClose }: DeleteConfirmDialogProps) {
  const showToast = useToast();
  const remove = useDeleteBook();

  const confirm = () => {
    remove.mutate(book.id, {
      onSuccess: () => {
        showToast('success', 'Libro eliminado');
        onClose();
      },
      onError: (error) => showToast('error', error.message),
    });
  };

  return (
    <Modal title="Eliminar libro" onClose={onClose}>
      <p className="text-ink">
        ¿Seguro que quieres eliminar <strong>{book.title}</strong>? Esta acción no
        se puede deshacer.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="h-10 rounded-card border border-line bg-surface px-4 font-medium text-ink transition-colors hover:bg-paper"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={remove.isPending}
          className="h-10 rounded-card bg-danger px-4 font-medium text-white transition-colors disabled:opacity-60"
        >
          {remove.isPending ? 'Eliminando…' : 'Eliminar'}
        </button>
      </div>
    </Modal>
  );
}
