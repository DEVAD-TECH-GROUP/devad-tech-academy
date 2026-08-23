import slugifyLib from "slugify";

const createSlug = (text) => {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });
};

export default createSlug;
