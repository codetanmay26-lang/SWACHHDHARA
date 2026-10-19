import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Activity, ArrowDown, ArrowRight, Bell, Check, ChevronDown, CircleHelp,
  Droplets, Gauge, Leaf, Menu, Radio, RotateCcw, Shield, ShieldAlert,
  Thermometer, Waves, WifiOff, X, Sprout,
  CircleCheck, CircleAlert, ClipboardCheck, Eye, Signal, Settings2,
} from 'lucide-react';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

type ScenarioId = 'normal' | 'fill' | 'abnormal' | 'sensor' | 'containment';
type Status = 'normal' | 'attention' | 'critical' | 'degraded';
type Metric = { id: string; label: string; value: number | null; unit: string; status: string; tone: string; desc: string; data: number[] };
type Scenario = {
  id: ScenarioId; name: string; short: string; description: string; severity: Status;
  headline: string; alert: string; recommendation: string; timestamp: string;
  risk: 'low' | 'elevated' | 'high'; metrics: Metric[]; events: { text: string; time: string; tone?: string }[];
};

const HOURS = ['00', '03', '06', '09', '12', '15', '18', '21'];
const scenarios: Record<ScenarioId, Scenario> = {
  normal: {
    id: 'normal', name: 'Normal Operation', short: 'Baseline conditions',
    description: 'Plausible baseline readings. No simulated condition currently calls for an intervention.',
    severity: 'normal', headline: 'Operating normally',
    alert: 'No critical alert. Continue routine monitoring and scheduled inspection.',
    recommendation: 'Continue routine monitoring',
    timestamp: 'Demo sequence · baseline',
    risk: 'low',
    metrics: [
      { id: 'ph', label: 'pH', value: 7.1, unit: 'pH', status: 'Within demo range', tone: 'ok', desc: 'Operational reading only; not a treatment outcome.', data: [6.9, 7.0, 7.0, 7.2, 7.1, 7.2, 7.1, 7.1] },
      { id: 'temp', label: 'Temperature', value: 28.4, unit: '°C', status: 'Stable', tone: 'ok', desc: 'Local condition; does not prove pathogen reduction.', data: [27.2, 27.6, 27.9, 28.1, 28.8, 29.1, 28.7, 28.4] },
      { id: 'moisture', label: 'Moisture', value: 64, unit: '%', status: 'Within demo range', tone: 'ok', desc: 'Illustrative moisture reading for the media zone.', data: [61, 63, 62, 64, 66, 65, 63, 64] },
      { id: 'fill', label: 'Fill level', value: 38, unit: '%', status: 'Routine', tone: 'ok', desc: 'Illustrative fill estimate; inspect on site as needed.', data: [32, 33, 34, 35, 35, 36, 37, 38] },
    ],
    events: [
      { text: 'Baseline scenario loaded for demonstration.', time: 'DEMO EVENT' },
      { text: 'All four illustrative readings available.', time: 'SENSOR PANEL' },
      { text: 'Routine inspection remains the recommended practice.', time: 'MAINTENANCE' },
    ],
  },
  fill: {
    id: 'fill', name: 'High Fill Level', short: 'Service attention',
    description: 'A high fill reading illustrates how the interface can surface a possible inspection or servicing need.',
    severity: 'attention', headline: 'High fill level detected',
    alert: 'Fill level is elevated in this scenario. This reading may warrant an onsite inspection or servicing plan.',
    recommendation: 'Inspect containment and plan appropriate emptying or maintenance.',
    timestamp: 'Demo sequence · fill alert',
    risk: 'elevated',
    metrics: [
      { id: 'ph', label: 'pH', value: 7.1, unit: 'pH', status: 'Within demo range', tone: 'ok', desc: 'Operational reading only; not a treatment outcome.', data: [6.9, 7.0, 7.0, 7.2, 7.1, 7.2, 7.1, 7.1] },
      { id: 'temp', label: 'Temperature', value: 28.4, unit: '°C', status: 'Stable', tone: 'ok', desc: 'Local condition; does not prove pathogen reduction.', data: [27.2, 27.6, 27.9, 28.1, 28.8, 29.1, 28.7, 28.4] },
      { id: 'moisture', label: 'Moisture', value: 64, unit: '%', status: 'Within demo range', tone: 'ok', desc: 'Illustrative moisture reading for the media zone.', data: [61, 63, 62, 64, 66, 65, 63, 64] },
      { id: 'fill', label: 'Fill level', value: 87, unit: '%', status: 'Attention', tone: 'warn', desc: 'High fill may require onsite inspection or servicing.', data: [51, 54, 58, 61, 66, 72, 80, 87] },
    ],
    events: [
      { text: 'Fill level crossed the illustrative attention threshold.', time: 'DEMO EVENT', tone: 'warn' },
      { text: 'Inspection or servicing plan recommended.', time: 'MAINTENANCE', tone: 'warn' },
      { text: 'Other simulated measurements remain at baseline.', time: 'SENSOR PANEL' },
    ],
  },
  abnormal: {
    id: 'abnormal', name: 'Abnormal Conditions', short: 'Reading outside range',
    description: 'An unusual pH reading is used to demonstrate a condition that should be checked, not diagnosed remotely.',
    severity: 'attention', headline: 'Unusual pH reading',
    alert: 'The simulated pH value is outside this demo’s illustrative range. Verify the reading and inspect the treatment unit.',
    recommendation: 'Inspect the treatment unit and verify sensor readings.',
    timestamp: 'Demo sequence · pH alert',
    risk: 'elevated',
    metrics: [
      { id: 'ph', label: 'pH', value: 9.2, unit: 'pH', status: 'Attention', tone: 'warn', desc: 'Unusual illustrative value; verify with an appropriate method.', data: [7.0, 7.1, 7.0, 7.3, 7.5, 8.1, 8.8, 9.2] },
      { id: 'temp', label: 'Temperature', value: 28.4, unit: '°C', status: 'Stable', tone: 'ok', desc: 'Local condition; does not prove pathogen reduction.', data: [27.2, 27.6, 27.9, 28.1, 28.8, 29.1, 28.7, 28.4] },
      { id: 'moisture', label: 'Moisture', value: 64, unit: '%', status: 'Within demo range', tone: 'ok', desc: 'Illustrative moisture reading for the media zone.', data: [61, 63, 62, 64, 66, 65, 63, 64] },
      { id: 'fill', label: 'Fill level', value: 38, unit: '%', status: 'Routine', tone: 'ok', desc: 'Illustrative fill estimate; inspect on site as needed.', data: [32, 33, 34, 35, 35, 36, 37, 38] },
    ],
    events: [
      { text: 'Unusual pH value shown in the scenario.', time: 'DEMO EVENT', tone: 'warn' },
      { text: 'Verify the sensor reading before interpreting conditions.', time: 'VERIFY', tone: 'warn' },
      { text: 'Treatment performance cannot be inferred from this reading.', time: 'LIMITATION' },
    ],
  },
  sensor: {
    id: 'sensor', name: 'Sensor Failure', short: 'Degraded monitoring',
    description: 'The pH sensor is shown as unavailable. The interface withholds its reading rather than substituting a value.',
    severity: 'degraded', headline: 'Sensor unavailable',
    alert: 'No pH reading is available in this scenario. Monitoring is degraded until the sensor and its connection are inspected.',
    recommendation: 'Inspect the pH sensor and its connection; do not infer a missing value.',
    timestamp: 'Demo sequence · sensor offline',
    risk: 'elevated',
    metrics: [
      { id: 'ph', label: 'pH', value: null, unit: 'pH', status: 'Unavailable', tone: 'bad', desc: 'No reading. The value is intentionally not estimated.', data: [7.0, 7.1, 7.0, 7.2, 7.1, 7.0, 7.1, 7.1] },
      { id: 'temp', label: 'Temperature', value: 28.4, unit: '°C', status: 'Available', tone: 'ok', desc: 'Local condition; does not prove pathogen reduction.', data: [27.2, 27.6, 27.9, 28.1, 28.8, 29.1, 28.7, 28.4] },
      { id: 'moisture', label: 'Moisture', value: 64, unit: '%', status: 'Available', tone: 'ok', desc: 'Illustrative moisture reading for the media zone.', data: [61, 63, 62, 64, 66, 65, 63, 64] },
      { id: 'fill', label: 'Fill level', value: 38, unit: '%', status: 'Available', tone: 'ok', desc: 'Illustrative fill estimate; inspect on site as needed.', data: [32, 33, 34, 35, 35, 36, 37, 38] },
    ],
    events: [
      { text: 'pH sensor marked unavailable in the demo.', time: 'DEMO EVENT', tone: 'warn' },
      { text: 'No estimated or substituted pH value is displayed.', time: 'DATA QUALITY' },
      { text: 'Inspect sensor and connection before relying on monitoring.', time: 'MAINTENANCE', tone: 'warn' },
    ],
  },
  containment: {
    id: 'containment', name: 'Containment Concern', short: 'Simulated risk flag',
    description: 'A simulated risk flag highlights a potential concern; it is not a direct measurement or evidence of leakage.',
    severity: 'critical', headline: 'Containment concern flagged',
    alert: 'SIMULATED RISK FLAG — this is not direct proof of leakage. Inspect containment and assess the surrounding site.',
    recommendation: 'Inspect containment and assess the surrounding site for potential leakage risks.',
    timestamp: 'Demo sequence · risk flag',
    risk: 'high',
    metrics: [
      { id: 'ph', label: 'pH', value: 7.1, unit: 'pH', status: 'Within demo range', tone: 'ok', desc: 'Operational reading only; not a treatment outcome.', data: [6.9, 7.0, 7.0, 7.2, 7.1, 7.2, 7.1, 7.1] },
      { id: 'temp', label: 'Temperature', value: 28.4, unit: '°C', status: 'Stable', tone: 'ok', desc: 'Local condition; does not prove pathogen reduction.', data: [27.2, 27.6, 27.9, 28.1, 28.8, 29.1, 28.7, 28.4] },
      { id: 'moisture', label: 'Moisture', value: 64, unit: '%', status: 'Within demo range', tone: 'ok', desc: 'Illustrative moisture reading for the media zone.', data: [61, 63, 62, 64, 66, 65, 63, 64] },
      { id: 'fill', label: 'Fill level', value: 38, unit: '%', status: 'Routine', tone: 'ok', desc: 'Illustrative fill estimate; inspect on site as needed.', data: [32, 33, 34, 35, 35, 36, 37, 38] },
    ],
    events: [
      { text: 'Containment risk flag activated for this scenario.', time: 'DEMO EVENT', tone: 'critical' },
      { text: 'Risk flag is simulated and is not a leakage measurement.', time: 'LIMITATION', tone: 'critical' },
      { text: 'Onsite inspection and site assessment recommended.', time: 'MAINTENANCE', tone: 'warn' },
    ],
  },
};

