import React from "react";
import { useHistory } from "react-router-dom";

import { getCards, createLostCat } from "../../utils/api";

import styles from "./add-lost-cat-page.module.css";

export const AddLostCatPage = () => {
  const history = useHistory();
  const [myCats, setMyCats] = React.useState([]);
  const [form, setForm] = React.useState({
    cat: "",
    description: "",
    last_seen_location: "",
    date_lost: "",
  });
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    getCards(1)
      .then((res) => setMyCats(res.results || []))
      .catch(() => setMyCats([]));
  }, []);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    const payload = { ...form, cat: Number(form.cat) };
    createLostCat(payload)
      .then((res) => {
        if (res && res.id) history.push(`/lost-cats/${res.id}`);
      })
      .catch((err) => setErrors(err || {}))
      .finally(() => setSubmitting(false));
  };

  const fieldError = (name) => {
    const e = errors[name];
    if (!e) return null;
    return Array.isArray(e) ? e[0] : String(e);
  };

  return (
    <section className={styles.content}>
      <h2 className="text text_type_h2 text_color_primary mb-6">
        Сообщить о пропаже кота
      </h2>

      {myCats.length === 0 && (
        <div className={styles.notice}>
          У вас пока нет добавленных котов. Сначала{" "}
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => history.push("/cats/add")}
          >
            добавьте кота
          </button>
          , а затем создайте отчёт.
        </div>
      )}

      <form onSubmit={onSubmit} className={styles.form}>
        <label className={styles.field}>
          <span className={styles.label}>Кот *</span>
          <select
            name="cat"
            value={form.cat}
            onChange={onChange}
            required
            className={styles.input}
          >
            <option value="">— выберите —</option>
            {myCats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.color}, {c.birth_year})
              </option>
            ))}
          </select>
          {fieldError("cat") && (
            <span className={styles.error}>{fieldError("cat")}</span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Где видели последний раз *</span>
          <input
            name="last_seen_location"
            value={form.last_seen_location}
            onChange={onChange}
            required
            maxLength={255}
            placeholder="Например: парк им. Горького, у фонтана"
            className={styles.input}
          />
          {fieldError("last_seen_location") && (
            <span className={styles.error}>
              {fieldError("last_seen_location")}
            </span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Дата пропажи *</span>
          <input
            type="date"
            name="date_lost"
            value={form.date_lost}
            onChange={onChange}
            required
            className={styles.input}
          />
          {fieldError("date_lost") && (
            <span className={styles.error}>{fieldError("date_lost")}</span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            Описание * <small>(минимум 20 символов)</small>
          </span>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            required
            minLength={20}
            rows={5}
            placeholder="Опишите обстоятельства пропажи, особые приметы, реакцию на кличку и т.д."
            className={styles.input}
          />
          {fieldError("description") && (
            <span className={styles.error}>{fieldError("description")}</span>
          )}
        </label>

        {errors.detail && (
          <p className={styles.error}>{errors.detail}</p>
        )}
        {errors.non_field_errors && (
          <p className={styles.error}>{errors.non_field_errors[0]}</p>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => history.goBack()}
            className={styles.btnSecondary}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={submitting || myCats.length === 0}
            className={styles.btnPrimary}
          >
            {submitting ? "Отправка..." : "Опубликовать"}
          </button>
        </div>
      </form>
    </section>
  );
};
