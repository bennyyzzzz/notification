function countWords(text) {
  return String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export default function EditNotification({
  notification,
  setNotification,
  onAddToQueue
}) {
  if (!notification) {
    return null;
  }

  const titleWords = countWords(notification.title);
  const bodyWords = countWords(notification.body);

  const isValid = titleWords <= 5 && bodyWords <= 10;

  function handleTitleChange(event) {
    setNotification({
      ...notification,
      title: event.target.value
    });
  }

  function handleBodyChange(event) {
    setNotification({
      ...notification,
      body: event.target.value
    });
  }

  return (
    <section className="card">
      <h2>3. Editar notificação escolhida</h2>

      <label>Título</label>
      <input
        value={notification.title || ""}
        onChange={handleTitleChange}
      />

      <p className={titleWords > 5 ? "error" : "muted"}>
        {titleWords}/5 palavras
      </p>

      <label>Corpo</label>
      <textarea
        value={notification.body || ""}
        onChange={handleBodyChange}
      />

      <p className={bodyWords > 10 ? "error" : "muted"}>
        {bodyWords}/10 palavras
      </p>

      <button
        disabled={!isValid}
        onClick={() => onAddToQueue(notification)}
      >
        Adicionar à fila
      </button>
    </section>
  );
}