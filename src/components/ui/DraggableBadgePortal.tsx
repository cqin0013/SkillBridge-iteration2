// src/pages/CareerJargonDecoder/CareerJargonDecoder.tsx
import React, { useEffect, useState } from "react";
import {
  Input,
  Card,
  Tag,
  Space,
  Row,
  Col,
  Typography,
  Skeleton,
  Empty,
  message,
} from "antd";
import {
  SearchOutlined,
  LinkOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

/**
 * CareerJargonDecoder (TSX, pure Ant Design + Tailwind)
 *
 * Layout:
 * - Header: page title and subtitle
 * - Search: input box (debounced) to query term definitions
 * - Results: cards listing plain definition, context, example, sectors, and source
 * - Data Sources: reference cards linking to official/credible databases
 *
 * Integration:
 * - Replace `mockSearch` with your real API call when ready.
 */

// ----------------------------- Types -----------------------------
type Sector = "VET" | "IT" | "Business" | "Healthcare" | "Education" | "General";
type Region = "AU" | "EU" | "US" | "Global";

type DataSource = {
  id: string;
  name: string;
  url: string;
  region: Region;
  official: boolean;
  description: string;
  tags: string[];
};

type TermResult = {
  term: string;
  plainDefinition: string;
  context: string;
  example: string;
  relevance: number; // 0-100
  sector: Sector[];
  source?: string; // source id for attribution
};

// ------------------------- Data sources --------------------------
const DATA_SOURCES: DataSource[] = [
  {
    id: "vocedplus",
    name: "VOCEDplus VET Glossary",
    url: "https://www.voced.edu.au/vet-knowledge-bank-glossary-vet",
    region: "AU",
    official: true,
    description:
      "Official glossary for VET terms in Australia maintained by NCVER/VOCEDplus.",
    tags: ["glossary", "VET", "education"],
  },
  {
    id: "ncver-glossary",
    name: "NCVER Students and Courses Glossary (PDF)",
    url: "https://www.ncver.edu.au/__data/assets/pdf_file/0031/9667300/Terms-and-definitions-Students-and-courses.pdf",
    region: "AU",
    official: true,
    description:
      "Authoritative terms and definitions for students and courses used by NCVER.",
    tags: ["glossary", "VET", "students"],
  },
  {
    id: "vocstats-def",
    name: "VOCSTATS Field Definitions (PDF)",
    url: "https://www.ncver.edu.au/__data/assets/pdf_file/0036/9670662/VOCSTATS_fields_terms_and_definitions_Dec2024.pdf",
    region: "AU",
    official: true,
    description:
      "Field terms and definitions used in VOCSTATS for Australian VET statistics.",
    tags: ["statistics", "definitions", "VET"],
  },
  {
    id: "asqa-glossary",
    name: "ASQA Official Glossary",
    url: "https://www.asqa.gov.au/resources/glossary",
    region: "AU",
    official: true,
    description:
      "Glossary from the Australian Skills Quality Authority for compliance and RTO terms.",
    tags: ["compliance", "RTO", "glossary"],
  },
  {
    id: "tga",
    name: "training.gov.au (TGA)",
    url: "https://training.gov.au/",
    region: "AU",
    official: true,
    description:
      "Official database of training packages, qualifications and accredited courses in Australia.",
    tags: ["qualification", "courses", "official"],
  },
  {
    id: "yourcareer",
    name: "YourCareer (Job Outlook)",
    url: "https://www.yourcareer.gov.au/",
    region: "AU",
    official: true,
    description:
      "Australian government career site: occupational profiles, trends and skills context.",
    tags: ["careers", "occupations", "context"],
  },
  {
    id: "anzsco",
    name: "ANZSCO",
    url: "https://www.abs.gov.au/statistics/classifications/anzsco-australian-and-new-zealand-standard-classification-occupations",
    region: "AU",
    official: true,
    description:
      "Classification of occupations for Australia and New Zealand, helpful for code references.",
    tags: ["occupations", "codes", "standards"],
  },
  {
    id: "esco",
    name: "ESCO (EU)",
    url: "https://esco.ec.europa.eu/en",
    region: "EU",
    official: true,
    description:
      "European multilingual classification of Skills/Competences, Qualifications and Occupations.",
    tags: ["skills", "occupations", "glossary"],
  },
  {
    id: "onet",
    name: "O*NET Online (US)",
    url: "https://www.onetonline.org/",
    region: "US",
    official: true,
    description:
      "US Department of Labor occupational database: detailed descriptors, tasks, skills.",
    tags: ["skills", "occupations", "US"],
  },
  {
    id: "pmi-pmbok",
    name: "PMI PMBOK Glossary",
    url: "https://www.pmi.org/",
    region: "Global",
    official: false,
    description:
      "Project management body of knowledge; commonly referenced for PM acronyms.",
    tags: ["PM", "glossary", "certifications"],
  },
];

// ------------------------- Mock search data ----------------------
const MOCK_TERMS: Record<string, TermResult> = {
  rto: {
    term: "RTO",
    plainDefinition:
      "Registered Training Organisation: a provider approved to deliver nationally recognised training and qualifications in Australia.",
    context:
      "Used across VET and compliance contexts; commonly appears on course pages and AQF-aligned qualifications.",
    example:
      "Example: 'This course is delivered by RTO 12345 and leads to a nationally recognised Statement of Attainment.'",
    relevance: 95,
    sector: ["VET", "Education", "General"],
    source: "asqa-glossary",
  },
  microcredential: {
    term: "Microcredential",
    plainDefinition:
      "A short, focused learning unit certifying specific skills or knowledge, often stackable towards larger qualifications.",
    context:
      "Appears in university short courses, MOOC platforms and industry upskilling programs.",
    example:
      "Example: 'Complete three cloud microcredentials to earn credit towards a Graduate Certificate in Data Engineering.'",
    relevance: 88,
    sector: ["IT", "Business", "Education", "General"],
    source: "ncver-glossary",
  },
  pmbok: {
    term: "PMBOK",
    plainDefinition:
      "Project Management Body of Knowledge: PMI’s framework and guidelines covering standard project management practices.",
    context:
      "Used in PM roles, PMP certification prep, and project governance documentation.",
    example:
      "Example: 'Our process aligns with PMBOK knowledge areas, including scope, schedule and risk management.'",
    relevance: 82,
    sector: ["Business", "General"],
    source: "pmi-pmbok",
  },
};

/** Simulated async search; replace with your real API integration */
const mockSearch = async (query: string): Promise<TermResult[]> => {
  await new Promise((r) => setTimeout(r, 300)); // simulate latency
  const q = (query || "").trim().toLowerCase();
  if (!q) return [];
  const all = Object.values(MOCK_TERMS);

  // Basic scoring: exact term match gets a boost; partial match uses includes()
  const scored = all
    .map((t) => {
      const base = t.relevance;
      const term = t.term.toLowerCase();
      const def = t.plainDefinition.toLowerCase();
      const termHit = term === q ? 15 : term.includes(q) ? 8 : 0;
      const defHit = def.includes(q) ? 5 : 0;
      return { item: t, score: base + termHit + defHit };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item);

  return scored;
};

// ---------------------------- Component --------------------------
export default function CareerJargonDecoder() {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<TermResult[] | null>(null);

  // Debounced search without extra libs
  useEffect(() => {
    if (!(query || "").trim()) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        // Replace with your real API call:
        // const data = await fetch(`/api/jargon/search?q=${encodeURIComponent(query)}`).then(r => r.json());
        // setResults(data.items as TermResult[]);
        const res = await mockSearch(query);
        setResults(res);
      } catch (e) {
        console.error(e);
        message.error("Search failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* ===== Header ===== */}
      <header className="mb-4">
        <Title level={3} className="!mb-1">
          Career Jargon Decoder
        </Title>
        <Text type="secondary">
          Type a term (e.g., “RTO”, “microcredential”, “PMBOK”) to view
          plain-language definitions, context, examples and relevance.
        </Text>
      </header>

      {/* ===== Search ===== */}
      <Card className="shadow-sm" bodyStyle={{ padding: 16 }}>
        <Space direction="vertical" className="w-full">
          <Input
            allowClear
            size="large"
            placeholder='Search: try "RTO", "microcredential", "PMBOK"...'
            prefix={<SearchOutlined />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onPressEnter={(e) => setQuery((e.target as HTMLInputElement).value)}
            aria-label="Search career jargon term"
          />
          <div className="text-xs text-gray-500">
            <Text type="secondary">
              This search uses a local mock; replace with your API when ready.
            </Text>
          </div>
        </Space>
      </Card>

      {/* ===== Results ===== */}
      <div className="mt-4">
        <Card className="shadow-sm" bodyStyle={{ padding: 16 }} title="Search Results">
          {loading && (
            <div className="flex flex-col gap-3">
              <Skeleton active paragraph={{ rows: 2 }} />
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
          )}

          {!loading && results === null && (
            <div className="text-sm text-gray-500">Start typing to search…</div>
          )}

          {!loading && Array.isArray(results) && results.length === 0 && (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No results" />
          )}

          {!loading && Array.isArray(results) && results.length > 0 && (
            <Space direction="vertical" className="w-full">
              {results.map((r) => (
                <Card
                  key={r.term}
                  size="small"
                  className="border border-gray-100 hover:shadow-sm transition"
                >
                  <Space direction="vertical" className="w-full">
                    <Space className="justify-between w-full">
                      <Space>
                        <SafetyCertificateOutlined />
                        <span className="font-medium">{r.term}</span>
                      </Space>
                      <Tag color={r.relevance >= 85 ? "green" : "blue"}>
                        Relevance: {r.relevance}
                      </Tag>
                    </Space>

                    <Paragraph className="!mb-2">{r.plainDefinition}</Paragraph>

                    <Row gutter={[16, 8]}>
                      <Col xs={24} md={12}>
                        <Text type="secondary">Context</Text>
                        <Paragraph className="!mb-0">{r.context}</Paragraph>
                      </Col>
                      <Col xs={24} md={12}>
                        <Text type="secondary">Example</Text>
                        <Paragraph className="!mb-0">{r.example}</Paragraph>
                      </Col>
                    </Row>

                    <Space className="justify-between w-full pt-1">
                      <Space wrap>
                        {r.sector.map((s) => (
                          <Tag key={s}>{s}</Tag>
                        ))}
                      </Space>
                      {r.source && (
                        <a
                          href={DATA_SOURCES.find((d) => d.id === r.source)?.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs"
                          aria-label="Open source"
                        >
                          <LinkOutlined />
                          {DATA_SOURCES.find((d) => d.id === r.source)?.name ?? r.source}
                        </a>
                      )}
                    </Space>
                  </Space>
                </Card>
              ))}
            </Space>
          )}
        </Card>
      </div>

      {/* ===== Data Sources ===== */}
      <div className="mt-4">
        <Card
          className="shadow-sm"
          bodyStyle={{ paddingTop: 12 }}
          title={
            <Space>
              <DatabaseOutlined />
              <span>Data Sources</span>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            {DATA_SOURCES.map((src) => (
              <Col key={src.id} xs={24} sm={12} md={12} lg={8}>
                <Card
                  hoverable
                  className="h-full border border-gray-100"
                  actions={[
                    <a
                      key="visit"
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1"
                      aria-label={`Open ${src.name}`}
                    >
                      <LinkOutlined /> Visit
                    </a>,
                  ]}
                >
                  <Space direction="vertical" className="w-full">
                    <Space className="justify-between w-full">
                      <span className="font-medium">{src.name}</span>
                      <Space>
                        {src.official && <Tag color="green">Official</Tag>}
                        <Tag>{src.region}</Tag>
                      </Space>
                    </Space>
                    <Text type="secondary">{src.description}</Text>
                    <Space wrap className="pt-1">
                      {src.tags.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </Space>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </div>
    </div>
  );
}
