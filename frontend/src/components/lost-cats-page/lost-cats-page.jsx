import React from "react";
import { Link } from "react-router-dom";

import { getLostCats } from "../../utils/api";

import styles from "./lost-cats-page.module.css";

export const LostCatsPage = () => {
  const [reports, setReports] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState(""); // "", "true", "false"
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const fetchReports = React.useCallback(() => {
    setLoading(true);
    setError("");
    getLostCats({ page, search, isResolved: statusFilter })
      .then((res) => {
        setReports(res.results || []);
        setTotalPages(Math.max(1, Math.ceil((res.count || 0) / 10)));
      })
      .catch(() => setError("Не удалось загрузить отчёты."))
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <section className={styles.content}>
      <header className={styles.head}>
        <h2 className="text text_type_h2 text_color_primary">
          Потерянные коты
        </h2>
        <Link to="/lost-cats/add" className={styles.cta}>
          + Сообщить о пропаже
        </Link>
      </header>

      <div className={styles.filters}>
        <input
          type="search"
          placeholder="Поиск по описанию или местоположению..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className={styles.search}
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className={styles.select}
        >
          <option value="">Все отчёты</option>
          <option value="false">Активные</option>
          <option value="true">Найденные</option>
        </select>
      </div>

      {loading && (
        <p className="text text_type_medium text_color_secondary mt-10">
          Загрузка...
        </p>
      )}
      {error && (
        <p className="text text_type_medium text_color_red mt-10">{error}</p>
      )}
      {!loading && !error && reports.length === 0 && (
        <p className="text text_type_medium text_color_secondary mt-10">
          Пока нет ни одного отчёта.
        </p>
      )}

      <ul className={styles.list}>
        {reports.map((r) => (
          <li key={r.id} className={styles.item}>
            <Link to={`/lost-cats/${r.id}`} className={styles.itemLink}>
              <div className={styles.itemHead}>
                <h3 className="text text_type_h3 text_color_primary">
                  {r.cat_name}
                </h3>
                <span
                  className={`${styles.badge} ${
                    r.is_resolved ? styles.badgeResolved : styles.badgeActive
                  }`}
                >
                  {r.is_resolved ? "Найден" : "В розыске"}
                </span>
              </div>
              <p className="text text_type_medium text_color_secondary mt-3">
                Последний раз видели: <b>{r.last_seen_location}</b>
              </p>
              <p className="text text_type_small text_color_additional mt-2">
                Пропал: {r.date_lost} · автор: {r.reported_by}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={styles.pageBtn}
          >
            ‹ Назад
          </button>
          <span className="text text_type_medium text_color_secondary">
            Страница {page} из {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={styles.pageBtn}
          >
            Вперёд ›
          </button>
        </div>
      )}
    </section>
  );
};
