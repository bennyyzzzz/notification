import { useEffect, useState } from "react";
import { api } from "./api/api";

import CampaignForm from "./components/CampaignForm";
import GeneratedOptions from "./components/GeneratedOptions";
import EditNotification from "./components/EditNotification";
import QueueCheckout from "./components/QueueCheckout";
import FirebaseIntegrations from "./components/FirebaseIntegrations";
import HistoryPage from "./components/HistoryPage";

export default function App() {
  const [activePage, setActivePage] = useState("create");
  const [selectedIntegrationId, setSelectedIntegrationId] = useState("");

  const [campaign, setCampaign] = useState({
    name: "",
    theme: "",
    segment: "",
    customSegment: "",

    hasPromotion: false,
    promotionDescription: "",

    hasCategory: false,
    category: "",

    hasProduct: false,
    product: "",

    hasCoupon: false,
    coupon: "",
    discountPercentage: "",

    redirectUrl: "",

    sendMode: "now",
    scheduledAt: "",

    audienceType: "token",
    audienceValue: "",

    tone: "direto"
  });

  const [errors, setErrors] = useState({});
  const [options, setOptions] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [queue, setQueue] = useState([]);

  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: ""
  });

  useEffect(() => {
    loadQueue();
  }, []);

  function showModal(title, message) {
    setModal({
      open: true,
      title,
      message
    });
  }

  async function loadQueue() {
    try {
      const response = await api.get("/queue");
      setQueue(response.data);
    } catch (error) {
      console.log("Erro ao carregar fila:", error);
    }
  }

  function validateCampaign() {
    const newErrors = {};

    if (!campaign.name.trim()) newErrors.name = true;
    if (!campaign.theme.trim()) newErrors.theme = true;
    if (!campaign.segment.trim()) newErrors.segment = true;
    if (!campaign.redirectUrl.trim()) newErrors.redirectUrl = true;
    if (!campaign.audienceValue.trim()) newErrors.audienceValue = true;

    if (!selectedIntegrationId) {
      newErrors.firebaseIntegration = true;
    }

    if (campaign.segment === "Outro" && !campaign.customSegment.trim()) {
      newErrors.customSegment = true;
    }

    if (campaign.hasPromotion && !campaign.promotionDescription.trim()) {
      newErrors.promotionDescription = true;
    }

    if (campaign.hasCategory && !campaign.category.trim()) {
      newErrors.category = true;
    }

    if (campaign.hasProduct && !campaign.product.trim()) {
      newErrors.product = true;
    }

    if (campaign.hasCoupon && !campaign.coupon.trim()) {
      newErrors.coupon = true;
    }

    if (campaign.sendMode === "scheduled") {
      if (!campaign.scheduledAt.trim()) {
        newErrors.scheduledAt = true;
      } else {
        const scheduledDate = new Date(campaign.scheduledAt);
        const now = new Date();

        if (scheduledDate <= now) {
          newErrors.scheduledAt = true;

          showModal(
            "Agendamento inválido",
            "Escolha uma data e horário futuros para agendar a notificação."
          );
        }
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleGenerateOptions() {
    const isValid = validateCampaign();

    if (!isValid) {
      showModal(
        "Campos obrigatórios",
        "Preencha os campos destacados antes de continuar."
      );
      return;
    }

    try {
      const campaignToSend = {
        ...campaign,
        segment:
          campaign.segment === "Outro"
            ? campaign.customSegment
            : campaign.segment
      };

      const response = await api.post("/generate-push-options", campaignToSend);
      setOptions(response.data);
    } catch (error) {
      showModal("Erro", "Erro ao gerar opções com IA.");
      console.log(error);
    }
  }

  function handleChooseOption(option) {
    setSelectedNotification({
      ...option,
      campaignName: campaign.name,
      redirectUrl: campaign.redirectUrl,
      audienceType: campaign.audienceType,
      audienceValue: campaign.audienceValue,
      firebaseIntegrationId: selectedIntegrationId,
      sendMode: campaign.sendMode,
      scheduledAt:
        campaign.sendMode === "scheduled"
          ? new Date(campaign.scheduledAt).toISOString()
          : null,
      status: campaign.sendMode === "scheduled" ? "scheduled" : "queued"
    });
  }

  async function handleAddToQueue(notification) {
    try {
      const response = await api.post("/queue", notification);

      setQueue((prev) => [...prev, response.data]);
      setSelectedNotification(null);
      setActivePage("checkout");
    } catch (error) {
      showModal("Erro", "Erro ao adicionar na fila.");
      console.log(error);
    }
  }

  async function handleRemoveFromQueue(id) {
    try {
      await api.delete(`/queue/${id}`);

      setQueue((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      showModal("Erro", "Erro ao remover da fila.");
      console.log(error);
    }
  }

  async function handleDuplicateQueueItem(id) {
    try {
      const response = await api.post(`/queue/${id}/duplicate`);

      setQueue((prev) => [...prev, response.data]);
    } catch (error) {
      showModal("Erro", "Erro ao duplicar item.");
      console.log(error);
    }
  }

  async function handleSendNotification(item) {
    if (item.status === "scheduled") {
      showModal(
        "Notificação agendada",
        "Essa notificação já está programada. Ela será enviada automaticamente no horário definido."
      );
      return;
    }

    try {
      const response = await api.post("/send-notification", item);

      if (response.data.success) {
        setQueue((prev) =>
          prev.filter((queueItem) => queueItem.id !== item.id)
        );

        showModal(
          "Sucesso",
          "Notificação enviada com sucesso para o Firebase."
        );
      }
    } catch (error) {
      showModal(
        "Erro ao enviar",
        typeof error.response?.data?.error === "string"
          ? error.response.data.error
          : "Erro ao enviar notificação para o Firebase."
      );

      console.log(error);
    }
  }

  return (
    <main className="container">
      <header className="hero">
        <h1>Gerador Push Notification</h1>
      </header>

      <nav className="tabs">
        <button
          className={activePage === "history" ? "active-tab" : ""}
          onClick={() => setActivePage("history")}
        >
          Histórico
        </button>

        <button
          className={activePage === "create" ? "active-tab" : ""}
          onClick={() => setActivePage("create")}
        >
          Criação
        </button>

        <button
          className={activePage === "checkout" ? "active-tab" : ""}
          onClick={() => setActivePage("checkout")}
        >
          Checkout
        </button>
      </nav>

      {activePage === "history" && <HistoryPage />}

      {activePage === "create" && (
        <>
          <FirebaseIntegrations
            selectedIntegrationId={selectedIntegrationId}
            setSelectedIntegrationId={setSelectedIntegrationId}
          />

          {errors.firebaseIntegration && (
            <p className="field-error">
              Selecione uma integração Firebase antes de gerar.
            </p>
          )}

          <CampaignForm
            campaign={campaign}
            setCampaign={setCampaign}
            errors={errors}
            setErrors={setErrors}
            onGenerate={handleGenerateOptions}
          />

          <GeneratedOptions
            options={options}
            onChoose={handleChooseOption}
          />

          {selectedNotification && (
            <EditNotification
              notification={selectedNotification}
              setNotification={setSelectedNotification}
              onAddToQueue={handleAddToQueue}
            />
          )}
        </>
      )}

      {activePage === "checkout" && (
        <QueueCheckout
          queue={queue}
          onRemove={handleRemoveFromQueue}
          onDuplicate={handleDuplicateQueueItem}
          onSend={handleSendNotification}
        />
      )}

      {modal.open && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{modal.title}</h2>
            <p>{modal.message}</p>

            <button
              onClick={() =>
                setModal({
                  open: false,
                  title: "",
                  message: ""
                })
              }
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </main>
  );
}