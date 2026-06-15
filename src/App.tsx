import React, { useState, useEffect, useRef } from 'react';
import pptxgen from 'pptxgenjs';
import { 
  Leaf, 
  Globe, 
  Award, 
  BookOpen, 
  ShieldCheck, 
  TrendingDown, 
  Send, 
  Sparkles, 
  MapPin, 
  RotateCcw, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Zap, 
  Car, 
  Utensils, 
  Trash2, 
  Users, 
  CloudRain, 
  TrendingUp, 
  Gauge, 
  Lightbulb,
  ExternalLink,
  Presentation,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  X,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Interfaces
interface Risk {
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
}

interface MitigationStep {
  title: string;
  category: 'Energy' | 'Transport' | 'Food' | 'Waste';
  impactScore: 'Highly Significant' | 'Moderate' | 'Valuable';
  detail: string;
  actionSteps: string[];
  co2SavingsKg: number;
}

interface ClimatePlanResponse {
  regionalRisks: Risk[];
  mitigationPlan: MitigationStep[];
  educationalInsights: {
    localObservation: string;
    sdg13TargetMapping: string;
  };
  responsibleAIDisclaimer: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function App() {
  // Tab State: 'prototype' or 'ppt_slides'
  const [activeTab, setActiveTab] = useState<'prototype' | 'ppt_slides'>('prototype');

  // Internship Metadata (Customizable in PPT mode by student)
  const [studentName, setStudentName] = useState('Pavanateja Vemuri');
  const [collegeName, setCollegeName] = useState('Aditya Engineering College');
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);

  // Form inputs for localized climate profile
  const [city, setCity] = useState('Delhi');
  const [energySource, setEnergySource] = useState('Electricity (Coal/Thermal Grid)');
  const [commuteMode, setCommuteMode] = useState('Petrol/Diesel Car');
  const [commuteDistance, setCommuteDistance] = useState('30 km/day');
  const [dietType, setDietType] = useState('Balanced (Meat & Veg Mix)');
  const [wastePractice, setWastePractice] = useState('Standard landfilled / Unregulated');

  // Generated Plan & Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [climatePlan, setClimatePlan] = useState<ClimatePlanResponse | null>(null);
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your 1M1B EcoAction Assistant. Ask me anything about SDG 13 (Climate Action), compost methods, how carbon footprint calculation works, or sustainable ideas!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Dynamic initial mock configuration
  useEffect(() => {
    // Lazy trigger an initial profile analysis for Delhi to display a working dashboard on load
    handleFetchPlan(true); // use default/mock mechanism or backend
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleFetchPlan = async (isInitial = false) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/climate/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          energySource,
          commuteMode,
          commuteDistance,
          dietType,
          wastePractice
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setClimatePlan(data);
        // Reset completed checklist items
        setCompletedActions([]);
        if (!isInitial) {
          triggerToast('AI Climate Plan Generated Successfully!');
        }
      } else {
        console.error('Failed to translate climate plan');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  // Toggle action steps
  const toggleActionCompleted = (actionTitle: string, co2: number) => {
    if (completedActions.includes(actionTitle)) {
      setCompletedActions(completedActions.filter(a => a !== actionTitle));
      triggerToast(`Removed action: carbon footprint updated.`);
    } else {
      setCompletedActions([...completedActions, actionTitle]);
      triggerToast(`Action Activated! Offsetted -${co2} kg CO2e annually! 🌱`);
    }
  };

  // Calculate current emissions indicators Based on form selection (for visual feedback)
  const getEmissionsHeuristic = () => {
    let transportEmissions = 1200;
    if (commuteMode.includes('Car')) transportEmissions = 2400;
    if (commuteMode.includes('Electric')) transportEmissions = 850;
    if (commuteMode.includes('Public')) transportEmissions = 450;
    if (commuteMode.includes('Bicycle')) transportEmissions = 50;

    let energyEmissions = 1500;
    if (energySource.includes('Coal')) energyEmissions = 2600;
    if (energySource.includes('Solar')) energyEmissions = 300;
    if (energySource.includes('Hydro')) energyEmissions = 600;

    let foodEmissions = 1000;
    if (dietType.includes('High-Meat')) foodEmissions = 2100;
    if (dietType.includes('Vegetarian')) foodEmissions = 600;
    if (dietType.includes('Vegan')) foodEmissions = 400;

    let wasteEmissions = 400;
    if (wastePractice.includes('composting')) wasteEmissions = 80;

    return {
      Transport: transportEmissions,
      Energy: energyEmissions,
      Food: foodEmissions,
      Waste: wasteEmissions,
      Total: transportEmissions + energyEmissions + foodEmissions + wasteEmissions
    };
  };

  const initialHeuristics = getEmissionsHeuristic();

  // Subtract savings of completed actions
  const getCurrentCO2Reduction = () => {
    if (!climatePlan) return 0;
    return climatePlan.mitigationPlan
      .filter(p => completedActions.includes(p.title))
      .reduce((sum, current) => sum + current.co2SavingsKg, 0);
  };

  const calculatedSavings = getCurrentCO2Reduction();
  const baselineCO2Total = initialHeuristics.Total;
  const currentEmissionsValue = Math.max(0, baselineCO2Total - calculatedSavings);
  const reductionPercentage = Math.round((calculatedSavings / baselineCO2Total) * 100);

  // Send Chat message
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    const originalInput = userInput;
    setUserInput('');
    setIsSendingChat(true);

    try {
      const chatHistory = chatMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.content
      }));

      const res = await fetch('/api/climate/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: originalInput, history: chatHistory })
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error('Chat failed');
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: 'I encountered an issue consulting the ecological database. Please ensure your query relates to environmental action.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const getMarkdownSlidesText = () => {
    return `---
title: EcoAction AI Presentation Outline
author: ${studentName}
institution: ${collegeName}
sdg: SDG 13 (Climate Action)
internship: 1M1B AI for Sustainability Virtual Internship
date: ${new Date().toLocaleDateString()}
---

# SLIDE 1: Welcome & Submission Banner
## title: EcoAction AI: Localized Climate Action Planner & Impact Advisor
## focus: Academic SDG-13 Action Project
## institution: ${collegeName}
## candidate: ${studentName}

- **1M1B One Million One Billion Foundation Partnership**: Standard submission alignment with climate goals.
- **Academic Mission alignment**: Developed during the virtual academic cohort supporting AICTE sustainability indicators.
- **Decision support platform**: Designed to bridge raw local atmospheric vulnerabilities with immediate household lifestyle decisions.

---

# SLIDE 2: Problem Statement & Context
## title: The Core Sustainability Challenge
## focus: Empathize & Define

- **The Core Climatology Problem**: Power grids rely on carbon-intensive thermal assets. However, local residents are recommended generalized rules that do not match their specific meteorological stressors or regional energy profiles.
- **Identified Gaps**:
  * One-Size Strategies: Generalized climate rules fail to identify specific regional grid sources.
  * Lack of Perceived Immediacy: Communities do not engage in local adaptation without physical indicators.
  * Complexity Obstacles: Municipal directives on waste segregation are abstract or key details are obscured.
- **Target Demographics**:
  * Households intending to transition to active/compost streams.
  * Sustainability coordinators at Aditya Engineering College/institutions mapping collective impact.

---

# SLIDE 3: System Architecture & AI Pipeline
## title: System Architecture & AI Capabilities
## focus: Technical Workflow

- **Context Integration**: Accepts daily inputs on commute miles, energy fuels, waste sorting, and location coordinates.
- **Structured LLM Inference Engine**: Queries the Gemini 3.5 Flash model server-side, forcing standard compliant JSON schema mapping.
- **Adaptive Action Engine**: Automatically calculates carbon indicator meters, identifies physical climate risks, and drafts dynamic action steps.
- **Security Protocols**: Implements server-side lazy initialization to prevent browser API key exposure, maintaining strict security standards.

---

# SLIDE 4: Interactive Process Logic
## title: Integrated Prototype Logic Flow
## focus: Logic Flowchart

- **Step 1: Context Input Formulation**: Collects multidimensional parameters from the client.
- **Step 2: API Gateway Processing**: Relays JSON objects safely via local Express API proxy gateways.
- **Step 3: Climatological Inference**: Server executes prompt variables against high-performance climate models with responsible fallback routines if overloaded.
- **Step 4: Interactive Dashboard Render**: Compiles and renders localized physical risks, tailored offsets, and continuous RAG Chat Assistant recommendations.

---

# SLIDE 5: Responsible AI Ethics Compliance
## title: Mandatory Responsible AI Integration
## focus: Ethics & Compliance

- **Fairness & Objectivity**: Keeps recommendations objective, processing only geographic public climate hazards and generic EPA multipliers.
- **Algorithmic Transparency**: Distinctly flags all CO2e offsets as approximate estimates and renders clear AI Disclaimers in the main view.
- **Privacy Controls**: Never requests, logs, or stores personally identifying details like exact address or profile identifiers.
- **Physical Safety Guardrails**: Encourages physical actions (e.g. smart peaking or composting) strictly conditioned on local municipal sanitization codes and electrical safety rules.

---

# SLIDE 6: Expected Impact & SDG Target Alignment
## title: Expected Impact & SDG Goals Mapping
## focus: Impact Statement

- **SDG 13.3 Direct Contribution**: Increases ecological awareness and human mitigation capacities to support UN Target Agenda 2030.
- **Quantifiable Target Results**:
  * Direct household-level offset ranges of 350 to 1500 kg CO2e annually.
  * Direct localized organic waste redirection away from high-methane anaerobic landfill sites.
  * Strategic blueprint scalable and adaptable for higher educational organizations like Aditya Engineering College.
`;
  };

  const downloadMarkdownSlides = () => {
    const content = getMarkdownSlidesText();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `EcoAction_1M1B_SlideDeck_${studentName.replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Slide outline document downloaded successfully! 📄');
  };

  const copyMarkdownSlides = () => {
    const content = getMarkdownSlidesText();
    navigator.clipboard.writeText(content);
    triggerToast('Slides copied to clipboard! Ready to paste. 📋');
  };

  const downloadNativePPTX = () => {
    try {
      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_16x9';

      const brandEmerald = '065F46'; // Forest deep
      const brandDark = '0F172A'; // Slate 900
      const bgLight = 'F8FAFC'; // Slate 50
      const accentLight = 'D1FAE5'; // Emerald 100

      // SLIDE 1: Cover
      const s1 = pptx.addSlide();
      s1.background = { fill: brandDark };
      s1.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.5, fill: { color: brandEmerald } });
      s1.addText('1M1B AI for Sustainability Virtual Internship', {
        x: 0.8, y: 1.5, w: 10, h: 0.5,
        fontFace: 'Arial', fontSize: 16, color: 'D1FAE5', bold: true
      });
      s1.addText('EcoAction AI: Localized Climate Action Planner', {
        x: 0.8, y: 2.1, w: 11.5, h: 1.5,
        fontFace: 'Arial', fontSize: 32, color: 'FFFFFF', bold: true
      });
      s1.addText(`Student Profile:\nCreator: ${studentName}\nCollege: ${collegeName}\nFocus Target: UN SDG 13 (Climate Action)`, {
        x: 0.8, y: 4.8, w: 11, h: 1.2,
        fontFace: 'Arial', fontSize: 13, color: 'FFFFFF', lineSpacing: 20
      });

      // SLIDE 2: Problem Statement
      const s2 = pptx.addSlide();
      s2.background = { fill: bgLight };
      s2.addText('The Core Sustainability Challenge', {
        x: 0.8, y: 0.5, w: 11.5, h: 0.8,
        fontFace: 'Arial', fontSize: 24, color: brandDark, bold: true
      });
      s2.addText('How might we use AI to model intensely localized climate vulnerabilities so that city residents can implement highly specific, high-impact personal carbon mitigation plans?', {
        x: 0.8, y: 1.4, w: 11.4, h: 1.0,
        fontFace: 'Arial', fontSize: 14, color: '475569', italic: true
      });
      s2.addText('Identified Gaps:', {
        x: 0.8, y: 2.6, w: 11, h: 0.4,
        fontFace: 'Arial', fontSize: 16, color: brandEmerald, bold: true
      });
      s2.addText('• One-Size Specificity: Generalized rules fail to identify specific regional grid sources.\n• Lack of Immediacy: Communities do not engage without physical localized hazards.\n• Complexity Obstacles: Municipal directives on waste segregation are buried under jargon.', {
        x: 0.8, y: 3.1, w: 11.5, h: 1.5,
        fontFace: 'Arial', fontSize: 13, color: '1E293B', lineSpacing: 24
      });

      // SLIDE 3: Architecture
      const s3 = pptx.addSlide();
      s3.background = { fill: bgLight };
      s3.addText('System Architecture & GenAI Pipeline', {
        x: 0.8, y: 0.5, w: 11.5, h: 0.8,
        fontFace: 'Arial', fontSize: 24, color: brandDark, bold: true
      });
      s3.addText('1. Lifestyle Parameters', { x: 0.8, y: 1.5, w: 3.5, h: 0.4, fontFace: 'Arial', fontSize: 15, color: brandEmerald, bold: true });
      s3.addText('Captures real-world user metrics including energy grid mix, transit volume, dietary protein stream, and regional location coordinates.', { x: 0.8, y: 2.0, w: 3.5, h: 2.5, fontFace: 'Arial', fontSize: 12, color: '475569' });

      s3.addText('2. Server-side Gemini', { x: 4.8, y: 1.5, w: 3.5, h: 0.4, fontFace: 'Arial', fontSize: 15, color: brandEmerald, bold: true });
      s3.addText('Pipes structured variables to Gemini 3.5 Flash server-side. Forces JSON schema mapping to identify local meteorological weather risks.', { x: 4.8, y: 2.0, w: 3.5, h: 2.5, fontFace: 'Arial', fontSize: 12, color: '475569' });

      s3.addText('3. Adaption Engine', { x: 8.8, y: 1.5, w: 3.5, h: 0.4, fontFace: 'Arial', fontSize: 15, color: brandEmerald, bold: true });
      s3.addText('Calculates annual CO2 emissions indicators, produces motivational action cards with checklist items, and powers direct RAG chat expert guidance.', { x: 8.8, y: 2.0, w: 3.5, h: 2.5, fontFace: 'Arial', fontSize: 12, color: '475569' });

      // SLIDE 4: Flow
      const s4 = pptx.addSlide();
      s4.background = { fill: bgLight };
      s4.addText('Integrated Prototype Logic Flow', {
        x: 0.8, y: 0.6, w: 11.5, h: 0.8,
        fontFace: 'Arial', fontSize: 24, color: brandDark, bold: true
      });
      s4.addText('[Step 1: Input Setup]\nUser customizes their local energy/commute profile in UI.', { x: 0.8, y: 1.8, w: 2.6, h: 1.8, fontFace: 'Arial', fontSize: 12, color: 'FFFFFF', fill: { color: brandDark }, align: 'center' });
      s4.addText('[Step 2: API Gateway]\nJSON object securely posted to Express route helper.', { x: 3.8, y: 1.8, w: 2.6, h: 1.8, fontFace: 'Arial', fontSize: 12, color: '1E293B', fill: { color: accentLight }, align: 'center' });
      s4.addText('[Step 3: Synthesis]\nInference mapping regional indices & EPA carbon factors.', { x: 6.8, y: 1.8, w: 2.6, h: 1.8, fontFace: 'Arial', fontSize: 12, color: 'FFFFFF', fill: { color: brandEmerald }, align: 'center' });
      s4.addText('[Step 4: Interactive UI]\nDraws custom carbon ring gauges and actionable cards.', { x: 9.8, y: 1.8, w: 2.6, h: 1.8, fontFace: 'Arial', fontSize: 12, color: 'FFFFFF', fill: { color: '4B5563' }, align: 'center' });

      // SLIDE 5: Safety
      const s5 = pptx.addSlide();
      s5.background = { fill: bgLight };
      s5.addText('Mandatory Responsible AI Compliance', {
        x: 0.8, y: 0.5, w: 11.5, h: 0.8,
        fontFace: 'Arial', fontSize: 24, color: brandDark, bold: true
      });
      s5.addText('• Fairness & Objectivity:\nSystem maps risks purely based on geography and generic public scientific coefficients, avoiding any biological or demographic profiling.', {
        x: 0.8, y: 1.8, w: 5.4, h: 1.5,
        fontFace: 'Arial', fontSize: 12, color: '1E293B'
      });
      s5.addText('• Algorithmic Transparency:\nCalculated savings and offsets are explicitly designated as greenhouse estimations. An AI advisory disclaimer is included directly in result screens.', {
        x: 0.8, y: 3.4, w: 5.4, h: 1.5,
        fontFace: 'Arial', fontSize: 12, color: '1E293B'
      });
      s5.addText('• User Privacy Protection:\nNo sensitive personally identifiable keys, logs, or private data records are requested. Name configuration operates purely locally.', {
        x: 6.8, y: 1.8, w: 5.4, h: 1.5,
        fontFace: 'Arial', fontSize: 12, color: '1E293B'
      });
      s5.addText('• Dynamic Physical Safety:\nMitigation steps concerning household organic waste or smart energy peaking warn users to obey local municipal codes and electrical regulations first.', {
        x: 6.8, y: 3.4, w: 5.4, h: 1.5,
        fontFace: 'Arial', fontSize: 12, color: '1E293B'
      });

      // SLIDE 6: Impact
      const s6 = pptx.addSlide();
      s6.background = { fill: brandDark };
      s6.addText('Expected Impact & SDG Targets Mapping', {
        x: 0.8, y: 0.5, w: 11.5, h: 0.8,
        fontFace: 'Arial', fontSize: 24, color: 'FFFFFF', bold: true
      });
      s6.addText('Goal Mapping: SDG Target 13.3 (Build climate capacity & raise individual awareness)', {
        x: 0.8, y: 1.4, w: 11, h: 0.5,
        fontFace: 'Arial', fontSize: 14, color: 'D1FAE5', bold: true
      });
      s6.addText('1. Direct Household Offsets:\nReduces high-potency methane at local garbage storage by redirecting compost streams. Generates estimated annual offsets of 350 to 1,500 kg CO2e per household.', {
        x: 0.8, y: 2.2, w: 5.4, h: 1.8,
        fontFace: 'Arial', fontSize: 13, color: 'E2E8F0', lineSpacing: 22
      });
      s6.addText('2. Broad Institutional Scaling:\nActs as an adaptable blueprint easily deployed across student groups, communities, or campus committees like Aditya Engineering College to build local green targets.', {
        x: 6.8, y: 2.2, w: 5.4, h: 1.8,
        fontFace: 'Arial', fontSize: 13, color: 'E2E8F0', lineSpacing: 22
      });
      s6.addText(`Submitted on behalf of:\nIntern: ${studentName}\nInstitution: ${collegeName}`, {
        x: 0.8, y: 4.8, w: 11, h: 1.0,
        fontFace: 'Arial', fontSize: 14, color: '34D399', bold: true
      });

      pptx.writeFile({ fileName: `EcoAction_1M1B_Sustainability_SDG13_${studentName.replace(/\s+/g, '_')}.pptx` })
        .then(() => {
          triggerToast('PowerPoint (.pptx) file downloaded successfully! 🚀');
        });
    } catch (e: any) {
      console.error("Error drawing PPTX", e);
      triggerToast('Error building PowerPoint slide file.');
    }
  };


  // --- PPT Presentation Slide Show Engine ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      id: 1,
      tag: "Slide 1: Banner & Welcome",
      title: "1M1B AI for Sustainability Virtual Internship",
      subtitle: "Project Presentation & Implementation Review",
      focus: "Academic SDG-13 Action Project",
      content: (
        <div id="slide-1" className="space-y-6 text-slate-800">
          <div className="flex justify-center mb-4">
            <div className="bg-emerald-50 rounded-full p-4 border border-emerald-100 shadow-sm animate-bounce">
              <Leaf className="w-12 h-12 text-emerald-700" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-center text-slate-900 leading-tight">
            EcoAction AI: Localized Climate Action Planner & Impact Advisor
          </h2>
          <p className="text-center text-slate-600 max-w-xl mx-auto">
            A practical, decision-support platform designed to connect individual carbon streams and local meteorological risks into immediate community action plans.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Student & Affiliation</span>
              <div className="mt-2 text-sm">
                <p className="font-semibold text-slate-800">Intern: <span className="text-emerald-700">{studentName}</span></p>
                <p className="text-slate-600">College: <span className="font-semibold text-slate-700">{collegeName}</span></p>
                <button 
                  onClick={() => setIsEditingMetadata(!isEditingMetadata)}
                  className="mt-3 text-xs bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50 px-2 py-1 rounded transition-colors"
                >
                  {isEditingMetadata ? 'Finish Editing Details' : 'Edit Name & College for Slide Submission'}
                </button>
              </div>
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Program Partnership</span>
              <p className="text-sm text-slate-700 mt-2 font-medium">
                ● 1M1B One Million One Billion Foundation<br />
                ● IBM SkillsBuild Platform<br />
                ● AICTE Approved Virtual Internship
              </p>
            </div>
          </div>

          {isEditingMetadata && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 space-y-3"
            >
              <h4 className="text-xs font-bold text-emerald-900 uppercase">Interactive Slate Configurator</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Student Name</label>
                  <input 
                    type="text" 
                    value={studentName} 
                    onChange={(e) => setStudentName(e.target.value)}
                    className="mt-1 w-full text-xs p-2 border border-slate-300 rounded focus:border-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">College / Institution</label>
                  <input 
                    type="text" 
                    value={collegeName} 
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="mt-1 w-full text-xs p-2 border border-slate-300 rounded focus:border-emerald-500 bg-white"
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <span className="bg-emerald-100 text-emerald-900 text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 border border-emerald-200">
              <Globe className="w-3.5 h-3.5" /> Target Goal: SDG 13 (Climate Action)
            </span>
            <span className="bg-blue-100 text-blue-900 text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 border border-blue-200">
              <Award className="w-3.5 h-3.5" /> IBM Granite & Gemini API Core
            </span>
          </div>
        </div>
      )
    },
    {
      id: 2,
      tag: "Slide 2: Problem Statement",
      title: "The Core Sustainability Challenge",
      focus: "Empathize & Define",
      subtitle: "Why Generic Climate Generalizations Fall Short",
      content: (
        <div id="slide-2" className="space-y-4 text-slate-800">
          <div className="border-l-4 border-emerald-600 pl-4 py-2">
            <h3 className="text-lg font-bold text-slate-900">Problem Statement</h3>
            <p className="text-sm text-slate-600 mt-1">
              "How might we use AI to model intensely localized climate vulnerabilities so that city residents can implement highly specific, high-impact personal carbon mitigation strategies?"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 space-y-2">
              <span className="text-xs font-semibold text-red-700 uppercase flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Current Constraints & Gaps
              </span>
              <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside">
                <li><strong>One-Size Recommendations:</strong> Asking individuals to "use less water" fails to target the specific regional grid source (e.g. coal-dominated sectors).</li>
                <li><strong>Abstract Risk Perception:</strong> Citizens ignore global warming trends until they see direct localized impacts (such as seasonal water spikes in Delhi or storm surges in coastal regions).</li>
                <li><strong>Information Overload:</strong> Local municipal environmental directives are buried inside long, dense PDFs.</li>
              </ul>
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-2">
              <span className="text-xs font-semibold text-emerald-700 uppercase flex items-center gap-1">
                <Users className="w-4 h-4" /> Target User Persona
              </span>
              <ul className="text-xs text-slate-700 space-y-2">
                <li><strong>● Individual Citizens & Households</strong> looking to turn carbon anxiety into direct, quantifiable micro-offsets.</li>
                <li><strong>● Academic Campus Committees</strong> evaluating localized sustainability policies (such as Aditya Engineering College campus targets).</li>
                <li><strong>● Municipal Field Officers</strong> wanting quick decision-support resources on local risk.</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      tag: "Slide 3: The AI-Powered Architecture",
      title: "System Architecture & AI Capabilities",
      focus: "Technical Workflow",
      subtitle: "Dynamic Synthesis of Climatological Risk and Lifestyle Profiling",
      content: (
        <div id="slide-3" className="space-y-4 text-slate-800">
          <p className="text-sm text-slate-600">
            EcoAction AI implements full-stack orchestration. We combine an Express backend with the advanced server-side Gemini 3.5 Flash model API to process multidimensional data objects dynamically.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800 w-fit mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">1. Context Profiling</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Captures the user's localized lifestyle footprints—spanning energy generation patterns, daily transit fuel emissions, diet protein choices, and household plastic/waste sorting.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-800 w-fit mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">2. Server-side Gemini Engine</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Synthesizes location coordinates dynamically against environmental risk models. Leverages structured JSON schemas to categorize severe regional risks and map relevant local mitigation policies.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-800 w-fit mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">3. Decision Action Engine</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculates and outputs tailored checklist modules containing direct daily micro-steps. Computes localized CO2 savings values (in kg eCO2) to visualize combined community carbon offset velocity.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-700 flex-shrink-0" />
            <p className="text-xs text-blue-950">
              <strong>Academic Verification:</strong> Server-side API key handling utilizes strict lazy initialization. This isolates key environments, avoiding client exposure on the browser.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 4,
      tag: "Slide 4: Prototype Agentic Logic",
      title: "Interactive Prototype Logic Diagram",
      focus: "Logic Flowchart",
      subtitle: "Unified System State and Data Exchange Pathway",
      content: (
        <div id="slide-4" className="space-y-4 text-slate-800">
          <p className="text-xs text-slate-600">
            Our app coordinates real-time data flow. Below is the workflow diagram mapping the interaction of user requests and the GenAI server.
          </p>

          <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-inner">
            <div className="flex flex-col md:flex-row items-stretch justify-between gap-2 max-w-2xl mx-auto">
              <div className="border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-2.5 rounded text-center flex-1 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-emerald-800 uppercase font-black">User State (UI)</span>
                <p className="text-xs font-bold text-slate-800 mt-1">1. Lifestyle Inputs</p>
                <span className="text-[9px] text-slate-500">City, Transport fuels, Trash programs</span>
              </div>

              <div className="flex items-center justify-center text-slate-400 font-mono text-xs font-semibold py-1">
                ──▶
              </div>

              <div className="border-2 border-slate-300 bg-slate-50 p-2.5 rounded text-center flex-1 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-slate-600 uppercase font-bold">Express API Proxy</span>
                <p className="text-xs font-bold text-slate-800 mt-1">2. Endpoint Processing</p>
                <span className="text-[9px] text-slate-500">POST /api/climate/plan Secure validation</span>
              </div>

              <div className="flex items-center justify-center text-slate-400 font-mono text-xs font-semibold py-1">
                ──▶
              </div>

              <div className="border-2 border-emerald-600 bg-emerald-950 text-white p-2.5 rounded text-center flex-1 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-emerald-300 uppercase font-semibold">Gemini 3.5 Flash</span>
                <p className="text-xs font-bold text-emerald-100 mt-1">3. Climatology Synthesis</p>
                <span className="text-[9px] text-emerald-200">System Instruction & JSON Mime Schema</span>
              </div>
            </div>

            <div className="text-center font-mono text-slate-400 text-xs mt-3">▲ ────── Live Interactivity Feedback Loop ────── ▼</div>

            <div className="text-xs text-slate-600 text-center mt-2 font-mono">
              The dashboard interprets output attributes to draw customized visual bars and checklists instantly!
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      tag: "Slide 5: Responsible AI Framework",
      title: "Mandatory Responsible AI Integration",
      focus: "Ethics & Compliance",
      subtitle: "1M1B Alignment with Responsible Tech Principles",
      content: (
        <div id="slide-5" className="space-y-4 text-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="bg-emerald-100 p-1.5 rounded text-emerald-800 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Fairness and Bias Prevention</h4>
                  <p className="text-xs text-slate-600">The model infers ecological solutions purely from public geographic indicators and regional EPA carbon coefficients, avoiding profiling on biological, demographic, or social criteria.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="bg-emerald-100 p-1.5 rounded text-emerald-800 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Robust Transparency</h4>
                  <p className="text-xs text-slate-600">Calculated CO2e offsets are explicitly labeled as estimates derived from standard greenhouse emission multipliers. An AI Disclosure Banner is integrated into the resulting plan view.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="bg-emerald-100 p-1.5 rounded text-emerald-800 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Extreme Privacy Protection</h4>
                  <p className="text-xs text-slate-600">No sensitive private identification inputs (e.g. detailed home addresses, billing figures, or names) are requested or logged. The student metadata edit system operates purely locally in React state.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="bg-emerald-100 p-1.5 rounded text-emerald-800 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Safety & Reliability Guardrails</h4>
                  <p className="text-xs text-slate-600">Advice on actions like composting or smart peaking warns users to obey municipal sanitization codes and electrical provider peak boundaries, enforcing civic safety.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 6,
      tag: "Slide 6: Impact & Contribution",
      title: "Expected Impact & SDG Goals Mapping",
      focus: "Impact Statement",
      subtitle: "Quantifiable Community Carbon Offset Acceleration",
      content: (
        <div id="slide-6" className="space-y-4 text-slate-800">
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-5 rounded-xl border border-emerald-950">
            <h3 className="text-base font-bold text-emerald-300">Target SDG 13.3 Direct Contribution:</h3>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              "By improving education, awareness-raising, and human and institutional capacity on climate change mitigation, adaptation, and impact reduction, we replace abstract climate fear with step-by-step household actions."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Individual Scale Outcomes</h4>
              <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside">
                <li>Estimated annual drop of <strong>350 - 1500 kg CO2e</strong> per proactive household.</li>
                <li>Direct rise in climate awareness, organic waste separation, and smart household energy habits.</li>
                <li>Familiarization of students with API integration and green application development.</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Global Community Benefits</h4>
              <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside">
                <li>Aggregating neighborhood feedback into small-scale decentralized compost units.</li>
                <li>Decreasing peak regional electricity stress, averting dirtier fast-start emergency thermal grids.</li>
                <li>Replicable model adaptable to campuses like <strong>{collegeName}</strong>.</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Dynamic Success Alerts */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-800"
          >
            <div className="bg-emerald-500 rounded-full p-1 text-slate-950">
              <Check className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium">{successToast}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Forest Top Header & Navigation Toggle */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-900 rounded-lg p-2 text-white">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-emerald-800">1M1B Virtual Internship</span>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">EcoAction AI</h1>
            </div>
          </div>

          {/* Toggle Pills between the Slideshow and Working Prototype */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('prototype')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'prototype' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
              Live AI Prototype
            </button>
            <button
              onClick={() => setActiveTab('ppt_slides')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'ppt_slides' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Presentation className="w-3.5 h-3.5 text-blue-600" />
              Presentation Slides (PPT)
            </button>
          </div>

          {/* Top Indicators */}
          <div className="hidden lg:flex items-center gap-3">
            <span className="bg-emerald-50 text-emerald-800 text-[10.5px] px-3 py-1.5 rounded-lg border border-emerald-100 font-medium">
              SDG 13: Climate Action
            </span>
            <span className="bg-blue-50 text-blue-800 text-[10.5px] px-3 py-1.5 rounded-lg border border-blue-100 font-medium">
              In collaboration with IBM SkillsBuild
            </span>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: WORKING PROTOTYPE */}
        {activeTab === 'prototype' && (
          <div className="space-y-8">
            
            {/* Top Project Alert Box */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 complex-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    UN SUSTAINABLE DEVELOPMENT GOALS
                  </span>
                  <span className="text-slate-500 text-xs">● Internship Submission</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">EcoAction Localized Impact Planner</h3>
                <p className="text-sm text-slate-600 max-w-2xl">
                  Configure your residential sustainability parameters below. The server-side Gemini 3.5 Flash engine will instantaneously analyze localized weather risk benchmarks and draft a premium mitigation plan.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('ppt_slides')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-4 py-2.5 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <Presentation className="w-4 h-4 text-blue-600" />
                Review PPT Guidelines
              </button>
            </div>

            {/* Grid Layout: Config Form (Left) & Dashboard Analytics / Results (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Config Form (Left - 4 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <MapPin className="text-emerald-700 w-5 h-5 animate-pulse" />
                    <h3 className="text-sm font-bold uppercase text-slate-800 tracking-wide">
                      Lifestyle Footprint Parameters
                    </h3>
                  </div>

                  <div className="space-y-4">
                    
                    {/* Location Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                        Region & City <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Delhi, Mumbai, Bangalore, Portland"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all text-slate-900"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Infers regional adaptation risks like monsoons, storm surges, or water tables.
                      </p>
                    </div>

                    {/* Energy source Select */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">
                        Electricity Grid Feed Source
                      </label>
                      <select 
                        value={energySource}
                        onChange={(e) => setEnergySource(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all text-slate-900"
                      >
                        <option value="Electricity (Coal/Thermal Grid)">Coal / Gas Thermal Dominant Grid (High carbon intensity)</option>
                        <option value="Standard Grid (Regular mix)">Standard Municipal Grid (Mixed fuels)</option>
                        <option value="Hydro/Nuclear State Mix">Hydroelectric / Nuclear Feed Grid (Low carbon intensity)</option>
                        <option value="Solar/Rooftop Renewables Hybrid">Solar Arrays / Rooftop PV Hybrid (Near carbon-neutral)</option>
                      </select>
                    </div>

                    {/* Commute vehicle select */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">
                        Primary Commute Transit Medium
                      </label>
                      <select 
                        value={commuteMode}
                        onChange={(e) => setCommuteMode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all text-slate-900"
                      >
                        <option value="Petrol/Diesel Car">Petrol/Diesel SUV or Automobile</option>
                        <option value="Compact car (Gasoline)">Compact Gas Sedan</option>
                        <option value="Electric Vehicle (EV)">Electric Car or Scooter (EV powered)</option>
                        <option value="Public Transit (Metro/CNG Buses)">Civic Metro Transit or CNG Buses</option>
                        <option value="Bicycle/Walking">Bicycle or Active Pedestrian Commute</option>
                      </select>
                    </div>

                    {/* Commute distance selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">
                        Daily Commute Travel Magnitude
                      </label>
                      <select 
                        value={commuteDistance}
                        onChange={(e) => setCommuteDistance(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all text-slate-900"
                      >
                        <option value="Under 10 km/day">Under 10 km/day (Micro transit)</option>
                        <option value="10 to 30 km/day">10 to 30 km/day (Moderate commute)</option>
                        <option value="30 to 60 km/day">30 to 60 km/day (High urban commute)</option>
                        <option value="60+ km/day">60+ km/day (Extreme daily travel)</option>
                      </select>
                    </div>

                    {/* Dietary Profile */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">
                        Diet Protein Stream Source
                      </label>
                      <select 
                        value={dietType}
                        onChange={(e) => setDietType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all text-slate-900"
                      >
                        <option value="Meat frequent (Red & Poultry)">Meat Intensive (Frequent beef / pork / lamb)</option>
                        <option value="Balanced (Meat & Veg Mix)">Balanced Average (Moderate protein mix)</option>
                        <option value="Ovo-Lacto Vegetarian">Vegetarian (No meat, dairy and egg consumption)</option>
                        <option value="Vegan (Raw Plant-Based)">Vegan (Strict plant nutrition, lowest land footprint)</option>
                      </select>
                    </div>

                    {/* Household Garbage Program */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">
                        Domestic Trash Management Program
                      </label>
                      <select 
                        value={wastePractice}
                        onChange={(e) => setWastePractice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all text-slate-900"
                      >
                        <option value="Standard landfilled / Unregulated">Standard Discarding (No segregation, sent directly to landfill)</option>
                        <option value="Simple plastic/metal recycling">Simple Segregation (Dry plastics & metals recycled)</option>
                        <option value="Advanced composting & zero organic waste">Active Micro-Composting (All organic wet waste converted, zero sent to landfill)</option>
                      </select>
                    </div>

                  </div>

                  <button
                    onClick={() => handleFetchPlan(false)}
                    disabled={isLoading}
                    className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-semibold rounded-xl py-3 text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Consulting Gemini Climatology AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-300" />
                        Generate AI Mitigation Plan
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-slate-500 leading-relaxed">
                    Powered by 1M1B Environment Agent API. Real-time inference generates an IPCC-aligned local risk report instantly.
                  </p>

                </div>

                {/* Left Mini: Campus Sustainability Tip */}
                <div className="bg-gradient-to-br from-emerald-900 to-indigo-950 text-white rounded-2xl p-6 border border-emerald-950 flex flex-col justify-between shadow-lg">
                  <div className="space-y-2">
                    <div className="bg-emerald-800 text-emerald-200 text-[9.5px] font-bold tracking-widest uppercase w-fit px-2 py-0.5 rounded">
                      Campus Impact Tip
                    </div>
                    <h4 className="text-base font-bold text-emerald-100">Institutional Carbon Deceleration</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Did you know? If 10% of students at <strong>{collegeName}</strong> convert their wet organic lunch boxes into sub-soil aerobic pits, it negates over <strong>1,200 kg of atmospheric methane release</strong> per quarter. Try recommending this as an internship task feedback!
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-emerald-800 flex items-center justify-between text-[11px] text-emerald-300">
                    <span>Target SDG 13.3.1 Education</span>
                    <Leaf className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>

              </div>

              {/* Dashboard Analytics & Recommendations (Right - 7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Visual Emissions Calculator Block */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Gauge className="text-emerald-700 w-5 h-5" />
                      <h3 className="text-sm font-bold uppercase text-slate-800 tracking-wide">
                        My Projected Footprint Indicators
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-900 px-2 py-0.5 bg-emerald-50 rounded">
                      Annual Co2e Weight
                    </span>
                  </div>

                  {/* High visual gauge / progress board representing carbon footprint */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                    
                    {/* Ring score */}
                    <div className="sm:col-span-4 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-100 pb-4 sm:pb-0">
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        {/* Circular ring path using simple CSS */}
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="54" fill="transparent" stroke="#f1f5f9" strokeWidth="8"/>
                          <circle 
                            cx="64" 
                            cy="64" 
                            r="54" 
                            fill="transparent" 
                            stroke={reductionPercentage > 20 ? "#059669" : "#dc2626"} 
                            strokeWidth="8"
                            strokeDasharray="339"
                            strokeDashoffset={339 - (339 * Math.min(100, Math.max(10, (baselineCO2Total - calculatedSavings) / baselineCO2Total * 100))) / 100}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center text-center">
                          <span className="text-2xl font-bold font-mono tracking-tighter text-slate-900">
                            {currentEmissionsValue}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-500">
                            KG CO2e / Year
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 text-center mt-2 px-1 leading-normal">
                        {reductionPercentage > 0 
                          ? `You saved ${reductionPercentage}% via custom actions!` 
                          : 'Change variables left to recalculate.'}
                      </p>
                    </div>

                    {/* Progress bars of breakdown */}
                    <div className="sm:col-span-8 space-y-3.5">
                      
                      {/* Transport emissions bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Car className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Transportation Fuel</span>
                          </div>
                          <span className="font-mono font-bold text-slate-800">{initialHeuristics.Transport} KG</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${(initialHeuristics.Transport / 5000) * 100}%` }}
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>

                      {/* Energy Grid feed bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span>Grid Energy Consumption</span>
                          </div>
                          <span className="font-mono font-bold text-slate-800">{initialHeuristics.Energy} KG</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${(initialHeuristics.Energy / 5000) * 100}%` }}
                            className="bg-amber-500 h-full rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>

                      {/* Food stream bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Utensils className="w-3.5 h-3.5 text-rose-500" />
                            <span>Diet Lifecycle Stream</span>
                          </div>
                          <span className="font-mono font-bold text-slate-800">{initialHeuristics.Food} KG</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${(initialHeuristics.Food / 5000) * 100}%` }}
                            className="bg-rose-500 h-full rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>

                      {/* Landfilled Waste bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Trash2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Domestics Trash Outflow</span>
                          </div>
                          <span className="font-mono font-bold text-slate-800">{initialHeuristics.Waste} KG</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${(initialHeuristics.Waste / 1000) * 100}%` }}
                            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

                {/* Climate risks & tailored plan results block */}
                <div className="space-y-6">
                  
                  {climatePlan ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Regional Climate Risks list */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                          <CloudRain className="text-blue-700 w-5 h-5" />
                          <h4 className="text-sm font-bold uppercase text-slate-800 tracking-wide">
                            Localized Physical Vulnerability Report ({city})
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {climatePlan.regionalRisks?.map((risk, index) => (
                            <div 
                              key={index} 
                              className="border border-slate-250 bg-slate-50/50 p-4 rounded-xl relative overflow-hidden flex flex-col justify-between"
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9.5px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                                    risk.severity === 'High' 
                                      ? 'bg-red-100 text-red-900 border border-red-200' 
                                      : 'bg-amber-100 text-amber-900 border border-amber-200'
                                  }`}>
                                    Risk Severity: {risk.severity}
                                  </span>
                                </div>
                                <h5 className="font-bold text-slate-900 text-sm">{risk.title}</h5>
                                <p className="text-xs text-slate-600 leading-normal">{risk.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tailored Climate Mitigation Action Checklist */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <Leaf className="text-emerald-700 w-5 h-5 animate-pulse" />
                            <h4 className="text-sm font-bold uppercase text-slate-800 tracking-wide">
                              My Climate Action Plan (Tailored checklist)
                            </h4>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono italic">
                            Tick to offset CO2
                          </span>
                        </div>

                        <div className="space-y-4">
                          {climatePlan.mitigationPlan?.map((plan, index) => {
                            const isCompleted = completedActions.includes(plan.title);
                            return (
                              <div 
                                key={index} 
                                className={`border rounded-xl p-4 transition-all duration-300 ${
                                  isCompleted 
                                    ? 'bg-emerald-50/70 border-emerald-300 shadow-sm' 
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-start gap-3.5">
                                  
                                  {/* Custom Checkbox */}
                                  <button
                                    onClick={() => toggleActionCompleted(plan.title, plan.co2SavingsKg)}
                                    className={`mt-1 h-5 w-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0 ${
                                      isCompleted 
                                        ? 'bg-emerald-950 border-emerald-950 text-white' 
                                        : 'border-slate-350 hover:bg-slate-50'
                                    }`}
                                  >
                                    {isCompleted && <Check className="w-3.5 h-3.5" />}
                                  </button>

                                  <div className="space-y-1.5 flex-grow">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                                        {plan.category}
                                      </span>
                                      <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">
                                        Impact: {plan.impactScore}
                                      </span>
                                      <span className="bg-indigo-50 text-indigo-900 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono font-black ml-auto">
                                        -{plan.co2SavingsKg} kg/yr CO2
                                      </span>
                                    </div>

                                    <h5 className={`font-bold transition-all text-sm ${
                                      isCompleted ? 'text-slate-700 line-through' : 'text-slate-900'
                                    }`}>
                                      {plan.title}
                                    </h5>
                                    
                                    <p className="text-xs text-slate-600 leading-normal">
                                      {plan.detail}
                                    </p>

                                    {/* Action Sub steps */}
                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mt-2 space-y-1">
                                      <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                                        Implementation Steps:
                                      </span>
                                      {plan.actionSteps?.map((stepStr, idx) => (
                                        <p key={idx} className="text-[11px] text-slate-700 flex items-start gap-1">
                                          <span className="text-emerald-700 font-bold block pt-0.5">✔</span> {stepStr}
                                        </p>
                                      ))}
                                    </div>

                                  </div>

                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Educational Integration Box */}
                      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-950 space-y-4">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <BookOpen className="w-5 h-5" />
                          <h4 className="text-xs font-bold uppercase tracking-widest">
                            Academic & SDG 13 Target Mapping
                          </h4>
                        </div>
                        
                        <div className="space-y-3.5 text-xs text-slate-300">
                          <p>
                            <strong>Localized Observation:</strong> {climatePlan.educationalInsights?.localObservation}
                          </p>
                          <p className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-emerald-100 leading-relaxed">
                            <strong>SDG 13.3 Target Impact:</strong> {climatePlan.educationalInsights?.sdg13TargetMapping}
                          </p>
                        </div>
                      </div>

                      {/* AI Transparency Disclaimer required by Responsible AI rules */}
                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-[10.5px] text-slate-700 leading-normal flex items-start gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-900 font-bold uppercase block tracking-wider">
                            Responsible AI Protocol
                          </strong>
                          <p>{climatePlan.responsibleAIDisclaimer}</p>
                        </div>
                      </div>

                    </motion.div>
                  ) : (
                    <div className="bg-white border rounded-2xl p-8 flex flex-col items-center justify-center text-center text-slate-500">
                      <RotateCcw className="w-8 h-8 text-slate-300 mb-2 animate-spin" />
                      <p className="text-xs">Initial assessment profile loaded. Fill customized variables to configure.</p>
                    </div>
                  )}

                </div>

                {/* Educational interactive Climate Coach chat widget (RAG simulation/Dynamic guidance) */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-[400px]">
                  
                  {/* Chat top header */}
                  <div className="bg-emerald-900 text-white px-5 py-3.5 flex items-center justify-between border-b">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
                      <div>
                        <h4 className="text-xs font-bold uppercase text-emerald-100 font-mono">1M1B Advisor</h4>
                        <h3 className="text-xs font-bold">Climate Coach Q&A</h3>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded font-mono">
                      SDG-13.3 Literacy
                    </span>
                  </div>

                  {/* Messages container list */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                    {chatMessages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col max-w-[85%] space-y-1 ${
                          msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <div className={`p-3 rounded-2xl text-xs leading-normal ${
                          msg.role === 'user' 
                            ? 'bg-emerald-950 text-white rounded-br-none' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono px-1">
                          {msg.timestamp}
                        </span>
                      </div>
                    ))}
                    {isSendingChat && (
                      <div className="flex max-w-[85%] mr-auto items-start">
                        <div className="bg-white border border-slate-200 text-slate-400 text-xs p-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                          <span className="font-mono text-[10px]">Analyzing SDG targets...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat input form */}
                  <form onSubmit={handleSendChatMessage} className="p-3 border-t bg-white flex items-center gap-2">
                    <input 
                      type="text" 
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Ask: 'How do I compost?' or 'Why is SDG 13 important?'"
                      disabled={isSendingChat}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-800 focus:bg-white text-slate-900 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isSendingChat || !userInput.trim()}
                      className="bg-emerald-900 text-white hover:bg-emerald-950 p-2.5 rounded-xl disabled:bg-slate-300 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: ACADEMIC PPT SLIDE VIEW */}
        {activeTab === 'ppt_slides' && (
          <div className="space-y-6">
            
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-800">
                <p className="font-bold text-amber-900">Virtual Internship Presentation Delivery Mode</p>
                <p className="mt-0.5">
                  Use this interactive slideshow container directly during evaluation to explain your problem choice, SDG target alignment, AI-architecture, and impact criteria. You can edit the Student and College details in Slide 1 to customize it!
                </p>
              </div>
            </div>

            {/* PPT Card Screen */}
            <div className="bg-white border-2 border-slate-300 rounded-3xl overflow-hidden shadow-2xl">
              
              {/* Screen Top Header Frame imitating full Presentation software */}
              <div className="bg-slate-900 text-white px-5 py-3 h-12 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest pl-3 border-l border-slate-700">
                    Slide {currentSlide + 1} of {slides.length}
                  </span>
                </div>
                
                <span className="text-xs bg-emerald-850 px-3 py-1 rounded text-emerald-100 font-mono">
                  {slides[currentSlide].tag}
                </span>
              </div>

              {/* Slide Screen Frame */}
              <div className="p-8 sm:p-12 min-h-[380px] flex flex-col justify-between bg-white relative">
                
                {/* Content Inner */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {slides[currentSlide].focus}
                    </span>
                    <span className="text-xs text-slate-400">● 1M1B AI for Sustainability</span>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                      {slides[currentSlide].title}
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium italic">
                      {slides[currentSlide].subtitle}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-5 mt-3">
                    {slides[currentSlide].content}
                  </div>
                </div>

                {/* Aesthetic footer line of slide */}
                <div className="border-t border-slate-100 pt-4 mt-8 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Admitted Candidate: {studentName} ({collegeName})</span>
                  <span>UN Development Agenda 2030 (SDG 13 Action)</span>
                </div>

              </div>

              {/* PPT Lower Controls */}
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
                
                <div className="flex gap-1.5 overflow-x-auto max-w-[60%] sm:max-w-unset py-1">
                  {slides.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-7 w-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                        currentSlide === idx 
                          ? 'bg-emerald-950 text-white scale-110 shadow-sm' 
                          : 'bg-white border text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentSlide === 0}
                    onClick={handlePrevSlide}
                    className="bg-white border rounded-xl p-2.5 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentSlide === slides.length - 1}
                    onClick={handleNextSlide}
                    className="bg-emerald-950 text-white rounded-xl px-5 py-2.5 text-xs font-semibold hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                  >
                    Next Slide
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>

            {/* EXPANDED PPT DOWNLOAD AND COPY MODULE */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 complex-shadow space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <FileText className="w-5 h-5 text-emerald-700" />
                <div>
                  <h3 className="text-sm font-bold uppercase text-slate-800 tracking-wide">
                    Slide Deck Submission Package
                  </h3>
                  <p className="text-xs text-slate-500">
                    Download or copy your finalized 1M1B virtual internship slides to submit to evaluator portals.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                
                {/* Visual Download Actions */}
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100/70 px-2 py-0.5 rounded">
                      Instant Generators
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      Export PowerPoint File (.pptx) or Slide Outline (.md)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Download a fully formatted PowerPoint presentation document (.pptx) aligning with 1M1B academic requirements instantly, or get standard markdown outlines depending on your submission protocol.
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {/* Primary Native PPTX Button */}
                    <button
                      onClick={downloadNativePPTX}
                      className="bg-emerald-850 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow border border-emerald-950 w-full"
                    >
                      <Presentation className="w-4.5 h-4.5 text-emerald-300" />
                      Download PowerPoint Presentation (.pptx)
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={downloadMarkdownSlides}
                        className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-[11px] py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-center"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        Download Slide Outline (.md)
                      </button>
                      <button
                        onClick={copyMarkdownSlides}
                        className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-[11px] py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-center"
                      >
                        Copy Text
                      </button>
                    </div>
                  </div>
                </div>

                {/* Integration Guide */}
                <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-xl space-y-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4.5 h-4.5 text-blue-700" />
                      <h4 className="text-xs font-bold uppercase text-blue-900 tracking-wide font-sans">
                        Submission Compliance Checklist:
                      </h4>
                    </div>
                    <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside leading-relaxed">
                      <li>Use the <strong className="text-emerald-900 font-bold">Download PowerPoint (.pptx)</strong> action to fetch your slide file with academic themed color layout options.</li>
                      <li>Contains custom metadata tailored for student <strong className="text-slate-900 font-bold">{studentName}</strong> attending <strong className="text-slate-900 font-bold">{collegeName}</strong>.</li>
                      <li>Ideal for uploading directly into the 1M1B portal or AICTE portfolio submission reviews.</li>
                    </ul>
                  </div>
                  <div className="text-[11px] text-slate-500 italic bg-white/70 p-2 rounded border border-slate-150 mt-2">
                    Note: PowerPoint supports direct import formatting or outline mapping for standard submissions as well.
                  </div>
                </div>

              </div>
            </div>

            {/* Quick action: Launch live demo button in PPT tab */}
            <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-emerald-400" /> Ready to exhibit the working code?
                </h4>
                <p className="text-xs text-slate-400">
                  Click 'Launch Prototype' to toggle the active parameters and consult the climate risk advisor dynamically.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('prototype')}
                className="bg-emerald-700 hover:bg-emerald-650 text-white text-xs font-semibold px-5  py-3 rounded-xl shadow transition-colors flex items-center gap-2.5"
              >
                Launch Active Prototype Demo
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Persistent Beautiful and Clean Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs text-slate-500">
            © 2026 EcoAction AI. Created for the **1M1B AI for Sustainability Virtual Internship** under official AICTE guidelines.
          </p>
          <div className="flex gap-4 text-xs font-semibold text-slate-500">
            <span className="hover:text-emerald-800">UN SDG 13 Core Target</span>
            <span>•</span>
            <span className="hover:text-emerald-800">IBM SkillsBuild Integrated</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
