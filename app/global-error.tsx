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
          backgroundColor: "#0B0E14",
          color: "#B9C7D2",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "32rem", textAlign: "center" }}>
          <p
            style={{
              fontSize: "0.6875rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#54D1DB",
              margin: 0,
            }}
          >
            Something went wrong
          </p>

          <h1
            style={{
              fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
              fontWeight: 600,
              letterSpacing: "-0.028em",
              margin: "1.25rem 0 0",
            }}
          >
            This page failed to load
          </h1>

          <p
            style={{
              color: "#93A2AF",
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
                color: "#7A8892",
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
              borderRadius: "999px",
              border: "none",
              backgroundColor: "#54D1DB",
              color: "#0B0E14",
              fontSize: "0.875rem",
              fontWeight: 500,
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
