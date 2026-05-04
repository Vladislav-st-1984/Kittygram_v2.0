import { URL } from "./constants";

// ---------- shared helpers ----------

const checkResponse = (res) => {
  if (res.ok) {
    // 204 No Content: nothing to parse.
    if (res.status === 204) return null;
    return res.json();
  }
  return res.json().then((err) => Promise.reject(err));
};

const headersWithContentType = { "Content-Type": "application/json" };

const authHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return token
    ? {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      }
    : { "Content-Type": "application/json" };
};

// ---------- auth / users ----------

export const registerUser = (username, password) => {
  return fetch(`${URL}/api/users/`, {
    method: "POST",
    headers: headersWithContentType,
    body: JSON.stringify({ username, password }),
  }).then(checkResponse);
};

export const loginUser = (username, password) => {
  return fetch(`${URL}/api/token/login/`, {
    method: "POST",
    headers: headersWithContentType,
    body: JSON.stringify({ username, password }),
  })
    .then(checkResponse)
    .then((data) => {
      if (data && data.auth_token) {
        localStorage.setItem("auth_token", data.auth_token);
        return data;
      }
      return null;
    });
};

export const logoutUser = () => {
  return fetch(`${URL}/api/token/logout/`, {
    method: "POST",
    headers: authHeaders(),
  }).then((res) => {
    if (res.status === 204) {
      localStorage.removeItem("auth_token");
      return res;
    }
    return null;
  });
};

export const getUser = () => {
  return fetch(`${URL}/api/users/me/`, {
    method: "GET",
    headers: authHeaders(),
  }).then(checkResponse);
};

// ---------- cats ----------

export const getCards = (page = 1) => {
  return fetch(`${URL}/api/cats/?page=${page}`, {
    method: "GET",
    headers: authHeaders(),
  }).then(checkResponse);
};

export const getCard = (id) => {
  return fetch(`${URL}/api/cats/${id}/`, {
    method: "GET",
    headers: authHeaders(),
  }).then(checkResponse);
};

export const getAchievements = () => {
  return fetch(`${URL}/api/achievements/`, {
    method: "GET",
    headers: authHeaders(),
  }).then(checkResponse);
};

export const sendCard = (card) => {
  return fetch(`${URL}/api/cats/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(card),
  }).then(checkResponse);
};

export const updateCard = (card, id) => {
  return fetch(`${URL}/api/cats/${id}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(card),
  }).then(checkResponse);
};

export const deleteCard = (id) => {
  return fetch(`${URL}/api/cats/${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then((res) => {
    if (res.status === 204) {
      return { status: true };
    }
    return { status: false };
  });
};

// ---------- lost cats ----------

export const getLostCats = ({ page = 1, search = "", isResolved = "" } = {}) => {
  const params = new URLSearchParams({ page });
  if (search) params.set("search", search);
  if (isResolved !== "") params.set("is_resolved", isResolved);
  return fetch(`${URL}/api/lost-cats/?${params.toString()}`, {
    method: "GET",
    headers: authHeaders(),
  }).then(checkResponse);
};

export const getLostCat = (id) => {
  return fetch(`${URL}/api/lost-cats/${id}/`, {
    method: "GET",
    headers: authHeaders(),
  }).then(checkResponse);
};

export const createLostCat = (payload) => {
  return fetch(`${URL}/api/lost-cats/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }).then(checkResponse);
};

export const updateLostCat = (id, payload) => {
  return fetch(`${URL}/api/lost-cats/${id}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }).then(checkResponse);
};

export const deleteLostCat = (id) => {
  return fetch(`${URL}/api/lost-cats/${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then((res) => {
    if (res.status === 204) return { status: true };
    return { status: false };
  });
};

export const resolveLostCat = (id) => {
  return fetch(`${URL}/api/lost-cats/${id}/resolve/`, {
    method: "POST",
    headers: authHeaders(),
  }).then(checkResponse);
};

export const getSightings = (reportId) => {
  return fetch(`${URL}/api/lost-cats/${reportId}/sightings/`, {
    method: "GET",
    headers: authHeaders(),
  }).then(checkResponse);
};

export const createSighting = (reportId, payload) => {
  return fetch(`${URL}/api/lost-cats/${reportId}/sightings/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }).then(checkResponse);
};

export const deleteSighting = (reportId, sightingId) => {
  return fetch(`${URL}/api/lost-cats/${reportId}/sightings/${sightingId}/`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then((res) => {
    if (res.status === 204) return { status: true };
    return { status: false };
  });
};
