import api from "../../api/Api";

export const createAnnouncement = (payload) =>
  api.post("/superadmin/communication/announce", payload);

export const sendEmailCampaign = (payload) =>
  api.post("/superadmin/communication/email", payload);

export const sendSMSBlast = (payload) =>
  api.post("/superadmin/communication/sms", payload);

export const sendPushNotification = (payload) =>
  api.post("/superadmin/communication/push", payload);

export const broadcast = (payload) =>
  api.post("/superadmin/communication/broadcast", payload);