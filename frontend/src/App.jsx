import { useEffect, useState } from "react";
import { api } from "./api/api";
import FirebaseConfig from "./components/FirebaseConfig";

import CampaignForm from "./components/CampaignForm";
import GeneratedOptions from "./components/GeneratedOptions";
import EditNotification from "./components/EditNotification";
import QueueCheckout from "./components/QueueCheckout";

export default function App() {
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
    sendDate: "",
    sendTime: "",
    audienceType: "token",
    audienceValue: "",
    tone: "direto"
  });
  const [firebaseConfig, setFirebaseConfig] = useState(() => {
  const saved = localStorage.getItem("firebaseConfig");

    return saved
      ? JSON.parse(saved)
      : {
          projectId: "",
          clientEmail: "",
          privateKey: ""
        };
  });

  const [errors, setErrors] = useState({});
  const [options, setOptions] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [queue, setQueue] = useState(() => {
    const savedQueue = localStorage.getItem("pushQueue");
    return savedQueue ? JSON.parse(savedQueue) : [];
  });
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: ""
  });

  useEffect(() => {
    localStorage.setItem("pushQueue", JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
    localStorage.setItem("firebaseConfig", JSON.stringify(firebaseConfig));
  }, [firebaseConfig]);

  function validateCampaign() {
    const newErrors = {};

    if (!campaign.name.trim()) newErrors.name = true;
    if (!campaign.theme.trim()) newErrors.theme = true;
    if (!campaign.segment.trim()) newErrors.segment = true;

    if (campaign.segment === "Outro" && !campaign.customSegment.trim()) {
      newErrors.customSegment = true;
    }

    if (!campaign.redirectUrl.trim()) newErrors.redirectUrl = true;
    if (!campaign.sendDate.trim()) newErrors.sendDate = true;
    if (!campaign.sendTime.trim()) newErrors.sendTime = true;
    if (!campaign.audienceValue.trim()) newErrors.audienceValue = true;

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

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleGenerateOptions() {
    const isValid = validateCampaign();

    if (!isValid) {
      showModal("Campos obrigatórios", "Preencha os campos destacados em vermelho antes de continuar.");
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
      showModal("Erro ao gerar opções com IA.");
      console.log(error);
    }
  }

  function handleChooseOption(option) {
    setSelectedNotification({
      ...option,
      redirectUrl: campaign.redirectUrl,
      audienceType: campaign.audienceType,
      audienceValue: campaign.audienceValue,
      sendDate: campaign.sendDate,
      sendTime: campaign.sendTime
    });
  }

  async function handleAddToQueue(notification) {
    try {
      const response = await api.post("/queue", notification);

      setQueue((prev) => [...prev, response.data]);
      setSelectedNotification(null);
    } catch (error) {
      showModal("Erro ao adicionar na fila.");
      console.log(error);
    }
  }

  async function handleRemoveFromQueue(id) {
    try {
      await api.delete(`/queue/${id}`);

      setQueue((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      showModal("Erro ao remover da fila.");
      console.log(error);
    }
  }

  async function handleDuplicateQueueItem(id) {
    try {
      const response = await api.post(`/queue/${id}/duplicate`);

      setQueue((prev) => [...prev, response.data]);
    } catch (error) {
      showModal("Erro ao duplicar item.");
      console.log(error);
    }
  }

  async function handleSendNotification(item) {
    try {
      const response = await api.post("/send-notification", {
        ...item,
        firebaseConfig
      });

      if (response.data.success) {
        showModal("Sucesso", "Notificação enviada com sucesso!");
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

  function showModal(title, message) {
    setModal({
      open: true,
      title,
      message
    });
  }

  return (
    <main className="container">
      <header className="hero">
        <h1>Gerador de Push Notification com IA</h1>
        <p>
          Crie campanhas, gere opções com IA, edite e envie notificações via Firebase.
        </p>
      </header>

      <FirebaseConfig
        firebaseConfig={firebaseConfig}
        setFirebaseConfig={setFirebaseConfig}
      />

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

      <QueueCheckout
        queue={queue}
        onRemove={handleRemoveFromQueue}
        onDuplicate={handleDuplicateQueueItem}
        onSend={handleSendNotification}
      />
    </main>
  );
}