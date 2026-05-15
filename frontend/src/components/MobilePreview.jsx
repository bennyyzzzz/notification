function limitText(text, limit = 50) {
  const value = String(text || "");

  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit)}...`;
}

export default function MobilePreview({ title, body, appName = "Auto Notify" }) {
  return (
    <div className="preview-wrapper">
      <div className="phone-preview">
        <div className="phone-status-bar">
          <span>9:41</span>
          <span>●●●</span>
        </div>

        <div className="phone-screen">
          <div className="push-preview">
            <div className="push-icon">🔔</div>

            <div className="push-content">
              <div className="push-app">{appName}</div>
              <strong>{limitText(title || "Título da notificação", 35)}</strong>
              <p>{limitText(body || "Corpo da notificação aparecerá aqui.", 50)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}