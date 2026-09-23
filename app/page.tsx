"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

const results = [
  {
    src: "/results/4.png",
    title: "From setup to 700 orders",
    meta: "FULL-COMMERCE BUILD",
    description: "A high-converting storefront backed by a complete seller system.",
    featured: true,
  },
  {
    src: "/results/6.png",
    title: "71 orders · $3,229 in sales",
    meta: "US DROPSHIPPING",
    description: "A new offer gaining traction in its first 90 days.",
  },
  {
    src: "/results/7.png",
    title: "$6,021.37 in four days",
    meta: "SHOPIFY GROWTH",
    description: "Campaign and store optimisation working together.",
  },
  {
    src: "/results/8.png",
    title: "AED 92,270 total sales",
    meta: "UAE E-COMMERCE",
    description: "A focused channel mix built for profitable scale.",
  },
  {
    src: "/results/9.png",
    title: "$5.09K in daily sales",
    meta: "PERFORMANCE MARKETING",
    description: "Consistent growth across traffic, orders, and revenue.",
  },
  {
    src: "/results/10.png",
    title: "£1,741.09 from live sales",
    meta: "UK DROPSHIPPING",
    description: "Real-time performance from a conversion-led store.",
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}

function Logo() {
  return (
    <a className="brand" href="#top" aria-label="FLCommerce home">
      <Image
        src="/brand/flcommerce-logo.png"
        alt="FLCommerce"
        width={186}
        height={62}
        priority
      />
    </a>
  );
}

export default function Home() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "We could not send your application.");
      }

      form.reset();
      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We could not send your application. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main id="top">
      <header className="site-header">
        <div className="shell nav-wrap">
          <Logo />
          <nav aria-label="Primary navigation">
            <a href="#top">Home</a>
            <a href="#results">Results</a>
            <a href="#about">About</a>
          </nav>
        </div>
      </header>

      <section className="hero shell" id="apply">
        <div className="form-card">
          <div className="form-topline">
            <div>
              <span className="kicker">START YOUR APPLICATION</span>
              <h2>Get Started with Evoc Labs</h2>
              <p>Fill out the form and we&apos;ll contact you to build your international e-commerce strategy.</p>
            </div>
          </div>

          {submitted ? (
            <div className="success" role="status">
              <span className="success-icon">✓</span>
              <h2>Your application has been sent.</h2>
              <p>Thanks for reaching out. The FLCommerce team will review your details and contact you shortly.</p>
              <button type="button" onClick={() => setSubmitted(false)}>Submit another response</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="honeypot" aria-hidden="true">
                <label htmlFor="company-website">Company website</label>
                <input
                  id="company-website"
                  name="companyWebsite"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <div className="field full">
                <label htmlFor="name">Your name <i>*</i></label>
                <input id="name" name="name" placeholder="John Doe" required />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone No. <i>*</i></label>
                <input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" required />
              </div>
              <div className="field">
                <label htmlFor="seller-type">Seller Type <i>*</i></label>
                <select id="seller-type" name="sellerType" defaultValue="" required>
                  <option value="" disabled>Select your type</option>
                  <option value="ecommerce-seller">Ecommerce seller</option>
                  <option value="employee">Employee</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="target-region">Target Region <i>*</i></label>
                <select id="target-region" name="targetRegion" defaultValue="" required>
                  <option value="" disabled>Select target market</option>
                  <option value="india">India</option>
                  <option value="united-states">United States</option>
                  <option value="united-kingdom">United Kingdom</option>
                  <option value="uae">United Arab Emirates</option>
                  <option value="europe">Europe</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="budget">Monthly Ad Budget (INR) <i>*</i></label>
                <select id="budget" name="budget" defaultValue="" required>
                  <option value="" disabled>Select your budget</option>
                  <option value="10000">₹10,000</option>
                  <option value="15000">₹15,000</option>
                  <option value="30000">₹30,000</option>
                  <option value="30000-plus">₹30,000+</option>
                </select>
              </div>
              {submitError && (
                <p className="form-error" role="alert">{submitError}</p>
              )}
              <button className="submit-button" type="submit" disabled={submitting}>
                {submitting ? "Sending application…" : "Submit application"}
                {!submitting && <ArrowIcon />}
              </button>
              <p className="privacy">By submitting, you agree to be contacted about your application. No spam—ever.</p>
            </form>
          )}
        </div>
      </section>

      <section className="results" id="results">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="kicker">PROOF, NOT PROMISES</span>
              <h2>Results we&apos;ve <span>generated.</span></h2>
            </div>
            <p>Real dashboards. Real stores. Real momentum created with focused execution.</p>
          </div>

          <div className="results-grid">
            {results.map((result, index) => (
              <article className={`result-card ${result.featured ? "featured" : ""}`} key={result.src}>
                <div className="result-image">
                  <Image
                    src={result.src}
                    alt={`${result.title} performance dashboard`}
                    fill
                    sizes={result.featured ? "(max-width: 800px) 100vw, 66vw" : "(max-width: 800px) 100vw, 33vw"}
                    priority={index < 2}
                  />
                  <span className="result-number">0{index + 1}</span>
                </div>
                <div className="result-info">
                  <span>{result.meta}</span>
                  <h3>{result.title}</h3>
                  <p>{result.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer id="about">
        <div className="shell footer-logo">
          <Logo />
        </div>

        <div className="shell footer-grid">
          <div className="footer-column footer-connect">
            <h3>FLCommerce Connect</h3>
            <div className="social-links" aria-label="Social media">
              <a href="https://www.instagram.com/flocommerce/" aria-label="FLCommerce on Instagram" target="_blank" rel="noopener noreferrer">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
            <a className="contact-link" href="tel:+916397062646"><span>☎</span> +91 6397062646</a>
            <a className="contact-link" href="mailto:Contact@evoclabs.com"><span>✉</span> Contact@evoclabs.com</a>
          </div>

          <div className="footer-column">
            <h3>Services</h3>
            <a href="#apply">Store Setup</a>
            <a href="#apply">Product Research</a>
            <a href="#apply">Ad Campaigns</a>
            <a href="#apply">Brand Building</a>
          </div>

          <div className="footer-column">
            <h3>Company</h3>
            <a href="#about">About</a>
            <a href="#results">Results</a>
            <a href="#results">Reviews</a>
            <a href="#about">Partners</a>
          </div>

          <div className="footer-column">
            <h3>Get Started</h3>
            <a href="#apply">Book a Demo</a>
            <a href="mailto:Contact@evoclabs.com">Contact Us</a>
          </div>
        </div>

        <div className="shell footer-bottom">
          <span>© 2026 All rights reserved. EVOC LABS PVT LTD.</span>
          <a href="#top" aria-label="Back to top">↑</a>
        </div>
      </footer>
    </main>
  );
}
