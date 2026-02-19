const BASE_URL = import.meta.env.VITE_API_URL;

export const checkHealth = async () => {
  const res = await fetch(`${BASE_URL}/health`);
  return res.json();
};

export const createUser = async (data) => {
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};
