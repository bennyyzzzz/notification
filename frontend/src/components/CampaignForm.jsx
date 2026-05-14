const segmentOptions = [
  "Moda feminina",
  "Moda masculina",
  "Moda infantil",
  "Calçados",
  "Beleza e cosméticos",
  "Móveis e decoração",
  "Alimentos",
  "Pet shop",
  "Eletrônicos",
  "Esportes",
  "Joias e acessórios",
  "Outro"
];

export default function CampaignForm({
  campaign,
  setCampaign,
  errors,
  setErrors,
  onGenerate
}) {
  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setCampaign((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: false
    }));
  }

  function inputClass(fieldName) {
    return errors[fieldName] ? "input-error" : "";
  }

  return (
    <section className="card">
      <h2>1. Criação da campanha</h2>

      <div className="grid">
        <div>
          <input
            className={inputClass("name")}
            name="name"
            placeholder="Nome da campanha *"
            value={campaign.name}
            onChange={handleChange}
          />
          {errors.name && <span className="field-error">Campo obrigatório</span>}
        </div>

        <div>
          <input
            className={inputClass("theme")}
            name="theme"
            placeholder="Tema: Black Friday, Dia das Mães... *"
            value={campaign.theme}
            onChange={handleChange}
          />
          {errors.theme && <span className="field-error">Campo obrigatório</span>}
        </div>

        <div>
          <select
            className={inputClass("segment")}
            name="segment"
            value={campaign.segment}
            onChange={handleChange}
          >
            <option value="">Selecione o segmento *</option>

            {segmentOptions.map((segment) => (
              <option key={segment} value={segment}>
                {segment}
              </option>
            ))}
          </select>
          {errors.segment && <span className="field-error">Campo obrigatório</span>}
        </div>

        {campaign.segment === "Outro" && (
          <div>
            <input
              className={inputClass("customSegment")}
              name="customSegment"
              placeholder="Digite o segmento *"
              value={campaign.customSegment}
              onChange={handleChange}
            />
            {errors.customSegment && (
              <span className="field-error">Campo obrigatório</span>
            )}
          </div>
        )}

        <select name="tone" value={campaign.tone} onChange={handleChange}>
          <option value="direto">Direto</option>
          <option value="elegante">Elegante</option>
          <option value="divertido">Divertido</option>
          <option value="urgente">Urgente</option>
          <option value="premium">Premium</option>
          <option value="jovem">Jovem</option>
        </select>
      </div>

      <label className="checkbox">
        <input
          type="checkbox"
          name="hasPromotion"
          checked={campaign.hasPromotion}
          onChange={handleChange}
        />
        Tem promoção?
      </label>

      {campaign.hasPromotion && (
        <div>
          <input
            className={inputClass("promotionDescription")}
            name="promotionDescription"
            placeholder="Descrição da promoção *"
            value={campaign.promotionDescription}
            onChange={handleChange}
          />
          {errors.promotionDescription && (
            <span className="field-error">Campo obrigatório</span>
          )}
        </div>
      )}

      <label className="checkbox">
        <input
          type="checkbox"
          name="hasCategory"
          checked={campaign.hasCategory}
          onChange={handleChange}
        />
        Tem categoria específica?
      </label>

      {campaign.hasCategory && (
        <div>
          <input
            className={inputClass("category")}
            name="category"
            placeholder="Categoria *"
            value={campaign.category}
            onChange={handleChange}
          />
          {errors.category && (
            <span className="field-error">Campo obrigatório</span>
          )}
        </div>
      )}

      <label className="checkbox">
        <input
          type="checkbox"
          name="hasProduct"
          checked={campaign.hasProduct}
          onChange={handleChange}
        />
        Tem produto específico?
      </label>

      {campaign.hasProduct && (
        <div>
          <input
            className={inputClass("product")}
            name="product"
            placeholder="Produto *"
            value={campaign.product}
            onChange={handleChange}
          />
          {errors.product && (
            <span className="field-error">Campo obrigatório</span>
          )}
        </div>
      )}

      <label className="checkbox">
        <input
          type="checkbox"
          name="hasCoupon"
          checked={campaign.hasCoupon}
          onChange={handleChange}
        />
        Tem cupom?
      </label>

      {campaign.hasCoupon && (
        <div className="grid">
          <div>
            <input
              className={inputClass("coupon")}
              name="coupon"
              placeholder="Cupom *"
              value={campaign.coupon}
              onChange={handleChange}
            />
            {errors.coupon && (
              <span className="field-error">Campo obrigatório</span>
            )}
          </div>

          <input
            name="discountPercentage"
            placeholder="Percentual de desconto"
            value={campaign.discountPercentage}
            onChange={handleChange}
          />
        </div>
      )}

      <div>
        <input
          className={inputClass("redirectUrl")}
          name="redirectUrl"
          placeholder="Link de redirecionamento *"
          value={campaign.redirectUrl}
          onChange={handleChange}
        />
        {errors.redirectUrl && (
          <span className="field-error">Campo obrigatório</span>
        )}
      </div>

      <div className="grid">
        <div>
          <input
            className={inputClass("sendDate")}
            type="date"
            name="sendDate"
            value={campaign.sendDate}
            onChange={handleChange}
          />
          {errors.sendDate && (
            <span className="field-error">Campo obrigatório</span>
          )}
        </div>

        <div>
          <input
            className={inputClass("sendTime")}
            type="time"
            name="sendTime"
            value={campaign.sendTime}
            onChange={handleChange}
          />
          {errors.sendTime && (
            <span className="field-error">Campo obrigatório</span>
          )}
        </div>
      </div>

      <div className="grid">
        <select
          name="audienceType"
          value={campaign.audienceType}
          onChange={handleChange}
        >
          <option value="token">Token único</option>
          <option value="topic">Tópico Firebase</option>
        </select>

        <div>
          <input
            className={inputClass("audienceValue")}
            name="audienceValue"
            placeholder="Token ou tópico *"
            value={campaign.audienceValue}
            onChange={handleChange}
          />
          {errors.audienceValue && (
            <span className="field-error">Campo obrigatório</span>
          )}
        </div>
      </div>

      <button onClick={onGenerate}>
        Gerar 5 opções com IA
      </button>
    </section>
  );
}