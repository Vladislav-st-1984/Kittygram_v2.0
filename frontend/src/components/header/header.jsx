import React from "react";
import { useLocation, useHistory, NavLink } from "react-router-dom";

import { UserContext } from "../../utils/context";
import { logoutUser } from "../../utils/api";

import loginIcon from "../../images/login.svg";
import plusIcon from "../../images/plus.svg";
import logoutIcon from "../../images/logout.svg";
import logo from "../../images/logo.svg";

import { ButtonHeader } from "../ui/button-header/button-header";
import { ButtonSecondary } from "../ui/button-secondary/button-secondary";

import styles from "./header.module.css";

export const Header = ({ setQueryPage, extraClass = "" }) => {
  const [user, setUser] = React.useContext(UserContext);

  const location = useLocation();
  const history = useHistory();

  const handleLogout = () => {
    // Clear local state immediately so the UI reacts instantly even if the
    // backend request is slow or fails (e.g. expired token → 401 from logout).
    const finishLogout = () => {
      localStorage.removeItem("auth_token");
      setUser({ id: "" });
      setQueryPage(1);
      history.push("/signin");
    };
    logoutUser().then(finishLogout).catch(finishLogout);
  };

  const onMainPage = () => {
    setQueryPage(1);
  };

  const headerClassList = `${styles.header} ${
    (location.pathname === "/signin" || location.pathname === "/signup") &&
    styles.hidden
  } ${extraClass}`;

  return (
    <header className={headerClassList}>
      <NavLink className={styles.nav} to="/" onClick={onMainPage}>
        <img className={styles.logo} src={logo} alt="Логотип." />
      </NavLink>

      <nav className={styles.mainNav}>
        <NavLink
          to="/"
          exact
          className={styles.navLink}
          activeClassName={styles.navLinkActive}
          onClick={onMainPage}
        >
          Мои коты
        </NavLink>
        <NavLink
          to="/lost-cats"
          className={styles.navLink}
          activeClassName={styles.navLinkActive}
        >
          Потеряшки
        </NavLink>
        {user && user.is_staff && (
          <a
            href="/api/docs/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.navLink}
            title="API documentation (staff only)"
          >
            API
          </a>
        )}
      </nav>

      {!user.id ? (
        <ButtonHeader to="/signin" text="Войти" icon={loginIcon} />
      ) : (
        <div className={styles.btns_box}>
          <ButtonHeader
            to="/cats/add"
            text="Добавить кота"
            icon={plusIcon}
            isLogin={true}
          />
          <ButtonSecondary icon={logoutIcon} onClick={handleLogout} />
        </div>
      )}
    </header>
  );
};
