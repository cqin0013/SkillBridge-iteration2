// src/pages/CareerJargonDecoder/CareerJargonDecoder.tsx
import React, { useEffect, useState } from "react";
import {
  Input,
  Card,
  Space,
  Row,
  Col,
  Typography,
  Skeleton,
  Empty,
  message,
  Tag,
} from "antd";
import {
  SearchOutlined,
  LinkOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

// Import your existing JSX components (do not modify them)
import SectionBox from "../../components/ui/SectionBox/SectionBox";
import StageBox from "../../components/ui/StageBox/StageBox";

const { Title, Text, Paragraph } = Typography;

/**
 * CareerJargonDecoder (TSX)
 * - Uses StageBox (title-only header) and SectionBox (search + results + data sources).
 * - Results show ONLY plain definition (no relevance/context/example).
 * - Data Sources unified layout: name, region, description, Visit link.
 * - Mocked search is included; replace with your real API when ready.
 */

// ----------------------------- Types -----------------------------
type Region = "AU" | "EU" | "US" | "Global";

type DataSource = {
  id: string;
  name: string;
  url: string;
  region: Region;
  description: string;
};

type TermResult = {
  term: string;
  plainDefinition: string;
  source?: string; // optional datasource id for attribution
};

// ------------------------- Data sources --------------------------
const DATA_SOURCES: DataSource[] = [
  {
    id: "vocedplus",
    name: "VOCEDplus VET Glossary",
    url: "https://www.voced.edu.au/vet-knowledge-bank-glossary-vet",
    region: "AU",
    description:
      "Official glossary for VET terms in Australia maintained by NCVER/VOCEDplus.",
  },
  {
    id: "ncver-glossary",
    name: "NCVER Students and Courses Glossary (PDF)",
    url: "https://www.ncver.edu.au/__data/assets/pdf_file/0031/9667300/Terms-and-definitions-Students-and-courses.pdf",
    region: "AU",
    description:
      "Authoritative terms and definitions for students and courses used by NCVER.",
  },
  {
    id: "vocstats-def",
    name: "VOCSTATS Field Definitions (PDF)",
    url: "https://www.ncver.edu.au/__data/assets/pdf_file/0036/9670662/VOCSTATS_fields_terms_and_definitions_Dec2024.pdf",
    region: "AU",
    description:
      "Field terms and definitions used in VOCSTATS for Australian VET statistics.",
  },
  {
    id: "asqa-glossary",
    name: "ASQA Official Glossary",
    url: "https://www.asqa.gov.au/resources/glossary",
    region: "AU",
    description:
      "Glossary from the Australian Skills Quality Authority for compliance and RTO terms.",
  },

];

// ------------------------- Mock search data ----------------------
const MOCK_TERMS: Record<string, TermResult> = {
  rto: {
    term: "RTO",
    plainDefinition:
      "Registered Training Organisation: a provider approved to deliver nationally recognised training and qualifications in Australia.",
    source: "asqa-glossary",
  },
};

/** Simulated async search; replace with your real API integration */
const mockSearch = async (query: string): Promise<TermResult[]> => {
  await new Promise((r) => setTimeout(r, 260)); // simulate latency
  const q = (query || "").trim().toLowerCase();
  if (!q) return [];
  const all = Object.values(MOCK_TERMS);
  return all.filter(
    (t) =>
      t.term.toLowerCase().includes(q) ||
      t.plainDefinition.toLowerCase().includes(q)
  );
};

// ---------------------------- Component --------------------------
export default function CareerJargonDecoder() {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<TermResult[] | null>(null);

  // Debounced search with a simple timer (no extra libraries)
  useEffect(() => {
    if (!(query || "").trim()) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        // Replace with your real API call ↓
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
    }, 300);

    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* ===== Title header via StageBox (title only; body hidden) ===== */}
      <StageBox
        step=" "
        pill={null}
        title="Career Jargon Decoder"
        introTitle={undefined}
        introContent={null}      // no body -> caret hidden by the component's logic
        actionsTitle={undefined}
        actionsContent={null}
        extra={null}
        accent={undefined}
        defaultCollapsed={true}
        collapsed={true}
        onCollapsedChange={() => {}}
        hint={undefined}
      />

      {/* ===== Search box ===== */}
      <div className="mt-4">
        <SectionBox
          title="Search"
          extra={null}
          footer={null}
          compact={true}
          variant="question"
          className=""
          bodyStyle={{}}
        >
          <Input
            allowClear
            size="large"
            placeholder='Search terms, e.g. "RTO", "microcredential", "PMBOK"'
            prefix={<SearchOutlined />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onPressEnter={(e) =>
              setQuery((e.target as HTMLInputElement).value ?? "")
            }
            aria-label="Search career jargon term"
          />
        </SectionBox>
      </div>

      {/* ===== Search Results (definition only) ===== */}
      <div className="mt-4">
        <SectionBox
          title="Search Results"
          extra={null}
          footer={null}
          compact={true}
          variant="default"
          className=""
          bodyStyle={{}}
        >
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
                
                        <span className="font-medium">{r.term}</span>
                      </Space>
                    </Space>

                    {/* Show ONLY the plain definition */}
                    <Paragraph className="!mb-0">{r.plainDefinition}</Paragraph>
                  </Space>
                </Card>
              ))}
            </Space>
          )}
        </SectionBox>
      </div>

      {/* ===== Data Sources (uniform: name, region, description, Visit) ===== */}
      <div className="mt-4">
        <SectionBox
          title={
            <Space>
              <DatabaseOutlined />
              <span>Data Sources</span>
            </Space>
          }
          extra={null}
          footer={null}
          compact={true}
          variant="default"
          className=""
          bodyStyle={{}}
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
                    {/* Name + Region */}
                    <Space className="justify-between w-full">
                      <span className="font-medium">{src.name}</span>
                      <Tag>{src.region}</Tag>
                    </Space>

                    {/* Description */}
                    <Text type="secondary">{src.description}</Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </SectionBox>
      </div>
    </div>
  );
}
