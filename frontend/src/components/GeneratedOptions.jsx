export default function GeneratedOptions({ options, onChoose }) {
  return (
    <section className="card">
      <h2>2. Opções geradas</h2>

      {options.length === 0 && (
        <p className="muted">Nenhuma opção gerada ainda.</p>
      )}

      <div className="options-list">
        {options.map((option) => (
          <div className="option-card" key={option.id}>
            <h3>{option.title}</h3>
            <p>{option.body}</p>

            <small>
              <strong>CTA:</strong> {option.cta}
            </small>

            <small>
              <strong>Estratégia:</strong> {option.strategy}
            </small>

            <button onClick={() => onChoose(option)}>
              Escolher esta opção
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}