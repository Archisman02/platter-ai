import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="shell">
      <section className="hero-card">
        <div className="hero-grid">
          <div className="hero-copy">
            <h1>From guest list to perfect order — in few seconds.</h1>
            <p>
              Tell us about your guests, preferences, and budget. We&apos;ll plan the entire
              order for you.
            </p>
            <div className="hero-actions">
              <Link className="primary-link" href="/chat">
                Plan your order
              </Link>
            </div>
            <div className="hero-points" id="flow">
              <div className="hero-point">
                <strong>Guided</strong>
                <span>One question at a time, with clear next steps.</span>
              </div>
              <div className="hero-point">
                <strong>Deterministic</strong>
                <span>Simple backend state and rule-based planning logic.</span>
              </div>
              <div className="hero-point">
                <strong>Adjustable</strong>
                <span>Supports cheaper, premium, snacks, and order-ready planning.</span>
              </div>
            </div>
          </div>

          <div className="hero-preview">
            <div className="preview-stack">
              <div className="preview-card">
                <div className="chip-row">
                  <span className="chip">6 guests</span>
                  <span className="chip">Dinner</span>
                  <span className="chip">Rs 2000 budget</span>
                </div>
                <h3>Assistant flow</h3>
                <p>
                  The chat gathers guest count, meal type, veg split, restrictions, and budget
                  before generating a plan.
                </p>
              </div>

              <div className="preview-card offset">
                <h3>Sample recommendation</h3>
                <div className="stats">
                  <div className="stat">
                    <strong>Spice Kitchen</strong>
                    <span>Balanced veg + non-veg dinner spread</span>
                  </div>
                  <div className="stat">
                    <strong>Rs 316 / person</strong>
                    <span>Includes mains and breads with allergy-aware filtering</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
