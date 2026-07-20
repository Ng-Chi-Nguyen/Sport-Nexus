export const createDetails = (req) =>
  Object.entries(req.body).map(([key, val]) => ({ field: key, to: val }));

export const updateDetails = (req) => {
  const old = req.__oldData;
  if (!old) return [];
  return Object.entries(req.body)
    .filter(([key, val]) => JSON.stringify(old[key]) !== JSON.stringify(val))
    .map(([key, val]) => ({
      field: key,
      from: old[key],
      to: val,
    }));
};

export const deleteDetails = (req) => {
  const old = req.__oldData;
  return old ? [{ field: null, from: old }] : [];
};

export const fetchEntity = (service, idParam = "id") => (req) => {
  const id = parseInt(req.params[idParam]);
  return id ? service(id) : null;
};
