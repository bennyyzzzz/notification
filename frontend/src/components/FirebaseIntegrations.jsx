import { useEffect, useState } from "react";
import { api } from "../api/api";

export default function FirebaseIntegrations({
  selectedIntegrationId,
  setSelectedIntegrationId
}) {
  const [integrations, setIntegrations] = useState([]);
  const [integrationName, setIntegrationName] = useState("");
  const [jsonPreview, setJsonPreview] = useState(null);

  async function loadIntegrations() {
    const response = await api.get("/firebase-integrations");
    setIntegrations(response.data);

    if (!selectedIntegrationId && response.data.length > 0) {
      setSelectedIntegrationId(response.data[0].id);
    }
  }

  useEffect(() => {
    loadIntegrations();
  }, []);

  async function handleJsonUpload(event) {
    const file = event.target.files[0];

    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      if (json.type !== "service_account") {
        alert("O arquivo não parece ser uma Service Account válida.");
        return;
      }

      if (!json.project_id || !json.client_email || !json.private_key) {
        alert("JSON inválido. Faltam project_id, client_email ou private_key.");
        return;
      }

      setJsonPreview({
        projectId: json.project_id,
        clientEmail: json.client_email,
        privateKey: json.private_key
      });

      if (!integrationName) {
        setIntegrationName(json.project_id);
      }

      event.target.value = "";
    } catch (error) {
      alert("Erro ao ler JSON. Verifique se o arquivo está correto.");
      console.log(error);
    }
  }

    async function handleSaveIntegration() {
    try {
        if (!jsonPreview) {
        alert("Selecione um JSON Firebase antes de salvar.");
        return;
        }

        if (!integrationName.trim()) {
        alert("Informe um nome para a integração.");
        return;
        }

        const response = await api.post("/firebase-integrations", {
        appId: 1,
        name: integrationName,
        projectId: jsonPreview.projectId,
        clientEmail: jsonPreview.clientEmail,
        privateKey: jsonPreview.privateKey
        });

        setIntegrations((prev) => [response.data, ...prev]);
        setSelectedIntegrationId(String(response.data.id));

        setIntegrationName("");
        setJsonPreview(null);

        alert("Integração salva com sucesso!");
    } catch (error) {
        console.log("Erro ao salvar integração:", error.response?.data || error);

        alert(
        error.response?.data?.details ||
        error.response?.data?.error ||
        "Erro ao salvar integração Firebase."
        );
    }
    }

  async function handleRemove(id) {
    await api.delete(`/firebase-integrations/${id}`);

    setIntegrations((prev) => prev.filter((item) => item.id !== id));

    if (Number(selectedIntegrationId) === Number(id)) {
      setSelectedIntegrationId("");
    }
  }

  return (
    <section className="card">
      <h2>Integrações Firebase</h2>

      <p className="muted">
        Faça upload do JSON da Service Account. A chave privada será enviada ao backend e salva criptografada.
      </p>

      <div className="upload-box">
        <label className="upload-label">
          Selecionar JSON Firebase
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleJsonUpload}
          />
        </label>
      </div>

      {jsonPreview && (
        <div className="json-preview">
          <h3>Integração detectada</h3>

          <input
            placeholder="Nome da integração"
            value={integrationName}
            onChange={(event) => setIntegrationName(event.target.value)}
          />

          <p>
            <strong>Project ID:</strong> {jsonPreview.projectId}
          </p>

          <p>
            <strong>Client Email:</strong> {jsonPreview.clientEmail}
          </p>

          <p className="success-text">
            Private Key identificada com sucesso.
          </p>

          <button onClick={handleSaveIntegration}>
            Salvar integração
          </button>
        </div>
      )}

      <hr className="divider" />

      <label>Integração ativa para envio</label>

      <select
        value={selectedIntegrationId}
        onChange={(event) => setSelectedIntegrationId(event.target.value)}
      >
        <option value="">Selecione uma integração</option>

        {integrations.map((integration) => (
          <option key={integration.id} value={integration.id}>
            {integration.name} — {integration.projectId}
          </option>
        ))}
      </select>

      <div className="integration-list">
        {integrations.map((integration) => (
          <div className="integration-item" key={integration.id}>
            <div>
              <strong>{integration.name}</strong>
              <p>{integration.projectId}</p>
              <small>{integration.clientEmail}</small>
            </div>

            <button
              className="danger"
              onClick={() => handleRemove(integration.id)}
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}