const componentInfo = [
  { id: 'containment', name: 'Containment structure', purpose: 'Holds the onsite system together as a retrofit-oriented containment concept.', contribution: 'Provides the physical boundary in which the proposed treatment approach sits.', caveat: 'Installation and site suitability require assessment; no field performance is established.' },
  { id: 'cartridge', name: 'Bio-treatment cartridge', purpose: 'A replaceable modular unit intended to support biological treatment using porous media and beneficial microbes.', contribution: 'Makes the treatment media concept modular and serviceable.', caveat: 'Treatment outcomes require laboratory and field validation.' },
  { id: 'media', name: 'Porous media & microbes', purpose: 'Proposed media and beneficial microbes form the biological treatment concept.', contribution: 'Provides a habitat and treatment medium within the cartridge.', caveat: 'No pathogen removal, faster stabilization, or nutrient recovery is claimed as proven.' },
  { id: 'liner', name: 'Containment liner & filtration', purpose: 'Intended to improve containment and reduce the risk of leakage.', contribution: 'Adds a proposed boundary and filtration layer below the treatment unit.', caveat: 'Actual environmental protection must be validated through field testing.' },
  { id: 'sensors', name: 'Sensor system', purpose: 'Represents pH, temperature, moisture, and fill-level monitoring.', contribution: 'Supplies simulated operational readings for status and maintenance alerts.', caveat: 'Readings shown here are simulated and cannot demonstrate treatment efficacy.' },
  { id: 'edge', name: 'ESP32 / edge unit', purpose: 'Represents the proposed local monitoring and data-processing component.', contribution: 'Illustrates how readings could be processed locally and communicated.', caveat: 'This prototype has no connected hardware or live IoT feed.' },
];
const navItems = [
  ['Overview', 'overview'], ['System', 'system'], ['Monitoring', 'monitoring'],
  ['Process', 'process'], ['Demo', 'demo'], ['Cost', 'cost'], ['Impact', 'impact'],
];
const statusName: Record<Status, string> = { normal: 'Normal', attention: 'Attention', critical: 'Critical', degraded: 'Degraded monitoring' };
const storyStages = [
  { title: 'CONTAIN', sentence: 'A defined boundary holds the proposed onsite system together.' },
  { title: 'TREAT', sentence: 'A bio-treatment cartridge is intended to support treatment at source.' },
  { title: 'MONITOR', sentence: 'Four simulated readings flow to a proposed ESP32 edge unit.' },
  { title: 'PROTECT', sentence: 'Containment and filtration are intended to help manage environmental risk.' },
];
const storyIntro = { title: 'One system. Four stages.', sentence: 'A 12-second visual story, from onsite containment to a protection objective.' };

