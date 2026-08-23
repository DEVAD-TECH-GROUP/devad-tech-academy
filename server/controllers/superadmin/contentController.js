import BlogPost from "../../models/content/BlogPost.js";
import Banner from "../../models/content/Banner.js";
import FAQ from "../../models/content/FAQ.js";
import Testimonial from "../../models/content/Testimonial.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

// ── Blog ──────────────────────────────────────────────────
export const getBlogPosts = asyncHandler(async (req, res) => {
  const result = await paginate(BlogPost, {}, {
    page: req.query.page,
    limit: req.query.limit,
    sort: { createdAt: -1 },
  });
  sendResponse(res, 200, "Blog posts retrieved", result);
});

export const createBlogPost = asyncHandler(async (req, res) => {
  const post = await BlogPost.create({
    ...req.body,
    author: req.user._id,
    publishedAt: req.body.status === "published" ? new Date() : null,
  });
  sendResponse(res, 201, "Blog post created", post);
});

export const updateBlogPost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!post) return sendResponse(res, 404, "Blog post not found");
  sendResponse(res, 200, "Blog post updated", post);
});

export const deleteBlogPost = asyncHandler(async (req, res) => {
  await BlogPost.findByIdAndDelete(req.params.id);
  sendResponse(res, 200, "Blog post deleted");
});

// ── Banners ───────────────────────────────────────────────
export const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
  sendResponse(res, 200, "Banners retrieved", banners);
});

export const createBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.create({
    ...req.body,
    createdBy: req.user._id,
  });
  sendResponse(res, 201, "Banner created", banner);
});

export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!banner) return sendResponse(res, 404, "Banner not found");
  sendResponse(res, 200, "Banner updated", banner);
});

// ── FAQs ──────────────────────────────────────────────────
export const getFAQs = asyncHandler(async (req, res) => {
  const faqs = await FAQ.find({ isActive: true }).sort({ order: 1 });
  sendResponse(res, 200, "FAQs retrieved", faqs);
});

export const createFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.create({ ...req.body, createdBy: req.user._id });
  sendResponse(res, 201, "FAQ created", faq);
});

export const updateFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!faq) return sendResponse(res, 404, "FAQ not found");
  sendResponse(res, 200, "FAQ updated", faq);
});

export const deleteFAQ = asyncHandler(async (req, res) => {
  await FAQ.findByIdAndDelete(req.params.id);
  sendResponse(res, 200, "FAQ deleted");
});

// ── Testimonials ──────────────────────────────────────────
export const getTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ isActive: true });
  sendResponse(res, 200, "Testimonials retrieved", testimonials);
});

export const createTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.create({
    ...req.body,
    createdBy: req.user._id,
  });
  sendResponse(res, 201, "Testimonial created", testimonial);
});