'use client';

export function NewsletterForm() {
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <input
        type="email"
        placeholder="Your email"
        className="flex-1 border border-border bg-transparent px-3 py-2 text-sm text-ink placeholder:text-smoke/50 focus:border-cinnabar focus:outline-none"
      />
      <button
        type="submit"
        className="border border-cinnabar bg-cinnabar px-4 py-2 text-sm text-white transition-colors hover:bg-cinnabar/90"
      >
        Subscribe
      </button>
    </form>
  );
}
