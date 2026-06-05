"use client";

import { useState, useRef, useEffect } from "react";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  User,
  Camera,
  Video,
  HelpCircle,
  ChevronDown,
  Plus,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";
import { useReviewVotesStore } from "@/store/review-votes-store";
import { toast } from "sonner";

interface Review {
  id: number;
  name: string;
  date: string;
  rating: number;
  comment: string;
  likes: number;
  verified: boolean;
  hasImage?: boolean;
  hasVideo?: boolean;
  imageUrl?: string;
}

interface QAItem {
  id: number;
  question: string;
  answer: string;
  askedBy: string;
  answeredBy: string;
  date: string;
  likes: number;
}

const mockReviewsWithMedia: Review[] = [
  {
    id: 1,
    name: "Priya Sharma",
    date: "2 days ago",
    rating: 5,
    comment: "Absolutely fresh! The quality exceeded my expectations. Here's a photo of the product I received — looks exactly like the listing.",
    likes: 12,
    verified: true,
    hasImage: true,
    imageUrl: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&q=80",
  },
  {
    id: 2,
    name: "Amit Patel",
    date: "1 week ago",
    rating: 4,
    comment: "Great product for the price. Delivery was super fast as always. Highly recommend for daily use.",
    likes: 8,
    verified: true,
  },
  {
    id: 3,
    name: "Sneha Reddy",
    date: "2 weeks ago",
    rating: 5,
    comment: "Love the quality! FMCG Commerce never disappoints. Made a quick video unboxing — check it out!",
    likes: 15,
    verified: true,
    hasVideo: true,
  },
  {
    id: 4,
    name: "Rahul Verma",
    date: "3 weeks ago",
    rating: 4,
    comment: "Good quality and timely delivery. Would appreciate better packaging though.",
    likes: 6,
    verified: false,
  },
  {
    id: 5,
    name: "Neha Gupta",
    date: "1 month ago",
    rating: 5,
    comment: "Perfect! I've been ordering this regularly and the quality is always consistent.",
    likes: 10,
    verified: true,
    hasImage: true,
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
  },
];

const mockQA: QAItem[] = [
  {
    id: 1,
    question: "Is this product 100% organic?",
    answer: "Yes, this product is certified organic by FSSAI. You can check the organic logo on the packaging.",
    askedBy: "Ravi K.",
    answeredBy: "FMCG Team",
    date: "1 week ago",
    likes: 5,
  },
  {
    id: 2,
    question: "What's the shelf life after opening?",
    answer: "We recommend consuming within 30 days of opening for best freshness. Store in a cool, dry place.",
    askedBy: "Anita S.",
    answeredBy: "FMCG Team",
    date: "2 weeks ago",
    likes: 3,
  },
  {
    id: 3,
    question: "Can I get this in bulk packaging?",
    answer: "Currently this variant is available in the shown pack size. Check similar products for bulk options.",
    askedBy: "Vikram M.",
    answeredBy: "FMCG Team",
    date: "3 weeks ago",
    likes: 7,
  },
];

interface ReviewsQAProps {
  productRating?: number;
}

