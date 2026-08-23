import express from "express";
import {
  getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost,
  getBanners, createBanner, updateBanner,
  getFAQs, createFAQ, updateFAQ, deleteFAQ,
  getTestimonials, createTestimonial,
} from "../../controllers/superadmin/contentController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/blog", getBlogPosts);
router.post("/blog", createBlogPost);
router.put("/blog/:id", updateBlogPost);
router.delete("/blog/:id", deleteBlogPost);

router.get("/banners", getBanners);
router.post("/banners", createBanner);
router.put("/banners/:id", updateBanner);

router.get("/faqs", getFAQs);
router.post("/faqs", createFAQ);
router.put("/faqs/:id", updateFAQ);
router.delete("/faqs/:id", deleteFAQ);

router.get("/testimonials", getTestimonials);
router.post("/testimonials", createTestimonial);

export default router;