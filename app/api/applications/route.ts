const RECIPIENT_EMAIL = "sociodesk.help@gmail.com";

type Application = {
  name: string;
  phone: string;
  sellerType: string;
  targetRegion: string;
  budget: string;
  companyWebsite?: string;
};

const fieldLabels: Array<[keyof Application, string]> = [
  ["name", "Applicant name"],
  ["phone", "Phone number"],
  ["sellerType", "Seller type"],
  ["targetRegion", "Target region"],
  ["budget", "Monthly ad budget"],
];

const displayValues: Record<string, string> = {
  "ecommerce-seller": "Ecommerce seller",
  employee: "Employee",
  student: "Student",
  india: "India",
  "united-states": "United States",
  "united-kingdom": "United Kingdom",
  uae: "United Arab Emirates",
  europe: "Europe",
  other: "Other",
  "10000": "₹10,000",
  "15000": "₹15,000",
  "30000": "₹30,000",
  "30000-plus": "₹30,000+",
};

function clean(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, maxLength)
    : "";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}

function displayValue(value: string) {
  return displayValues[value] || value;
}

function validate(body: Record<string, unknown>): Application | null {
  const application: Application = {
    name: clean(body.name, 100),
    phone: clean(body.phone, 30),
    sellerType: clean(body.sellerType, 50),
    targetRegion: clean(body.targetRegion, 50),
    budget: clean(body.budget, 30),
    companyWebsite: clean(body.companyWebsite, 200),
  };

  const requiredFields = fieldLabels.map(([key]) => application[key]);
  const phonePattern = /^[+()\-\s\d]{7,30}$/;
  const sellerTypes = new Set(["ecommerce-seller", "employee", "student"]);
  const targetRegions = new Set([
    "india",
    "united-states",
    "united-kingdom",
    "uae",
    "europe",
    "other",
  ]);
  const budgets = new Set(["10000", "15000", "30000", "30000-plus"]);

  if (
    requiredFields.some((value) => !value) ||
    !phonePattern.test(application.phone) ||
    !sellerTypes.has(application.sellerType) ||
    !targetRegions.has(application.targetRegion) ||
    !budgets.has(application.budget)
  ) {
    return null;
  }

  return application;
}

function buildEmail(application: Application) {
  const submittedAt = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  const rows = fieldLabels
    .map(([key, label]) => {
      const value = escapeHtml(displayValue(application[key] || ""));
      return `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#64748b;font-size:14px;width:38%;vertical-align:top">${label}</td>
          <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#0f172a;font-size:14px;font-weight:600;white-space:pre-wrap">${value}</td>
        </tr>`;
    })
    .join("");

  const textRows = fieldLabels
    .map(([key, label]) => `${label}: ${displayValue(application[key] || "")}`)
    .join("\n");

  return {
    subject: `flocommerce dropshipping - ${application.name}`,
    text: `New FLCommerce dropshipping application\n\n${textRows}\n\nSubmitted: ${submittedAt} (IST)`,
    html: `
      <!doctype html>
      <html lang="en">
        <body style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,sans-serif">
          <table role="presentation" style="width:100%;max-width:640px;margin:0 auto;border-collapse:collapse;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 18px rgba(15,23,42,.08)">
            <tr>
              <td style="padding:28px 24px;background:#0b1628;color:#ffffff">
                <p style="margin:0 0 8px;color:#6ea3ff;font-size:12px;font-weight:700;letter-spacing:1.5px">NEW APPLICATION</p>
                <h1 style="margin:0;font-size:24px;line-height:1.3">FLCommerce Dropshipping</h1>
              </td>
            </tr>
            <tr><td style="padding:10px 8px"><table role="presentation" style="width:100%;border-collapse:collapse">${rows}</table></td></tr>
            <tr>
              <td style="padding:18px 24px;background:#f8fafc;color:#64748b;font-size:12px">Submitted ${escapeHtml(submittedAt)} (IST)</td>
            </tr>
          </table>
        </body>
      </html>`,
  };
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ error: "Invalid submission format." }, { status: 415 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid form data." }, { status: 400 });
  }

  const application = validate(body);
  if (!application) {
    return Response.json(
      { error: "Please check all required fields and phone numbers." },
      { status: 400 },
    );
  }

  // Silently accept honeypot submissions so bots cannot learn how they were caught.
  if (application.companyWebsite) {
    return Response.json({ success: true });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Application email failed: RESEND_API_KEY is not configured.");
    return Response.json(
      { error: "Email delivery is not configured yet. Please contact us directly." },
      { status: 503 },
    );
  }

  const email = buildEmail(application);
  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "flcommerce-website/1.0",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "FLCommerce <onboarding@resend.dev>",
        to: [RECIPIENT_EMAIL],
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });
  } catch (error) {
    console.error("Application email request failed:", error);
    return Response.json(
      { error: "We could not send your application. Please try again or contact us directly." },
      { status: 502 },
    );
  }

  if (!response.ok) {
    const details = await response.text();
    console.error("Application email failed:", response.status, details);
    return Response.json(
      { error: "We could not send your application. Please try again or contact us directly." },
      { status: 502 },
    );
  }

  return Response.json({ success: true });
}
