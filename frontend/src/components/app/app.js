import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { UserContext } from "../../utils/context";
import { getUser } from "../../utils/api";

import { ProtectedRoute } from "../ui/protected-roure/protected-route";

import { Header } from "../header/header";
import { Footer } from "../footer/footer";
import { SignUp } from "../sign-up/sign-up";
import { SignIn } from "../sign-in/sign-in";
import { MainPage } from "../main-page/main-page";
import { CardPage } from "../card-page/card-page";
import { AddCardPage } from "../add-card-page/add-card-page";
import { EditCardPage } from "../edit-card-page/edit-card-page";
import { LostCatsPage } from "../lost-cats-page/lost-cats-page";
import { LostCatDetailPage } from "../lost-cat-detail-page/lost-cat-detail-page";
import { AddLostCatPage } from "../add-lost-cat-page/add-lost-cat-page";

import styles from "./app.module.css";

function App() {
  const [userState, setUserState] = React.useState({});
  const [currentCard, setCurrentCard] = React.useState({});
  const [queryPage, setQueryPage] = React.useState(1);

  React.useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      getUser()
        .then((res) => {
          if (res && res.id) {
            setUserState({
              id: res.id,
              username: res.username,
              is_staff: !!res.is_staff,
            });
          }
        })
        .catch(() => {
          // Stale token (e.g. user deleted on backend) — clear it.
          localStorage.removeItem("auth_token");
        });
    }
  }, []);

  return (
    <div className={styles.app}>
      <UserContext.Provider value={[userState, setUserState]}>
        <BrowserRouter>
          <Header setQueryPage={setQueryPage} />
          <main className={styles.content}>
            <Switch>
              <ProtectedRoute exact path="/">
                <MainPage queryPage={queryPage} setQueryPage={setQueryPage} />
              </ProtectedRoute>
              <Route path="/signin">
                <SignIn />
              </Route>
              <Route path="/signup">
                <SignUp />
              </Route>
              <ProtectedRoute path="/cats/add">
                <AddCardPage />
              </ProtectedRoute>
              <ProtectedRoute path="/cats/edit">
                <EditCardPage data={currentCard} setData={setCurrentCard} />
              </ProtectedRoute>
              <ProtectedRoute path="/cats/:id">
                <CardPage data={currentCard} setData={setCurrentCard} />
              </ProtectedRoute>

              {/* Lost Cats — list and detail are public, create is gated. */}
              <Route exact path="/lost-cats">
                <LostCatsPage />
              </Route>
              <ProtectedRoute path="/lost-cats/add">
                <AddLostCatPage />
              </ProtectedRoute>
              <Route path="/lost-cats/:id">
                <LostCatDetailPage />
              </Route>
            </Switch>
          </main>
          <Footer />
        </BrowserRouter>
      </UserContext.Provider>
    </div>
  );
}

export default App;
