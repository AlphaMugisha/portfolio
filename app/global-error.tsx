"use client";

/**
 * Global error boundary.
 *
 * Replaces the framework default at the very root — this one renders its own
 * <html>/<body>, so it must not depend on the root layout's fonts or chrome.
 * Styling is inline for the same reason: if the failure happened before CSS
 * resolved, class names would render an unstyled page.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0D0D0D",
          color: "#F5F5F5",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "32rem", textAlign: "center" }}>
          <p
            style={{
              fontSize: "0.625rem",
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "#F5F5F5",
              margin: 0,
            }}
          >
            Something went wrong
          </p>

          <h1
            style={{
              fontFamily: '"Times New Roman", Times, serif',
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              fontWeight: 400,
              letterSpacing: "-0.012em",
              margin: "1.25rem 0 0",
            }}
          >
            This page failed to load
          </h1>

          <p
            style={{
              color: "#B4B4B4",
              lineHeight: 1.65,
              margin: "1rem 0 0",
            }}
          >
            An unexpected error occurred. Try again, and if it persists please
            get in touch.
          </p>

          {error.digest && (
            <p
              style={{
                color: "#8A8A8A",
                fontSize: "0.75rem",
                fontFamily: "inherit",
                margin: "1.5rem 0 0",
              }}
            >
              Reference: {error.digest}
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.875rem 2rem",
              borderRadius: "16px",
              border: "none",
              backgroundColor: "#FEB002",
              color: "#121212",
              fontSize: "0.8125rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 400,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
