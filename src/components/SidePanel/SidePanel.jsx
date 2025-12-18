function SidePanel({ title, onClose, children, actions }) {
  return (
    <div className="side-panel">
      <header>
        <h3>{title}</h3>
        <button className="btn secondary" onClick={onClose}>
          Закрыть
        </button>
      </header>
      <div>{children}</div>
      {actions && <div style={{ marginTop: 16, display: "flex", gap: 8 }}>{actions}</div>}
    </div>
  );
}

export default SidePanel;




