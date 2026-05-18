import { useEffect, useMemo, useState } from "react";
import { api } from "../api/api";

function formatDate(date) {
  if (!date) {
    return "Não informado";
  }

  return new Date(date).toLocaleString();
}

const ITEMS_PER_PAGE = 5;

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const [expandedItems, setExpandedItems] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

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

  function toggleExpand(id) {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  }

  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);

  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    return history.slice(start, end);
  }, [history, currentPage]);

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Histórico de envios</h2>

          <p className="muted">
            Consulte notificações enviadas, destino e retorno do Firebase.
          </p>
        </div>

        <button disabled={loading} onClick={loadHistory}>
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {history.length === 0 && !loading && (
        <p className="muted">Nenhum envio encontrado.</p>
      )}

      <div className="history-list">
        {paginatedHistory.map((item) => {
          const expanded = expandedItems[item.id];

          return (
            <div className="history-item compact" key={item.id}>
              <div className="history-compact">
                <div>
                  <div className="history-title-row">
                    <h3>{item.title}</h3>

                    <span
                      className={`status-badge status-${item.status}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="history-body">
                    {item.body}
                  </p>
                </div>

                <div className="history-actions">
                  <small>
                    {formatDate(item.sentAt)}
                  </small>

                  <button
                    className="expand-button"
                    onClick={() => toggleExpand(item.id)}
                  >
                    {expanded ? "Fechar" : "Detalhes"}
                  </button>
                </div>
              </div>

              {expanded && (
                <div className="history-grid">
                  <div>
                    <span>Campanha</span>

                    <strong>
                      {item.campaignName || "Sem campanha"}
                    </strong>
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
                      {item.scheduledAt
                        ? formatDate(item.scheduledAt)
                        : "Envio imediato"}
                    </strong>
                  </div>

                  <div>
                    <span>Enviado em</span>

                    <strong>
                      {formatDate(item.sentAt)}
                    </strong>
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
              )}

              {item.errorMessage && expanded && (
                <div className="history-error">
                  <strong>Erro:</strong> {item.errorMessage}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage((prev) => prev - 1)
            }
          >
            Anterior
          </button>

          <span>
            Página {currentPage} de {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => prev + 1)
            }
          >
            Próxima
          </button>
        </div>
      )}
    </section>
  );
}