function Modal({ isOpen, onClose, title, children, actions }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal">
        <header>
          <h3>{title}</h3>
          <button className="btn secondary" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="modal-content">{children}</div>
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </>
  );
}

export default Modal;

