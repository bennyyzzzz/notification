import { useEffect, useState } from "react";
import { api } from "../api/api";

function formatDate(date) {
  if (!date) {
    return "Não informado";
  }

  return new Date(date).toLocaleString();
}

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadHistory() {
    try {
      setLoading(true);

      const response = await api.get("/send-history");
      setHistory(response.data);
    } catch (error) {
      console.log("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Histórico de envios</h2>
          <p className="muted">
            Consulte notificações enviadas, destino, URL final e retorno do Firebase.
          </p>
        </div>

        <button onClick={loadHistory}>
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {history.length === 0 && (
        <p className="muted">Nenhum envio encontrado.</p>
      )}

      <div className="history-list">
        {history.map((item) => (
          <div className="history-item" key={item.id}>
            <div className="history-main">
              <div>
                <div className="history-title-row">
                  <h3>{item.title}</h3>

                  <span className={`status-badge status-${item.status}`}>
                    {item.status}
                  </span>
                </div>

                <p className="history-body">{item.body}</p>
              </div>

              <div className="history-date">
                Enviado em: {formatDate(item.sentAt)}
              </div>
            </div>

            <div className="history-grid">
              <div>
                <span>Campanha</span>
                <strong>{item.campaignName || "Sem campanha"}</strong>
              </div>

              <div>
                <span>Destino</span>
                <strong>
                  {item.audienceType} — {item.audienceValue}
                </strong>
              </div>

              <div>
                <span>Agendado para</span>
                <strong>
                  {item.scheduledAt ? formatDate(item.scheduledAt) : "Envio imediato"}
                </strong>
              </div>

              <div>
                <span>Enviado em</span>
                <strong>{formatDate(item.sentAt)}</strong>
              </div>

              <div>
                <span>Firebase Message ID</span>
                <strong className="text-break">
                  {item.firebaseMessageId || "Não informado"}
                </strong>
              </div>

              <div>
                <span>URL final com UTM</span>

                {item.trackedUrl ? (
                  <a
                    href={item.trackedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-break"
                  >
                    {item.trackedUrl}
                  </a>
                ) : (
                  <strong>Não informado</strong>
                )}
              </div>
            </div>

            {item.errorMessage && (
              <div className="history-error">
                <strong>Erro:</strong> {item.errorMessage}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}