function Brand() {
  return <a href="#overview" className="brand" aria-label="SWACHHDHARA overview" data-testid="link-brand">
    <span className="brand-mark"><Droplets size={18} strokeWidth={2.2} /></span> SWACHHDHARA
  </a>;
}

function Cutaway({ onSelect, selected, compact = false, demoStage }: { onSelect?: (id: string) => void; selected?: string; compact?: boolean; demoStage?: number | null }) {
  const activate = (id: string) => onSelect?.(id);
  const hit = (id: string, label: string, children: ReactNode) => <g className={`svg-hit story-target story-target-${id}`} role={onSelect ? 'button' : undefined} tabIndex={onSelect ? 0 : undefined} aria-label={onSelect ? `Inspect ${label}` : undefined} aria-pressed={onSelect ? selected === id : undefined} data-testid={onSelect ? `cutaway-${id}` : undefined} onClick={onSelect ? () => activate(id) : undefined} onKeyDown={onSelect ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(id); } } : undefined}>{children}</g>;
  const demoClass = demoStage === undefined ? '' : 'demo-cutaway';
  const stageClass = demoStage === null || demoStage === undefined ? '' : `story-running stage-${demoStage}`;
  return <svg className={`cutaway ${demoClass} ${stageClass}`} viewBox="0 0 760 430" role="img" aria-label="Conceptual cutaway of a rural onsite sanitation treatment system">
    <defs>
      <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#c2a67d"/><stop offset="1" stopColor="#9a805f"/></linearGradient>
      <linearGradient id="water" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#a8e8de"/><stop offset=".52" stopColor="#75cabc"/><stop offset="1" stopColor="#a8e8de"/></linearGradient>
      <linearGradient id="tank" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e9f2e7"/><stop offset="1" stopColor="#c7d8cc"/></linearGradient>
      <pattern id="soilDots" width="24" height="20" patternUnits="userSpaceOnUse"><circle cx="4" cy="5" r="1" fill="#765d43" opacity=".24"/><circle cx="16" cy="14" r="1.4" fill="#f0d9b2" opacity=".42"/></pattern>
    </defs>
    <rect x="12" y="137" width="736" height="260" rx="19" fill="url(#soil)"/>
    <rect x="12" y="137" width="736" height="260" rx="19" fill="url(#soilDots)"/>
    <path d="M12 139 C85 130 125 146 203 137 S330 145 405 137 S541 144 618 137 S699 143 748 136 L748 155 L12 155Z" fill="#456b46"/>
    <path className="story-groundwater" d="M12 370 C120 352 219 381 334 363 S522 379 626 360 S708 369 748 358 L748 397 L12 397Z" fill="url(#water)" opacity=".95"/>
    <path className="story-groundwater" d="M12 370 C120 352 219 381 334 363 S522 379 626 360 S708 369 748 358" fill="none" stroke="#55aa9f" strokeWidth="2"/>
    <text x="32" y="387" fontSize="9" fill="#275b53" letterSpacing="1.5">GROUNDWATER · CONCEPTUAL</text>
    <g transform="translate(60 17)">
      <path d="M35 56 L94 8 L153 56 V125 H35Z" fill="#f4f0dc" stroke="#123d32" strokeWidth="3"/>
      <path d="M26 58 L94 1 L162 58" fill="none" stroke="#c8ff55" strokeWidth="7" strokeLinejoin="round"/>
      <rect x="53" y="68" width="33" height="57" rx="2" fill="#d8f5f4" stroke="#123d32" strokeWidth="2"/>
      <rect x="102" y="72" width="39" height="53" fill="#d6b577"/>
      <path d="M102 72 Q122 62 141 72" fill="none" stroke="#866f4f" strokeWidth="2"/>
      <path d="M118 124 V160" stroke="#123d32" strokeWidth="13"/>
      <path d="M111 125 H125" stroke="#f8f7ef" strokeWidth="3"/>
      <path d="M121 161 V179" stroke="#72cbbb" strokeWidth="2" strokeDasharray="4 5" className="soil-flow"/>
      <text x="93" y="47" fontSize="8" fill="#123d32" fontWeight="700">RURAL TOILET</text>
    </g>
    {hit('containment', 'containment structure', <>
      <rect className="hit-outline" x="219" y="180" width="200" height="176" rx="22" fill="url(#tank)" stroke="#f3f5e9" strokeWidth="3"/>
      <rect x="235" y="194" width="168" height="140" rx="15" fill="#d9e6d8" stroke="#6d8d78" strokeWidth="2"/>
      <path d="M220 181 Q319 160 418 181" fill="none" stroke="#eff4e9" strokeWidth="4"/>
      <text x="262" y="217" fontSize="10" fill="#325345" fontWeight="700">CONTAINMENT</text>
    </>)}
    {hit('cartridge', 'bio-treatment cartridge', <>
      <rect className="hit-outline" x="253" y="230" width="132" height="77" rx="10" fill="#b7d9ad" stroke="#678d64" strokeWidth="2"/>
      <rect x="265" y="240" width="108" height="56" rx="7" fill="#e2edd6"/>
      <path d="M275 249 l8 6 -5 8 -8 -6z M307 245 l7 9 -8 6 -6 -9z M342 252 l8 6 -7 8 -8 -5z M296 275 l9 5 -5 8 -9 -5z M350 276 l7 5 -6 8 -8 -5z" fill="#758b67"/>
      <circle cx="292" cy="258" r="2" fill="#88b95d"/><circle cx="331" cy="277" r="2" fill="#88b95d"/>
      <text x="275" y="325" fontSize="8" fill="#345844" fontWeight="700">BIO-TREATMENT CARTRIDGE</text>
    </>)}
    {hit('media', 'porous media and beneficial microbes', <>
      <rect className="hit-outline" x="273" y="246" width="91" height="34" rx="5" fill="transparent" stroke="transparent"/>
      <circle cx="281" cy="255" r="3" fill="#9aba72"/><circle cx="312" cy="254" r="3" fill="#a7c87e"/><circle cx="344" cy="267" r="3" fill="#91b46d"/>
      <path d="M286 258 l5 -5 M319 262 l5 5 M335 250 l-4 5" stroke="#88ad72" strokeWidth="1.5"/>
    </>)}
    {hit('liner', 'containment liner and filtration layer', <>
      <path className="hit-outline" d="M229 185 V340 Q229 351 244 351 H393 Q408 351 408 340 V185" fill="none" stroke="#f5f3da" strokeWidth="5"/>
      <rect x="244" y="337" width="139" height="11" rx="5" fill="#dde8ca" stroke="#648970" strokeWidth="1"/>
      <path d="M250 342 h10 M268 342 h10 M286 342 h10 M304 342 h10 M322 342 h10 M340 342 h10 M358 342 h10" stroke="#94a87c" strokeWidth="2"/>
    </>)}
    {hit('sensors', 'sensor system', <>
      <line x1="363" y1="251" x2="450" y2="251" stroke="#c8ff55" strokeWidth="2" strokeDasharray="5 4"/>
      <circle className="sensor-story-point point-ph" cx="363" cy="251" r="5" fill="#c8ff55"/><circle className="sensor-pulse" cx="363" cy="251" r="8" fill="none" stroke="#c8ff55" strokeWidth="1"/>
      <line x1="382" y1="281" x2="449" y2="289" stroke="#92d4c5" strokeWidth="2" strokeDasharray="5 4"/>
      <circle className="sensor-story-point point-temperature" cx="382" cy="281" r="4" fill="#f0b45b"/>
      <circle className="sensor-story-point point-moisture" cx="375" cy="264" r="4" fill="#7ce0cb"/>
      <circle className="sensor-story-point point-fill" cx="397" cy="236" r="4" fill="#ef9880"/>
      <rect x="455" y="230" width="113" height="72" rx="10" fill="#f0f4e9" stroke="#73917c" strokeWidth="1.5"/>
      <text x="468" y="249" fontSize="8" fill="#345844" fontWeight="700">SENSOR POINTS</text>
      <text x="468" y="265" fontSize="8" fill="#60786a">pH · temp · moisture</text>
      <text x="468" y="280" fontSize="8" fill="#60786a">fill level</text>
      <text x="468" y="293" fontSize="7" fill="#849486">SIMULATED INDICATORS</text>
    </>)}
    {hit('edge', 'ESP32 edge monitoring unit', <>
      <path d="M420 205 C470 190 516 185 561 183" fill="none" stroke="#8dd8c6" strokeWidth="2" strokeDasharray="4 5" className="soil-flow"/>
      <rect className="hit-outline" x="565" y="157" width="122" height="70" rx="11" fill="#174d40" stroke="#c8ff55" strokeWidth="1.5"/>
      <rect x="576" y="168" width="100" height="48" rx="7" fill="#225d4d"/>
      <circle cx="591" cy="186" r="4" fill="#c8ff55"/><circle cx="605" cy="186" r="4" fill="#73d2c5"/>
      <path d="M628 182 h28 M628 190 h20 M628 198 h24" stroke="#a9c5b5" strokeWidth="2"/>
      <text x="579" y="211" fontSize="7" fill="#e7f2e7">ESP32 · EDGE UNIT</text>
    </>)}
    <path d="M163 124 C205 154 224 176 263 229" fill="none" stroke="#8fdcc9" strokeWidth="2.5" strokeDasharray="6 7" className="soil-flow"/>
    <path d="M384 306 C422 323 449 331 474 344" fill="none" stroke="#b2efb4" strokeWidth="2" strokeDasharray="6 8" className="soil-flow"/>
    <g className="demo-flow-markers" aria-hidden="true">
      <circle className="demo-flow-marker treatment-marker" r="4" fill="#c8ff55"><animateMotion dur="2.2s" repeatCount="indefinite" path="M250 267 C278 253 297 276 320 260 S356 274 386 267"/></circle>
      <circle className="demo-flow-marker treatment-marker" r="3" fill="#e6ff9c"><animateMotion dur="2.2s" begin="1.1s" repeatCount="indefinite" path="M250 267 C278 253 297 276 320 260 S356 274 386 267"/></circle>
      <circle className="demo-flow-marker signal-marker" r="3.5" fill="#9bf2dc"><animateMotion dur="1.6s" repeatCount="indefinite" path="M363 251 C430 244 495 204 591 186"/></circle>
      <circle className="demo-flow-marker signal-marker" r="2.5" fill="#c8ff55"><animateMotion dur="1.6s" begin=".55s" repeatCount="indefinite" path="M363 251 C430 244 495 204 591 186"/></circle>
    </g>
    {!compact && <>
      <text x="28" y="172" fontSize="8" fill="#f3ecd6" letterSpacing="1">SOIL PROFILE</text>
      <path d="M115 170 h52" stroke="#f3ecd6" strokeWidth="1"/>
      <text x="578" y="241" fontSize="7" fill="#e7f2e7">LOCAL MONITORING</text>
      <text x="624" y="316" fontSize="8" fill="#f0e4c8">GROUND LAYER</text>
    </>}
  </svg>;
}

