// Reviewed portfolio copy; historical titles and delivery status are intentional.
export const projects = [
  {
    title: "Software Factory",
    description: "Building a system that starts coding-agent sessions from issues, schedules, and development events, with human review at defined checkpoints.",
    stack: "Python · Codex CLI · Claude Code · Git",
    slug: "software-factory",
    url: "https://github.com/ricardoiarced/software-factory",
  },
  {
    title: "Personal Finance Tracker",
    shortTitle: "Personal Finance",
    description: "Cash flow, budgets, and savings. A clearer picture of your money, in one private workspace.",
    stack: "Next.js · TypeScript · PostgreSQL",
    category: "Web application",
    slug: "personal-finance",
    image: "personal-finance-dashboard.webp",
    alt: "Personal Finance dashboard with account balances and financial activity",
    width: 1400,
    height: 733,
  },
];

export const experience = [
  {
    role: "Junior ERP Developer",
    company: "Villa Group Resorts & Spas",
    dates: "Aug 2025 — Sep 2026",
    location: "Puerto Vallarta, Jalisco",
    description: "Enterprise software for resort operations, from business workflows to equipment data.",
    highlights: [
      "Developed requisition, purchasing, inventory, and accounting workflows with Python unit tests. Refined requirements with pilot-resort staff over two visits; the ERP reached staging before my departure.",
      "Built a POS-to-ERP API integration mapping 491 accounts to daily draft income journal entries, with exchange-rate handling. It reached staging before a consolidation plan made it unnecessary.",
      "Performed the technical Odoo Enterprise maintenance upgrade from v17 to v19 using Odoo’s upgrade service, custom scripts, and module updates. The team lead deployed it to production.",
      "Migrated 2,000+ equipment records from MP9, coordinating catalog cleanup with six resorts and expanding Odoo coverage from one property to seven.",
    ],
    additional: [
      "Fixed an accounting recalculation issue that removed custom cost-center adjustments, regenerating adjustment lines after updates and preventing recursive writes.",
    ],
    stack: "Python · Odoo · Unit testing · API integration",
  },
  {
    role: "Junior Software Engineer",
    company: "Beracah Médica",
    dates: "Oct 2023 — Aug 2025",
    location: "Hermosillo, Sonora",
    description: "E-commerce workflows and integrations during a Magento 2 to Odoo migration.",
    highlights: [
      "Customized a quote-first dropshipping checkout so customers could resume payment after supplier confirmation. The website processed MXN 100K+ in sales in its first two months.",
      "Developed Odoo scheduled CSV exports to AWS S3 and modified Magento 2 price-update logic to keep prices aligned in production.",
      "Implemented the domain move and 301 redirects during a three-person migration of 10,000+ products from Magento 2 to Odoo Enterprise.",
    ],
    additional: [
      "Built a production Excel importer for supplier costs, matching supplier-specific product codes, showing rows for review, and providing downloadable error reports. It reused existing per-product Odoo–Magento update logic.",
    ],
    stack: "Python · Odoo · Magento 2 · AWS S3",
  },
  {
    role: "Application Engineer",
    company: "Coinsamatik",
    dates: "Sep 2021 — Jun 2023",
    location: "Hermosillo, Sonora",
    description: "Industrial software connecting field measurements with reporting systems.",
    highlights: [
      "Developed a C++ application for daily flowmeter reporting to Mexico’s national water authority via FTP, integrating a Phoenix Contact PLC and HMI. It reached testing before my departure.",
    ],
    additional: [],
    stack: "C++ · PLC/HMI · FTP",
  },
];

export const email = "ricardoiarced@gmail.com";
export const github = "https://github.com/ricardoiarced";
export const linkedin = "https://www.linkedin.com/in/ricardo-irvin-arce-diaz/";
