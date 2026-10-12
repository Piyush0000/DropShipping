// Applications are stored as leads in the EVOC CRM (admin panel → CRM → DropShipping).
const CRM_LEADS_URL =
  process.env.ADMIN_CRM_LEADS_URL || "https://api.evoclabs.com/api/leads";

type Application = {
  name: string;
  phone: string;
  sellerType: string;
  targetRegion: string;
  budget: string;
  serviceFee: string;
  companyWebsite?: string;
};

const fieldLabels: Array<[keyof Application, string]> = [
  ["name", "Applicant name"],
  ["phone", "Phone number"],
  ["sellerType", "Seller type"],
  ["targetRegion", "Target region"],
  ["budget", "Monthly ad budget"],
  ["serviceFee", "20K Service fee"],
];

function clean(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, maxLength)
    : "";
}

function validate(body: Record<string, unknown>): Application | null {
  const application: Application = {
    name: clean(body.name, 100),
    phone: clean(body.phone, 30),
    sellerType: clean(body.sellerType, 50),
    targetRegion: clean(body.targetRegion, 50),
    budget: clean(body.budget, 30),
    serviceFee: clean(body.serviceFee, 10),
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

  const serviceFees = new Set(["yes", "no"]);

  if (
    requiredFields.some((value) => !value) ||
    !phonePattern.test(application.phone) ||
    !sellerTypes.has(application.sellerType) ||
    !targetRegions.has(application.targetRegion) ||
    !budgets.has(application.budget) ||
    !serviceFees.has(application.serviceFee)
  ) {
    return null;
  }

  return application;
}

async function saveApplicationToCrm(application: Application) {
  const response = await fetch(CRM_LEADS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: application.name,
      phone: application.phone,
      formType: "dropshipping-application",
      budget: application.budget,
      target: application.targetRegion,
      source: "DropShipping website",
      metadata: {
        sellerType: application.sellerType,
        targetRegion: application.targetRegion,
        serviceFee: application.serviceFee,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`CRM returned ${response.status}`);
  }
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

  try {
    await saveApplicationToCrm(application);
  } catch (error) {
    console.error("Application CRM save failed:", error);
    return Response.json(
      { error: "We could not save your application. Please try again." },
      { status: 502 },
    );
  }

  return Response.json({ success: true });
}