function MetricIcon({ id }: { id: string }) {
  if (id === 'ph') return <Droplets size={15} />;
  if (id === 'temp') return <Thermometer size={15} />;
  if (id === 'moisture') return <Waves size={15} />;
  return <Gauge size={15} />;
}

function StatusLabel({ scenario }: { scenario: Scenario }) {
  return <span className="monitor-chip" data-testid="status-operating">
    <span className={`status-dot ${scenario.severity}`} /> System <b>{statusName[scenario.severity]}</b>
  </span>;
}

function Sparkline({ data, tone }: { data: number[]; tone: string }) {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const points = data.map((n, i) => `${(i / (data.length - 1)) * 96},${25 - ((n - min) / range) * 19}`).join(' ');
  const color = tone === 'warn' ? '#f0b45b' : tone === 'bad' ? '#ef7660' : '#c8ff55';
  return <svg className="sparkline" viewBox="0 0 100 30" preserveAspectRatio="none" aria-label="Fixed illustrative trend">
    <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
  </svg>;
}

function MetricCard({ metric }: { metric: Metric }) {
  return <article className="metric-card" data-testid={`metric-${metric.id}`}>
    <div className="metric-heading"><span>{metric.label}</span><span className="metric-icon"><MetricIcon id={metric.id} /></span></div>
    <div className="metric-value"><strong>{metric.value === null ? '—' : metric.value}</strong><span>{metric.value === null ? 'No reading' : metric.unit}</span></div>
    <div className={`metric-status ${metric.tone}`}><span className={`status-dot ${metric.tone === 'warn' ? 'attention' : metric.tone === 'bad' ? 'critical' : ''}`} />{metric.status}</div>
    <Sparkline data={metric.data} tone={metric.tone} />
    <div className="metric-desc">{metric.desc}</div>
  </article>;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return <div className="chart-tooltip"><b>{label}:00</b>{payload.map(p => <div key={p.name}>{p.name}: {p.value}{p.name === 'Moisture' ? '%' : p.name === 'Temperature' ? '°C' : ''}</div>)}</div>;
}

