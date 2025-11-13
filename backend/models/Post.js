const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  cover_image_url: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "published",
  },
  looking_for_teammates: {
    type: Boolean,
    default: false,
  },
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
    },
  ],
  likes_count: {
    type: Number,
    default: 0,
  },
  comments_count: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
postSchema.index({ author_id: 1, created_at: -1 });
postSchema.index({ status: 1, created_at: -1 });

module.exports = mongoose.model("Post", postSchema);
