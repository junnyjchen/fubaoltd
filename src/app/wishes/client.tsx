"use client";

import { useState, useEffect } from "react";

interface Wish {
  id: string;
  userName: string;
  productName: string;
  content: string;
  mediaType: "text" | "image" | "video";
  mediaUrl?: string;
  rating: number;
  createdAt: string;
}

interface WishFormData {
  userName: string;
  productName: string;
  content: string;
  rating: number;
  orderId?: string;
}

export function WishesClient() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<WishFormData>({
    userName: "",
    productName: "",
    content: "",
    rating: 5,
    orderId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchWishes();
  }, []);

  const fetchWishes = async () => {
    try {
      const response = await fetch("/api/wishes?limit=20");
      const data = await response.json();
      if (data.success) {
        setWishes(data.data.wishes);
      }
    } catch (error) {
      console.error("Failed to fetch wishes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setSubmitSuccess(true);
        setFormData({
          userName: "",
          productName: "",
          content: "",
          rating: 5,
          orderId: "",
        });
        setTimeout(() => {
          setShowForm(false);
          setSubmitSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to submit wish:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-sm ${i < rating ? "text-[var(--gold)]" : "text-[var(--jade)]"}`}
      >
        ★
      </span>
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-[var(--cinnabar)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Share Your Wish Button */}
      <div className="mb-8 text-center">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 rounded-lg bg-[var(--cinnabar)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {showForm ? "Cancel" : "Share Your Wish"}
        </button>
      </div>

      {/* Submission Form */}
      {showForm && (
        <div className="mb-12 bg-[var(--jade)] rounded-lg border border-[var(--gold)]/20 p-6">
          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--cinnabar)]/10 flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="text-lg font-serif text-[var(--ink)] mb-2">
                Thank You!
              </h3>
              <p className="text-sm text-[var(--smoke)]">
                Your wish has been submitted and will be reviewed before publishing.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-serif text-[var(--ink)] mb-4">
                Share Your Experience
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--smoke)] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.userName}
                    onChange={(e) =>
                      setFormData({ ...formData, userName: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded border border-[var(--gold)]/30 bg-[var(--paper)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--cinnabar)]"
                    placeholder="John D."
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--smoke)] mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) =>
                      setFormData({ ...formData, productName: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded border border-[var(--gold)]/30 bg-[var(--paper)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--cinnabar)]"
                    placeholder="Protection Talisman"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[var(--smoke)] mb-1">
                  Order ID (optional)
                </label>
                <input
                  type="text"
                  value={formData.orderId}
                  onChange={(e) =>
                    setFormData({ ...formData, orderId: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded border border-[var(--gold)]/30 bg-[var(--paper)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--cinnabar)]"
                  placeholder="FB-ORD-XXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--smoke)] mb-1">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`text-2xl ${
                        star <= formData.rating
                          ? "text-[var(--gold)]"
                          : "text-[var(--jade)]"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-[var(--smoke)] mb-1">
                  Your Story *
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 rounded border border-[var(--gold)]/30 bg-[var(--paper)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--cinnabar)] resize-none"
                  placeholder="Share your experience with the product..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg bg-[var(--cinnabar)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Your Wish"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Wishes Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {wishes.map((wish) => (
          <div
            key={wish.id}
            className="bg-[var(--jade)] rounded-lg border border-[var(--gold)]/20 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-[var(--ink)]">{wish.userName}</p>
                <p className="text-xs text-[var(--smoke)]">
                  {wish.productName}
                </p>
              </div>
              <div className="flex">{renderStars(wish.rating)}</div>
            </div>
            <p className="text-sm text-[var(--ink)]/80 leading-relaxed mb-3">
              {wish.content}
            </p>
            <p className="text-xs text-[var(--smoke)]">
              {formatDate(wish.createdAt)}
            </p>
          </div>
        ))}
      </div>

      {wishes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--smoke)]">
            No wishes yet. Be the first to share your story!
          </p>
        </div>
      )}
    </div>
  );
}
