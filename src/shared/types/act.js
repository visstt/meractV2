export const ActType = {
  SINGLE: "SINGLE",
  MULTI: "MULTI",
};

export const ActFormat = {
  SINGLE: "SINGLE",
  SEVERAL: "SEVERAL",
};

export const SelectionMethods = {
  VOTING: "VOTING",
  BIDDING: "BIDDING",
  MANUAL: "MANUAL",
};

export const ActStatus = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
};

export const createActRequest = (data) => ({
  title: data.title,
  sequel: data.sequel || null,
  type: data.type,
  format: data.format,
  heroMethods: data.heroMethods,
  navigatorMethods: data.navigatorMethods,
  spotAgentMethods: data.spotAgentMethods || null,
  spotAgentCount: data.spotAgentCount || 0,
  biddingTime: data.biddingTime,
  photo: data.photo || null,
});

export const validateActData = (data) => {
  const errors = [];

  if (!data.title?.trim()) {
    errors.push("Title is required");
  }

  if (!Object.values(ActType).includes(data.type)) {
    errors.push("Invalid act type");
  }

  if (!Object.values(ActFormat).includes(data.format)) {
    errors.push("Invalid act format");
  }

  if (!Object.values(SelectionMethods).includes(data.heroMethods)) {
    errors.push("Invalid hero selection method");
  }

  if (!Object.values(SelectionMethods).includes(data.navigatorMethods)) {
    errors.push("Invalid navigator selection method");
  }

  if (
    data.spotAgentMethods &&
    !Object.values(SelectionMethods).includes(data.spotAgentMethods)
  ) {
    errors.push("Invalid spot agent selection method");
  }

  if (data.spotAgentCount < 0) {
    errors.push("Spot agent count cannot be negative");
  }

  if (!data.biddingTime) {
    errors.push("Bidding time is required");
  }

  return errors;
};