function App() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>('normal');
  const [acknowledged, setAcknowledged] = useState(false);
  const [componentId, setComponentId] = useState('cartridge');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scenarioExpanded, setScenarioExpanded] = useState(false);
  const [storyStage, setStoryStage] = useState(0);
  const [storyPlaying, setStoryPlaying] = useState(false);
  const [storyStarted, setStoryStarted] = useState(false);
  const [storyComplete, setStoryComplete] = useState(false);
  const [storyRunId, setStoryRunId] = useState(0);
  const [activeSection, setActiveSection] = useState('overview');
  const [scrollProgress, setScrollProgress] = useState(0);
  const storyStartTimer = useRef<number | null>(null);
  const scenario = scenarios[scenarioId];
  const selectedComponent = componentInfo.find(item => item.id === componentId) ?? componentInfo[1];
  const currentStory = storyStarted ? storyStages[storyStage] : storyIntro;
  const chartData = useMemo(() => HOURS.map((hour, i) => ({
    hour, pH: scenario.metrics[0].data[i], Temperature: scenario.metrics[1].data[i],
    Moisture: scenario.metrics[2].data[i], Fill: scenario.metrics[3].data[i],
  })), [scenario]);
  const chooseScenario = (id: ScenarioId) => { setScenarioId(id); setAcknowledged(false); };
  const jumpTo = (id: string) => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };
  const startStory = () => {
    setStoryStarted(true);
    setStoryComplete(false);
    setStoryStage(0);
    setStoryPlaying(true);
    setStoryRunId(id => id + 1);
  };
  const runDemo = () => {
    setMenuOpen(false);
    setScenarioExpanded(false);
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (storyStartTimer.current !== null) window.clearTimeout(storyStartTimer.current);
    storyStartTimer.current = window.setTimeout(startStory, 700);
  };

  useEffect(() => {
    if (!storyPlaying) return;
    const timer = window.setTimeout(() => {
      if (storyStage >= storyStages.length - 1) {
        setStoryPlaying(false);
        setStoryComplete(true);
      } else {
        setStoryStage(storyStage + 1);
      }
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [storyPlaying, storyStage, storyRunId]);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const ids = navItems.map(item => item[1]);
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: '-20% 0px -65% 0px', threshold: [0, .2, .5] });
    ids.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
    }), { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    const process = document.querySelector('.process-grid');
    const processObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); processObserver.disconnect(); }
    }), { threshold: .3 });
    if (process) processObserver.observe(process);
    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
      revealObserver.disconnect();
      processObserver.disconnect();
      if (storyStartTimer.current !== null) window.clearTimeout(storyStartTimer.current);
    };
  }, []);

  return <div className="page-shell">
    <nav className="nav" aria-label="Main navigation">
      <div className="wrap nav-inner">
        <Brand />
        <div className={`nav-links ${menuOpen ? 'open' : ''}`} id="main-navigation">
          {navItems.map(([label, id]) => <a key={id} className={activeSection === id ? 'active' : ''} href={`#${id}`} onClick={() => setMenuOpen(false)} data-testid={`nav-${id}`}>{label}</a>)}
        </div>
        <button className="btn btn-dark nav-cta" onClick={runDemo} disabled={storyPlaying} data-testid="button-nav-demo">
          {storyPlaying ? <><span className="btn-spinner" />Demo Running</> : storyStarted ? <>Run Demo <ArrowRight size={14} /></> : <>Start Demo <ArrowRight size={14} /></>}
        </button>
        <button className="mobile-toggle" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)} data-testid="button-mobile-menu">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
      </div>
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} aria-hidden="true" />
    </nav>

    <header className="hero" id="overview">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <div className="eyebrow hero-kicker">Rural sanitation · Water protection</div>
          <h1>Treat at Source.<br /><em>Protect</em> Every Drop.</h1>
          <p className="hero-sub">A modular, monitored onsite sanitation concept designed to support safer excreta treatment, smarter maintenance, and protection of rural water resources.</p>
          <div className="hero-actions">
            <button className="btn btn-lime" onClick={() => jumpTo('system')} data-testid="button-explore-system">Explore the system <ArrowDown size={15} /></button>
            <button className="btn btn-outline" onClick={runDemo} disabled={storyPlaying} data-testid="button-hero-demo">
              {storyPlaying ? <><span className="btn-spinner" />Demo Running</> : storyStarted ? <>Run Demo <ArrowRight size={15} /></> : <>Start Demo <ArrowRight size={15} /></>}
            </button>
          </div>
          <div className="hero-tags">
            <span className="pill pill-team"><span className="dot" /> Team Tech Saarthi</span>
            <span className="pill">Smart India Hackathon 2026</span>
            <span className="pill">SIH Problem Statement 26256</span>
          </div>
        </div>
        <div className="hero-art">
          <Cutaway compact />
          <div className="hero-footnote">CONCEPTUAL SYSTEM ILLUSTRATION · NOT TO SCALE</div>
        </div>
      </div>
      <div className="wrap signal-line" aria-hidden="true" />
    </header>

    <main>
      <section className="section system-section" id="system">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow">01 / The system</div>
            <h2>Designed to fit<br />below the surface.</h2>
            <p>A retrofit-friendly concept brings containment, a modular treatment unit, filtration and simulated monitoring into one clear system. Select a component to explore its proposed role.</p>
          </div>
          <div className="system-grid reveal">
            <div className="illustration-panel">
              <div className="illustration-top"><span>Conceptual system illustration</span><span>SELECT A COMPONENT <ChevronDown size={12} /></span></div>
              <Cutaway onSelect={setComponentId} selected={componentId} />
              <div className="mobile-cutaway-caption">Illustrative cutaway · tap a component below to read its proposed role.</div>
              <div className="legend"><span><i />Containment</span><span><i style={{ background: '#8cb46c' }} />Treatment media</span><span><i style={{ background: '#73d4c6' }} />Monitoring pathway</span><span><i style={{ background: '#75cabc' }} />Groundwater layer</span></div>
            </div>
            <aside className="system-side" aria-live="polite" data-testid="component-info">
              <div className="eyebrow">Component / {String(componentInfo.findIndex(item => item.id === componentId) + 1).padStart(2, '0')}</div>
              <h3>{selectedComponent.name}</h3>
              <p>{selectedComponent.purpose}</p>
              <div style={{ marginTop: 16 }}>
                <div className="eyebrow" style={{ color: '#668b6d' }}>Contribution</div>
                <p style={{ marginTop: 8 }}>{selectedComponent.contribution}</p>
              </div>
              <div style={{ marginTop: 16 }}>
                <div className="eyebrow" style={{ color: '#a5753c' }}>Caveat</div>
                <p style={{ marginTop: 8 }}>{selectedComponent.caveat}</p>
              </div>
              <div className="component-index" aria-label="System components">
                {componentInfo.map((item, index) => <button key={item.id} className={`component-option ${componentId === item.id ? 'selected' : ''}`} onClick={() => setComponentId(item.id)} aria-pressed={componentId === item.id} data-testid={`component-select-${item.id}`}>
                  <span><span className="number">{String(index + 1).padStart(2, '0')}</span>{item.name}</span><ArrowRight size={13} />
                </button>)}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="monitor-section" id="monitoring">
        <div className="sim-ribbon"><Radio size={14} /> SIMULATED DATA — NO HARDWARE CONNECTED <span aria-hidden="true">·</span> PROTOTYPE DISPLAY</div>
        <div className="section wrap">
          <div className="section-head reveal">
            <div className="eyebrow">02 / Monitoring concept</div>
            <h2>A clearer view<br />of what needs attention.</h2>
            <p>Operational readings can help surface conditions for inspection. They are not proof of treatment effectiveness, pathogen removal, or groundwater safety.</p>
          </div>
          <div className="monitor-topline">
            <StatusLabel scenario={scenario} />
            <span className="monitor-chip"><span className={scenarioId === 'sensor' ? 'status-dot attention' : 'status-dot'} /> Sensors <b>{scenarioId === 'sensor' ? '3 / 4 available' : '4 / 4 simulated'}</b></span>
            <span className="monitor-chip"><span className="status-dot" /> Edge unit <b>Concept only</b></span>
            <span className="monitor-chip"><Activity size={12} /> Latest event <b>{scenario.timestamp}</b></span>
          </div>
          <div className="metrics-grid">{scenario.metrics.map(metric => <MetricCard key={metric.id} metric={metric} />)}</div>
          <div className="monitor-lower">
            <article className="chart-card">
              <div className="card-head"><div><h3>Illustrative readings · 24 hours</h3><p>Fixed scenario dataset · 3-hour intervals · no live data</p></div><div className="chart-legend"><span>pH</span><span>Moisture</span></div></div>
              <div className="chart-wrap" data-testid="chart-history">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 12, right: 4, left: -22, bottom: 0 }}>
                    <defs><linearGradient id="phFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c8ff55" stopOpacity=".2" /><stop offset="95%" stopColor="#c8ff55" stopOpacity="0" /></linearGradient><linearGradient id="moistFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6ad4c7" stopOpacity=".17" /><stop offset="95%" stopColor="#6ad4c7" stopOpacity="0" /></linearGradient></defs>
                    <CartesianGrid stroke="rgba(222,242,230,.1)" vertical={false} />
                    <XAxis dataKey="hour" tickFormatter={value => `${value}:00`} tick={{ fill: '#99b4a5', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fill: '#99b4a5', fontSize: 9 }} axisLine={false} tickLine={false} domain={scenarioId === 'abnormal' ? [6, 10] : [6, 8]} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#99b4a5', fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={value => `${value}%`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area yAxisId="left" type="monotone" dataKey="pH" stroke="#c8ff55" strokeWidth={2} fill="url(#phFill)" dot={false} activeDot={{ r: 4, fill: '#c8ff55', stroke: '#123d32' }} isAnimationActive={false} />
                    <Area yAxisId="right" type="monotone" dataKey="Moisture" stroke="#6ad4c7" strokeWidth={2} fill="url(#moistFill)" dot={false} activeDot={{ r: 4, fill: '#6ad4c7', stroke: '#123d32' }} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend"><span>pH (left axis)</span><span>Moisture (right axis)</span></div>
            </article>
            <aside className="feed-card">
              <div className="card-head"><div><h3>Recent activity</h3><p>Scenario-specific demo events</p></div><Bell size={16} color="#c8ff55" /></div>
              <div className="feed-list">{scenario.events.map((event, index) => <div className={`feed-item ${event.tone ?? ''}`} key={`${event.time}-${index}`}><i /><div>{event.text}<time>{event.time}</time></div></div>)}</div>
              <div className="bottom-status">
                <div className="mini-status"><small>Monitoring status</small><strong>{statusName[scenario.severity]}</strong></div>
                <div className="mini-status"><small>Sensor availability</small><strong>{scenarioId === 'sensor' ? '1 unavailable' : 'All simulated'}</strong></div>
              </div>
              <div className={`risk-box ${scenario.risk === 'low' ? 'good' : ''}`} data-testid="risk-flag">
                <strong>Containment-risk indicator · {scenario.risk === 'low' ? 'Low' : scenario.risk === 'high' ? 'Flagged' : 'Attention'}</strong>
                <p>{scenario.risk === 'low' ? 'Simulated status only. This is not direct proof of containment integrity.' : scenarioId === 'containment' ? 'Simulated risk flag, not direct measurement or proof of leakage.' : 'Scenario flag only; this is not direct measurement of leakage.'}</p>
              </div>
            </aside>
          </div>

        </div>
      </section>

      <section className="section process-section" id="process">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow">03 / The approach</div>
            <h2>Four stages.<br />One accountable loop.</h2>
            <p>Monitoring can guide attention. Treatment outcomes remain a separate question—one that requires laboratory and field validation.</p>
          </div>
          <div className="process-grid">
            <article className="process-stage"><span className="stage-icon"><Signal size={25} /></span><span className="stage-no">01 — SENSE</span><h3>Observe</h3><p>Sensors represent operational conditions such as pH, temperature, moisture, and fill level.</p></article>
            <article className="process-stage"><span className="stage-icon"><Eye size={25} /></span><span className="stage-no">02 — ASSESS</span><h3>Interpret</h3><p>The monitoring interface interprets simulated readings and identifies conditions that may require attention.</p></article>
            <article className="process-stage"><span className="stage-icon"><Sprout size={25} /></span><span className="stage-no">03 — TREAT</span><h3>Support</h3><p>The modular bio-treatment cartridge and proposed media are intended to support in-situ biological treatment.</p></article>
            <article className="process-stage"><span className="stage-icon"><Shield size={25} /></span><span className="stage-no">04 — PROTECT</span><h3>Maintain</h3><p>Containment, filtration, monitoring, and timely maintenance are intended to help manage environmental risks.</p></article>
          </div>

        </div>
      </section>

      <section className="section demo-section" id="demo">
        <div className="wrap">
          <article className="story-card" data-demo-complete={storyComplete} data-testid="demo-story">
            <div className="story-copy">
              <div className="eyebrow story-kicker">04 / THE 12-SECOND STORY</div>
              <div className="story-state" aria-live="polite" aria-atomic="true">
                <h2 data-testid="story-stage-title">{currentStory.title}</h2>
                <p data-testid="story-stage-sentence">{currentStory.sentence}</p>
              </div>
              <div className="story-readout">
                <span className={`story-live-dot ${storyPlaying ? 'on' : ''}`} aria-hidden="true" />
                {storyPlaying ? `STAGE 0${storyStage + 1} OF 04` : storyComplete ? 'STORY COMPLETE' : '12-SECOND CONCEPT DEMO'}
              </div>
              <div className="story-disclaimer"><Radio size={12} /> SIMULATED DATA · NO HARDWARE CONNECTED</div>
            </div>
            <div className="story-visual">
              <div className="story-scene-meta"><span>CONCEPTUAL CUTAWAY</span><span>NOT TO SCALE</span></div>
              <Cutaway compact demoStage={storyPlaying ? storyStage : null} />
            </div>
            {storyPlaying && <div className="story-playing-overlay" aria-hidden="true" />}
            <div className="story-bottom">
              <div className="story-chapters" role="list" aria-label="Demo stages">
                {storyStages.map((stage, index) => <span className={`story-chapter ${storyStarted && index < storyStage ? 'done' : ''} ${storyStarted && index === storyStage ? 'current' : ''}`} role="listitem" aria-current={storyStarted && index === storyStage ? 'step' : undefined} key={stage.title}>
                  <i aria-hidden="true" />{stage.title}
                </span>)}
              </div>
              <button
                className="btn btn-lime story-replay"
                onClick={startStory}
                disabled={storyPlaying}
                aria-disabled={storyPlaying}
                data-testid="button-replay-demo"
              >
                {storyPlaying
                  ? <><span className="btn-spinner" />Demo Running</>
                  : storyStarted
                    ? <><RotateCcw size={15} />Replay Demo</>
                    : <><ArrowRight size={15} />Start Demo</>}
              </button>
            </div>
          </article>

          <div className="scenario-entry">
            <button className="scenario-entry-toggle" type="button" onClick={() => setScenarioExpanded(!scenarioExpanded)} aria-expanded={scenarioExpanded} aria-controls="scenario-explorer" data-testid="button-view-scenarios">
              <span>View Interactive Scenarios</span><ChevronDown size={16} className={scenarioExpanded ? 'turned' : ''} />
            </button>
            <div className="scenario-explorer" id="scenario-explorer" hidden={!scenarioExpanded}>
              <div className="scenario-intro">
                <div><div className="eyebrow">OPTIONAL DEEPER DIVE</div><h3>Explore five operating conditions</h3></div>
                <p>Fixed local readings only. Choosing a scenario updates the monitoring display consistently.</p>
              </div>
              <div className="demo-layout">
                <aside className="scenario-panel">
                  <div className="eyebrow">Choose a scenario</div>
                  <h3>Make the signal matter.</h3>
                  <p>Each selection updates the readings, status, alert, event history and recommended action together.</p>
                  <div className="scenario-list" role="group" aria-label="Simulation scenarios" data-testid="scenario-controls">
                    {(Object.values(scenarios)).map((item, index) => <button key={item.id} className="scenario-button" aria-pressed={scenarioId === item.id} onClick={() => chooseScenario(item.id)} data-testid={`scenario-${item.id}`}>
                      <span className="scenario-num">0{index + 1}</span>{item.name}{scenarioId === item.id && <Check size={14} style={{ marginLeft: 'auto' }} />}
                    </button>)}
                  </div>
                  <div className="scenario-description" aria-live="polite" data-testid="scenario-description">
                    <small>{scenario.short}</small><p>{scenario.description}</p>
                  </div>
                  <div className="scenario-controls">
                    <button className="btn btn-lime btn-small" onClick={() => setAcknowledged(true)} disabled={acknowledged} data-testid="button-acknowledge"><Check size={14} />{acknowledged ? 'Acknowledged' : 'Acknowledge alert'}</button>
                    <button className="btn btn-outline btn-small" onClick={() => chooseScenario('normal')} data-testid="button-reset"><RotateCcw size={14} />Reset demo</button>
                  </div>
                </aside>
                <div className="dashboard-column">
                  <article className="live-readout">
                    <div className="live-head">
                      <div><h3>Scenario response</h3><p data-testid="text-demo-timestamp">{scenario.timestamp} · fixed local data</p></div>
                      <span className={`severity ${scenario.severity}`} data-testid="status-severity">{statusName[scenario.severity]}</span>
                    </div>
                    <div className={`scenario-alert ${scenario.severity} ${acknowledged ? 'acknowledged' : ''}`} role="status" aria-live="polite" data-testid="alert-panel">
                      {scenario.severity === 'normal' ? <CircleCheck size={18} /> : scenario.severity === 'critical' ? <ShieldAlert size={18} /> : scenario.severity === 'degraded' ? <WifiOff size={18} /> : <CircleAlert size={18} />}
                      <div><strong>{acknowledged ? 'Alert acknowledged' : scenario.headline}</strong><p>{acknowledged ? `Acknowledged for this demonstration. ${scenario.alert}` : scenario.alert}</p></div>
                      {acknowledged && <span aria-label="Acknowledged"><Check size={16} /></span>}
                    </div>
                  </article>
                  <article className="recommend-card" data-testid="recommendation-panel">
                    <div className="card-head"><div><p>Recommended next action</p><h3>{scenario.recommendation}</h3></div><ClipboardCheck size={20} /></div>
                  </article>
                  <article className="event-history">
                    <div className="card-head"><div><h3>Recent events</h3><p>Updates with the selected scenario</p></div><Activity size={16} color="#688c60" /></div>
                    <div className="feed-list">{scenario.events.map((event, index) => <div className={`feed-item ${event.tone ?? ''}`} key={`${event.time}-${index}`}><i /><div>{event.text}<time>{event.time}</time></div></div>)}</div>
                  </article>
                  <p className="demo-warning">SIMULATED DATA — NO HARDWARE CONNECTED. The containment flag is a demonstration status, not direct proof of leakage.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section cost-section" id="cost">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow">05 / Rural feasibility</div>
            <h2>Built around practical<br />constraints.</h2>
            <p>Early project estimates outline a modular, retrofit-oriented concept—not supplier quotations or a validated bill of materials.</p>
          </div>
          <div className="cost-top">
            <div className="cost-total"><small>Estimated initial cost · per unit</small><strong>₹10,000–15,500</strong><span>PROJECT ESTIMATE · NOT A QUOTATION</span></div>
            <p className="cost-intro">The design objective is a staged, locally serviceable system. Component costs remain estimates and will vary with specifications, site conditions, sourcing, and installation requirements.</p>
          </div>
          <div className="cost-cards" aria-label="Estimated component cost ranges">
            {[
              ['Bio-treatment cartridge', '₹2,000–3,000', 68],
              ['Sensors and monitoring', '₹3,000–4,500', 82],
              ['Containment layer', '₹1,500–2,500', 58],
              ['Control unit', '₹2,000–3,000', 68],
              ['Installation', '₹1,000–2,000', 46],
            ].map(([label, cost, width], index) => <article className="cost-item" key={label} data-testid={`cost-item-${index}`}>
              <span>{label}</span><strong>{cost}</strong><div className="range-track"><i style={{ width: `${width}%` }} /></div>
            </article>)}
          </div>
          <div className="cost-disclosure" data-testid="cost-disclosure"><strong>Estimate disclosure:</strong> The component ranges above subtotal to ₹9,500–15,000. The supplied overall initial estimate is ₹10,000–15,500 per unit. Both figures are shown as provided; the difference is not assigned to an invented adjustment or contingency.</div>
          <div className="annual-maint"><span>Estimated annual maintenance / support</span><strong>₹1,000–2,000</strong></div>
          <div className="feasibility-grid">
            <article className="feasibility-card"><Settings2 size={18} /><h3>Technical feasibility</h3><p>Modular components, basic sensing, and an edge monitoring concept.</p></article>
            <article className="feasibility-card"><Leaf size={18} /><h3>Economic feasibility</h3><p>Estimated component costs and a retrofit-oriented design.</p></article>
            <article className="feasibility-card"><ClipboardCheck size={18} /><h3>Operational feasibility</h3><p>Routine monitoring, alerts, and maintenance recommendations.</p></article>
            <article className="feasibility-card"><ShieldAlert size={18} /><h3>Regulatory & environmental</h3><p>Requires appropriate site assessment, sanitation compliance, and validation before deployment.</p></article>
          </div>
          <p className="objective-line">Affordability, modularity, possible local manufacturing, and staged rural deployment are design objectives—not proven commercial results.</p>
        </div>
      </section>

      <section className="section impact-section" id="impact">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow">06 / Intended impact</div>
            <h2>More visibility.<br />Better decisions at source.</h2>
            <p>A village-scale deployment is a possibility to explore, not a deployment claim. System suitability depends on local sanitation needs, site assessment, and validation.</p>
          </div>
          <div className="impact-banner reveal">
            <svg className="village-art" viewBox="0 0 500 280" role="img" aria-label="Illustration of homes connected to a possible village-scale sanitation concept">
              <defs><linearGradient id="hill" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#4b8968"/><stop offset="1" stopColor="#285b47"/></linearGradient></defs>
              <path d="M0 194 Q92 136 190 185 T360 168 T500 160 V280 H0Z" fill="#1a4a3b"/>
              <path d="M0 222 Q140 168 256 216 T500 198 V280 H0Z" fill="url(#hill)"/>
              <path d="M31 166 L85 119 L142 166 V212 H31Z" fill="#f4f0dc"/><path d="M23 168 L85 111 L150 168" fill="none" stroke="#c8ff55" strokeWidth="7"/>
              <rect x="55" y="174" width="21" height="38" fill="#d7eee0"/><rect x="99" y="174" width="25" height="38" fill="#d6b577"/>
              <path d="M187 174 L234 132 L284 174 V215 H187Z" fill="#e8e8d6"/><path d="M179 176 L234 126 L292 176" fill="none" stroke="#79c7ae" strokeWidth="7"/>
              <rect x="207" y="184" width="21" height="31" fill="#b9dfd1"/><rect x="250" y="184" width="20" height="31" fill="#d4b77e"/>
              <path d="M343 175 L388 136 L434 175 V213 H343Z" fill="#f2efd9"/><path d="M335 176 L388 130 L442 176" fill="none" stroke="#c8ff55" strokeWidth="7"/>
              <rect x="363" y="184" width="20" height="29" fill="#b9dfd1"/><rect x="400" y="184" width="20" height="29" fill="#d6b577"/>
              <path d="M78 219 C129 244 191 231 230 242 S338 222 390 232" fill="none" stroke="#a8e5ce" strokeWidth="2" strokeDasharray="5 8"/>
              <circle cx="80" cy="219" r="5" fill="#c8ff55"/><circle cx="234" cy="242" r="5" fill="#c8ff55"/><circle cx="389" cy="232" r="5" fill="#c8ff55"/>
              <path d="M310 110 q-15 -24 3 -39 q7 19 1 28 q20 -12 31 -3 q-15 21 -35 14z" fill="#8bc39d" opacity=".8"/>
              <path d="M298 114 v28 M448 133 q-10 -17 2 -28 q6 13 1 21 q14 -9 22 -2 q-11 14 -25 9z" fill="#8bc39d" opacity=".75"/>
              <text x="23" y="267" fill="#b1ccbb" fontSize="8" letterSpacing="1.2" fontFamily="monospace">POSSIBLE VILLAGE-SCALE CONCEPT · NOT A DEPLOYMENT CLAIM</text>
            </svg>
            <div className="impact-copy">
              <div className="eyebrow">Potential reach</div><h2>Designed for context, not a one-size-fits-all.</h2>
              <p>These market figures are estimates from the project presentation. They are not independently verified market research or an adoption forecast.</p>
              <div className="market-row">
                <div className="market-stat"><strong>200M</strong><span>TAM · onsite systems</span></div>
                <div className="market-stat"><strong>50M</strong><span>SAM · households</span></div>
                <div className="market-stat"><strong>5M</strong><span>SOM · households</span></div>
              </div>
              <div className="market-disclaimer">Project presentation estimates · not independently verified.</div>
            </div>
          </div>
          <div className="benefits">
            <article className="benefit"><Droplets size={17} /><strong>Support for onsite treatment</strong><small>Proposed treatment approach at the point of generation.</small></article>
            <article className="benefit"><Eye size={17} /><strong>Operational visibility</strong><small>Simulated readings can make conditions easier to review.</small></article>
            <article className="benefit"><Bell size={17} /><strong>Earlier maintenance signals</strong><small>Designed to identify conditions that may need attention.</small></article>
            <article className="benefit"><Shield size={17} /><strong>Environmental risk management</strong><small>Intended through improved containment and timely maintenance.</small></article>
            <article className="benefit"><Waves size={17} /><strong>Potentially less sludge accumulation</strong><small>Target outcome requiring validation; no reduction is claimed.</small></article>
            <article className="benefit"><Sprout size={17} /><strong>Potential nutrient recovery</strong><small>Target outcome requiring laboratory and field validation.</small></article>
          </div>
          <div className="closing">
            <h2>Better sanitation starts where waste is generated.</h2>
            <button className="btn btn-dark" onClick={runDemo} data-testid="button-impact-demo">Explore the live demo <ArrowRight size={15} /></button>
          </div>
          <p className="objective-line">All potential treatment outcomes require validation. No guaranteed pathogen reduction, groundwater protection, quantified environmental benefit, or greenhouse-gas reduction is claimed.</p>
        </div>
      </section>
    </main>

    <footer className="footer">
      <div className="wrap">
        <div className="footer-main">
          <div>
            <Brand />
            <p style={{ color: '#a9c0b4', fontSize: 10, margin: '10px 0 0' }}>Rural sanitation and environmental protection</p>
          </div>
          <p className="footer-copy">
            Built by <strong style={{ color: '#c8ff55' }}>Team Tech Saarthi</strong> · Smart India Hackathon 2026<br />
            Problem Statement 26256 · Ministry of Jal Shakti
          </p>
        </div>
        <div className="footer-meta">
          <span>SWACHHDHARA · Team Tech Saarthi</span>
          <span>SIH 2026 · Concept Prototype</span>
        </div>
      </div>
    </footer>
  </div>;
}

export default App;
