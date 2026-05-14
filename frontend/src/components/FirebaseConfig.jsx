export default function FirebaseConfig({ firebaseConfig, setFirebaseConfig }) {
  function handleChange(event) {
    const { name, value } = event.target;

    setFirebaseConfig((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  return (
    <section className="card">
      <h2>Configuração Firebase</h2>

      <p className="muted">
        Preencha os dados da service account do Firebase.
      </p>

      <input
        name="projectId"
        placeholder="Project ID"
        value={firebaseConfig.projectId}
        onChange={handleChange}
      />

      <input
        name="clientEmail"
        placeholder="Client Email"
        value={firebaseConfig.clientEmail}
        onChange={handleChange}
      />

      <textarea
        name="privateKey"
        placeholder="Private Key"
        value={firebaseConfig.privateKey}
        onChange={handleChange}
      />
    </section>
  );
}