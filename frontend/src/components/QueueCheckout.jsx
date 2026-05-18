export default function QueueCheckout({
  queue,
  onRemove,
  onDuplicate,
  onSend,
  onRefresh,
  isRefreshing
}) {
  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Fila / Checkout de envio</h2>

          <p className="muted">
            Gerencie notificações pendentes, agendadas ou com falha.
          </p>
        </div>

        <button disabled={isRefreshing} onClick={onRefresh}>
          {isRefreshing ? "Atualizando..." : "Atualizar fila"}
        </button>
      </div>

      {queue.length === 0 && (
        <p className="muted">Nenhuma notificação na fila.</p>
      )}

      {queue.map((item) => (
        <div className="queue-item" key={item.id}>
          <div>
            <div className="queue-title-row">
              <h3>{item.title}</h3>

              <span className={`status-badge status-${item.status}`}>
                {item.status}
              </span>
            </div>

            <p>{item.body}</p>

            <small>
              Destino: {item.audienceType} - {item.audienceValue}
            </small>

            <br />

            <small>
              Link: {item.redirectUrl}
            </small>

            {item.status === "scheduled" && item.scheduledAt && (
              <p className="scheduled-info">
                Envio previsto:{" "}
                {new Date(item.scheduledAt).toLocaleString()}
              </p>
            )}
          </div>

          <div className="actions">
            <button
              disabled={item.status === "scheduled"}
              onClick={() => onSend(item)}
            >
              {item.status === "scheduled" ? "Agendado" : "Enviar agora"}
            </button>

            <button onClick={() => onDuplicate(item.id)}>
              Duplicar
            </button>

            <button
              className="danger"
              onClick={() => onRemove(item.id)}
            >
              Remover
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}