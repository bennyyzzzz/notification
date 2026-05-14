export default function QueueCheckout({
  queue,
  onRemove,
  onDuplicate,
  onSend
}) {
  return (
    <section className="card">
      <h2>4. Fila / Checkout de envio</h2>

      {queue.length === 0 && (
        <p className="muted">Nenhuma notificação na fila.</p>
      )}

      {queue.map((item) => (
        <div className="queue-item" key={item.id}>
          <div>
            <h3>{item.title}</h3>
            <p>{item.body}</p>

            <small>
              Destino: {item.audienceType} - {item.audienceValue}
            </small>

            <br />

            <small>
              Link: {item.redirectUrl}
            </small>
          </div>

          <div className="actions">
            <button onClick={() => onSend(item)}>
              Enviar agora
            </button>

            <button onClick={() => onDuplicate(item.id)}>
              Duplicar
            </button>

            <button className="danger" onClick={() => onRemove(item.id)}>
              Remover
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}