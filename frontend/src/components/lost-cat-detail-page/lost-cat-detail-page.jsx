import React from "react";
import { useParams, useHistory, Link } from "react-router-dom";

import {
  getLostCat,
  resolveLostCat,
  deleteLostCat,
  getSightings,
  createSighting,
  deleteSighting,
} from "../../utils/api";
import { UserContext } from "../../utils/context";

import styles from "./lost-cat-detail-page.module.css";

export const LostCatDetailPage = () => {
  const { id } = useParams();
  const history = useHistory();
  const [user] = React.useContext(UserContext);

  const [report, setReport] = React.useState(null);
  const [sightings, setSightings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [newSighting, setNewSighting] = React.useState({
    message: "",
    sighting_location: "",
  });
  const [sightingErrors, setSightingErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  const refresh = React.useCallback(() => {
    setLoading(true);
    Promise.all([getLostCat(id), getSightings(id)])
      .then(([reportRes, sightingsRes]) => {
        setReport(reportRes);
        setSightings(sightingsRes.results || sightingsRes);
        setError("");
      })
      .catch((err) => {
        if (err && err.detail) setError(err.detail);
        else setError("Не удалось загрузить отчёт.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const isOwner =
    user && user.username && report && report.reported_by === user.username;

  const handleResolve = () => {
    resolveLostCat(id)
      .then(() => refresh())
      .catch((err) => alert(err.detail || "Ошибка при отметке как найденный"));
  };

  const handleDelete = () => {
    if (!window.confirm("Удалить этот отчёт?")) return;
    deleteLostCat(id).then((res) => {
      if (res.status) history.push("/lost-cats");
    });
  };

  const handleSightingChange = (e) => {
    setNewSighting({ ...newSighting, [e.target.name]: e.target.value });
  };

  const handleSightingSubmit = (e) => {
    e.preventDefault();
    setSightingErrors({});
    setSubmitting(true);
    createSighting(id, newSighting)
      .then(() => {
        setNewSighting({ message: "", sighting_location: "" });
        return refresh();
      })
      .catch((err) => setSightingErrors(err || {}))
      .finally(() => setSubmitting(false));
  };

  const handleSightingDelete = (sId) => {
    if (!window.confirm("Удалить эту заметку?")) return;
    deleteSighting(id, sId).then((res) => {
      if (res.status) refresh();
    });
  };

  if (loading) {
    return (
      <section className={styles.content}>
        <p className="text text_type_medium text_color_secondary">Загрузка...</p>
      </section>
    );
  }

  if (error || !report) {
    return (
      <section className={styles.content}>
        <p className="text text_type_medium text_color_red">{error}</p>
        <Link to="/lost-cats" className={styles.backLink}>
          ← Ко всем отчётам
        </Link>
      </section>
    );
  }

  return (
    <section className={styles.content}>
      <Link to="/lost-cats" className={styles.backLink}>
        ← Ко всем отчётам
      </Link>

      <header className={styles.head}>
        <div>
          <h2 className="text text_type_h2 text_color_primary">
            {report.cat_detail?.name || "—"}
          </h2>
          <p className="text text_type_medium text_color_secondary mt-2">
            Автор отчёта: {report.reported_by} · Создан {new Date(report.created_at).toLocaleString()}
          </p>
        </div>
        <span
          className={`${styles.badge} ${
            report.is_resolved ? styles.badgeResolved : styles.badgeActive
          }`}
        >
          {report.is_resolved ? "Найден" : "В розыске"}
        </span>
      </header>

      <dl className={styles.facts}>
        <div>
          <dt>Где видели последний раз</dt>
          <dd>{report.last_seen_location}</dd>
        </div>
        <div>
          <dt>Дата пропажи</dt>
          <dd>{report.date_lost}</dd>
        </div>
        <div>
          <dt>Цвет / год рождения</dt>
          <dd>
            {report.cat_detail?.color || "—"} ·{" "}
            {report.cat_detail?.birth_year || "—"}
          </dd>
        </div>
      </dl>

      <h3 className="text text_type_h3 text_color_primary mt-6 mb-3">
        Описание
      </h3>
      <p className={`text text_type_medium text_color_primary ${styles.desc}`}>
        {report.description}
      </p>

      {isOwner && (
        <div className={styles.ownerActions}>
          {!report.is_resolved && (
            <button onClick={handleResolve} className={styles.btnPrimary}>
              Отметить как найденного
            </button>
          )}
          <button onClick={handleDelete} className={styles.btnDanger}>
            Удалить отчёт
          </button>
        </div>
      )}

      <hr className={styles.divider} />

      <h3 className="text text_type_h3 text_color_primary mb-3">
        Заметки и наблюдения ({sightings.length})
      </h3>

      <ul className={styles.sightings}>
        {sightings.length === 0 && (
          <li className="text text_type_medium text_color_secondary">
            Пока никто не видел этого котика. Будьте первым!
          </li>
        )}
        {sightings.map((s) => (
          <li key={s.id} className={styles.sighting}>
            <div className={styles.sightingHead}>
              <b>{s.author}</b>
              <span className="text text_type_small text_color_additional">
                {new Date(s.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text text_type_medium text_color_primary mt-2">
              {s.message}
            </p>
            {s.sighting_location && (
              <p className="text text_type_small text_color_secondary mt-1">
                📍 {s.sighting_location}
              </p>
            )}
            {user &&
              user.username &&
              (user.username === s.author || user.is_staff) && (
                <button
                  onClick={() => handleSightingDelete(s.id)}
                  className={styles.deleteSightingBtn}
                >
                  Удалить
                </button>
              )}
          </li>
        ))}
      </ul>

      {user && user.id ? (
        <form onSubmit={handleSightingSubmit} className={styles.sightingForm}>
          <h4 className="text text_type_h3 text_color_primary mb-2">
            Добавить заметку
          </h4>
          <textarea
            name="message"
            value={newSighting.message}
            onChange={handleSightingChange}
            placeholder="Расскажите, где вы видели этого котика (минимум 10 символов)..."
            className={styles.textarea}
            rows={3}
            required
          />
          {sightingErrors.message && (
            <p className="text text_type_small text_color_red mt-1">
              {Array.isArray(sightingErrors.message)
                ? sightingErrors.message[0]
                : sightingErrors.message}
            </p>
          )}
          <input
            name="sighting_location"
            value={newSighting.sighting_location}
            onChange={handleSightingChange}
            placeholder="Место (необязательно)"
            className={styles.input}
          />
          <button
            type="submit"
            disabled={submitting}
            className={styles.btnPrimary}
          >
            {submitting ? "Отправка..." : "Опубликовать"}
          </button>
        </form>
      ) : (
        <p className="text text_type_medium text_color_secondary mt-4">
          <Link to="/signin" className={styles.link}>
            Войдите
          </Link>
          , чтобы оставлять заметки и наблюдения.
        </p>
      )}
    </section>
  );
};
