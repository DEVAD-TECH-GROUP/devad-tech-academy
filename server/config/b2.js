
import {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import env from "./env.js";

const validateB2Config = () => {
  const required = [
    ["B2_KEY_ID", env.B2_KEY_ID],
    ["B2_APPLICATION_KEY", env.B2_APPLICATION_KEY],
    ["B2_BUCKET_NAME", env.B2_BUCKET_NAME],
    ["B2_ENDPOINT", env.B2_ENDPOINT],
    ["B2_REGION", env.B2_REGION],
  ];

  for (const [name, value] of required) {
    if (!value) {
      throw new Error(`${name} is missing from the server environment`);
    }
  }
};

let client;

const getB2Client = () => {
  validateB2Config();

  if (!client) {
    client = new S3Client({
      region: env.B2_REGION,
      endpoint: env.B2_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.B2_KEY_ID,
        secretAccessKey: env.B2_APPLICATION_KEY,
      },
    });
  }

  return client;
};

export const createRecordingUrl = async (objectKey) => {
  if (!objectKey) {
    throw new Error("Recording object key is missing");
  }

  const command = new GetObjectCommand({
    Bucket: env.B2_BUCKET_NAME,
    Key: objectKey,
    ResponseContentType: "video/mp4",
    ResponseContentDisposition: "inline",
  });

  const ttl = Math.min(
    Math.max(Number(env.B2_SIGNED_URL_TTL) || 3600, 60),
    604800
  );

  return getSignedUrl(getB2Client(), command, {
    expiresIn: ttl,
  });
};

export const verifyRecordingObject = async (objectKey) => {
  if (!objectKey) return false;

  try {
    await getB2Client().send(
      new HeadObjectCommand({
        Bucket: env.B2_BUCKET_NAME,
        Key: objectKey,
      })
    );

    return true;
  } catch (error) {
    if (
      error?.$metadata?.httpStatusCode === 404 ||
      error?.name === "NotFound" ||
      error?.name === "NoSuchKey"
    ) {
      return false;
    }

    throw error;
  }
};