export default function ReviewsQA({ productRating = 4.5 }: ReviewsQAProps) {
  const [activeTab, setActiveTab] = useState<"reviews" | "qa">("reviews");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllQA, setShowAllQA] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; name: string; preview?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Dynamic states
  const [reviews, setReviews] = useState<Review[]>(mockReviewsWithMedia);
  const [qaList, setQaList] = useState<QAItem[]>(mockQA);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  // Fix zustand reactivity and hydration mismatch by grabbing votes array
  const votes = useReviewVotesStore((state) => state.votes) || [];
  const addVote = useReviewVotesStore((state) => state.addVote);
  const removeVote = useReviewVotesStore((state) => state.removeVote);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  function hasVoted(key: string) {
    return isClient ? votes.some((v) => v.key === key) : false;
  }

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const displayedQA = showAllQA ? qaList : qaList.slice(0, 2);

  const handleAskQuestion = () => {
    if (!newQuestion.trim()) return;
    const newQ: QAItem = {
      id: Date.now(),
      question: newQuestion,
      answer: "Pending response...",
      askedBy: "You",
      answeredBy: "Pending",
      date: "Just now",
      likes: 0,
    };
    setQaList([newQ, ...qaList]);
    setNewQuestion("");
    toast.success("Question submitted successfully!");
  };

  return (
    <section className="rounded-3xl border border-[#e8e8e8] bg-white p-5 sm:p-6 shadow-sm">
      {/* Media Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedMedia(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-[#ff4f8b] bg-black/50 rounded-full p-2" onClick={() => setSelectedMedia(null)}>
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[90vh] overflow-hidden rounded-xl relative" onClick={e => e.stopPropagation()}>
            <img src={selectedMedia} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[#0c831f]">
            Community
          </p>
          <h2 className="mt-2 text-xl sm:text-2xl font-black text-[#1a1a1a]">
            Reviews & Q&A
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-[#0c831f] text-white px-3 py-2 rounded-xl">
          <Star className="w-5 h-5 fill-white" />
          <span className="text-lg font-black">{productRating}</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 mb-5 bg-[#f2f2f2] rounded-xl p-1">
        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "reviews" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#666] hover:text-[#1a1a1a]"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Reviews ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab("qa")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "qa" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#666] hover:text-[#1a1a1a]"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Q&A ({qaList.length})
        </button>
      </div>

      {/* Reviews Tab */}
      {activeTab === "reviews" && (
        <div>
          {/* Media gallery - with file upload */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 hide-scrollbar">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (!files) return;
                const newFiles = Array.from(files).map((f) => ({
                  id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  name: f.name,
                  preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
                }));
                setUploadedFiles((prev) => [...prev, ...newFiles].slice(0, 5));
                toast.success(`${newFiles.length} file${newFiles.length > 1 ? "s" : ""} selected for upload`);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-[#e8e8e8] flex flex-col items-center justify-center gap-1 hover:border-[#ff4f8b] hover:bg-[#fff0f6] transition-colors"
            >
              <Camera className="w-5 h-5 text-[#999]" />
              <span className="text-[8px] font-semibold text-[#999]">Add Photo</span>
            </button>
            {/* Uploaded files preview */}
            {uploadedFiles.map((f) => (
              <div key={f.id} className="flex-shrink-0 w-20 h-20 rounded-xl bg-[#f2f2f2] flex items-center justify-center border border-[#e8e8e8] relative group cursor-pointer overflow-hidden" onClick={() => f.preview && setSelectedMedia(f.preview)}>
                {f.preview ? (
                  <img src={f.preview} alt={f.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Video className="w-6 h-6 text-[#666]" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFiles((prev) => prev.filter((x) => x.id !== f.id));
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#dc2626] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {reviews.filter((r) => r.hasImage).map((r) => (
              <div key={r.id} onClick={() => setSelectedMedia(r.imageUrl || "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&q=80")} className="flex-shrink-0 w-20 h-20 rounded-xl bg-[#f2f2f2] flex items-center justify-center border border-[#e8e8e8] cursor-pointer hover:border-[#ff4f8b] transition-colors relative overflow-hidden">
                {r.imageUrl ? (
                  <img src={r.imageUrl} alt="Review" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-[#999]" />
                )}
                <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-[#0c831f] flex items-center justify-center z-10">
                  <Camera className="w-2 h-2 text-white" />
                </span>
              </div>
            ))}
            {reviews.filter((r) => r.hasVideo).map((r) => (
              <div key={`video-${r.id}`} className="flex-shrink-0 w-20 h-20 rounded-xl bg-[#1a1a1a] flex items-center justify-center border border-[#e8e8e8] cursor-pointer hover:border-[#ff4f8b] transition-colors relative">
                <Video className="w-6 h-6 text-white" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-t-transparent border-b-transparent border-l-white ml-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Review list */}
          <div className="space-y-4">
            {displayedReviews.map((review) => (
              <div key={review.id} className="border-b border-[#e8e8e8] pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#f2f2f2] flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-[#666]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-bold text-[#1a1a1a]">{review.name}</span>
                      <span className="text-[10px] text-[#999]">{review.date}</span>
                      {review.verified && (
                        <span className="text-[10px] text-[#0c831f] font-semibold">✓ Verified Purchase</span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-[#e8e8e8]"}`} />
                      ))}
                    </div>

                    {/* Photo/video badges */}
                    {(review.hasImage || review.hasVideo) && (
                      <div className="flex gap-1.5 mb-2">
                        {review.hasImage && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e3f2fd] text-[10px] font-semibold text-[#1565c0]">
                            <Camera className="w-3 h-3" />
                            Photo
                          </span>
                        )}
                        {review.hasVideo && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fce4ec] text-[10px] font-semibold text-[#c62828]">
                            <Video className="w-3 h-3" />
                            Video
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-sm text-[#1a1a1a] leading-relaxed">{review.comment}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => {
                          const reviewKey = `review-${review.id}`;
                          if (hasVoted(reviewKey)) {
                            removeVote(reviewKey);
                          } else {
                            addVote(reviewKey);
                            toast.success("Marked as helpful!");
                          }
                        }}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          hasVoted(`review-${review.id}`) ? "text-[#ff4f8b] font-bold" : "text-[#999] hover:text-[#ff4f8b]"
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted(`review-${review.id}`) ? "fill-[#ff4f8b]" : ""}`} />
                        {review.likes + (hasVoted(`review-${review.id}`) ? 1 : 0)}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Show more / Write review */}
          <div className="mt-4 space-y-3">
            {reviews.length > 3 && (
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="w-full flex items-center justify-center gap-1 py-2 text-xs font-semibold text-[#ff4f8b] hover:bg-[#fff0f6] rounded-xl transition-colors"
              >
                {showAllReviews ? "Show less" : `Show all ${reviews.length} reviews`}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllReviews ? "rotate-180" : ""}`} />
              </button>
            )}
            
            {isWritingReview ? (
              <div className="border border-[#e8e8e8] rounded-xl p-4 mt-4 bg-[#f9f9f9]">
                <h3 className="font-bold text-[#1a1a1a] mb-3">Write your review</h3>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-6 h-6 cursor-pointer transition-colors ${star <= newReviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-[#e8e8e8] hover:text-yellow-200'}`}
                      onClick={() => setNewReviewRating(star)}
                    />
                  ))}
                </div>
                <textarea
                  className="w-full border border-[#e8e8e8] rounded-xl p-3 text-sm mb-3 outline-none focus:border-[#ff4f8b] transition-colors resize-none"
                  placeholder="What did you think about this product?"
                  rows={3}
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setIsWritingReview(false)}
                    className="px-4 py-2 border border-[#e8e8e8] text-sm font-bold text-[#666] rounded-xl hover:bg-[#e8e8e8] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!newReviewComment.trim()}
                    onClick={() => {
                      if(!newReviewComment.trim()) return;
                      const newR: Review = {
                        id: Date.now(),
                        name: "You",
                        date: "Just now",
                        rating: newReviewRating,
                        comment: newReviewComment,
                        likes: 0,
                        verified: true,
                        hasImage: uploadedFiles.length > 0,
                        imageUrl: uploadedFiles[0]?.preview,
                      };
                      setReviews([newR, ...reviews]);
                      setIsWritingReview(false);
                      setNewReviewComment("");
                      setNewReviewRating(5);
                      setUploadedFiles([]);
                      toast.success("Review submitted! Thank you for your feedback.");
                    }}
                    className="px-4 py-2 bg-[#ff4f8b] text-white text-sm font-bold rounded-xl hover:bg-[#e63872] transition-colors disabled:opacity-50"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsWritingReview(true)}
                className="w-full h-11 rounded-xl border-2 border-dashed border-[#e8e8e8] flex items-center justify-center gap-2 text-sm font-semibold text-[#666] hover:border-[#ff4f8b] hover:text-[#ff4f8b] hover:bg-[#fff0f6] transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                Write a Review
              </button>
            )}
          </div>
        </div>
      )}

      {/* Q&A Tab */}
      {activeTab === "qa" && (
        <div>
          <div className="space-y-4">
            {displayedQA.map((qa) => (
              <div key={qa.id} className="border-b border-[#e8e8e8] pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#e3f2fd] flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-4 h-4 text-[#1565c0]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#1a1a1a] mb-1">{qa.question}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] text-[#999]">{qa.askedBy}</span>
                      <span className="text-[10px] text-[#999]">•</span>
                      <span className="text-[10px] text-[#999]">{qa.date}</span>
                    </div>
                    <div className="bg-[#f9f9f9] rounded-xl p-3 border border-[#e8e8e8]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-[#0c831f]">{qa.answeredBy}</span>
                        <span className="text-[10px] text-[#999]">•</span>
                        <span className="text-[10px] text-[#999]">{qa.date}</span>
                      </div>
                      <p className="text-sm text-[#1a1a1a] leading-relaxed">{qa.answer}</p>
                    </div>
                    <button
                      onClick={() => {
                        const qaKey = `qa-${qa.id}`;
                        if (hasVoted(qaKey)) {
                          removeVote(qaKey);
                        } else {
                          addVote(qaKey);
                          toast.success("Marked as helpful!");
                        }
                      }}
                      className={`flex items-center gap-1 text-xs transition-colors mt-2 ${
                        hasVoted(`qa-${qa.id}`) ? "text-[#ff4f8b] font-bold" : "text-[#999] hover:text-[#ff4f8b]"
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted(`qa-${qa.id}`) ? "fill-[#ff4f8b]" : ""}`} />
                      {qa.likes + (hasVoted(`qa-${qa.id}`) ? 1 : 0)}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ask a question */}
          <div className="mt-4 space-y-3">
            {qaList.length > 2 && (
              <button
                onClick={() => setShowAllQA(!showAllQA)}
                className="w-full flex items-center justify-center gap-1 py-2 text-xs font-semibold text-[#ff4f8b] hover:bg-[#fff0f6] rounded-xl transition-colors"
              >
                {showAllQA ? "Show less" : `Show all ${qaList.length} questions`}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllQA ? "rotate-180" : ""}`} />
              </button>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask a question about this product..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="flex-1 h-11 rounded-xl border border-[#e8e8e8] px-4 text-sm text-[#1a1a1a] outline-none focus:border-[#ff4f8b] transition-colors placeholder:text-[#999]"
              />
              <button
                onClick={handleAskQuestion}
                disabled={!newQuestion.trim()}
                className="h-11 px-4 rounded-xl bg-[#ff4f8b] text-white text-sm font-bold flex items-center gap-1.5 hover:bg-[#e63872] transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Ask
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
