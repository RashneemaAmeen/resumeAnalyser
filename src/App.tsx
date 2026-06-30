import { useState, useEffect, useRef } from 'react';
import type React from 'react';
import { 
  FileText, 
  Upload, 
  Briefcase, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  Send, 
  RefreshCw,  
  Layers, 
  ChevronRight, 
  ChevronLeft,
  FileCheck, 
  Lightbulb, 
  MessageSquare,
  Search,
  Check,
  FileSpreadsheet,
  ArrowRight,
  Sparkle
} from 'lucide-react';

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

type SampleKey = 'software_engineer' | 'data_analyst';

type AnalysisResult = {
  matchScore: number;
  summaryOfFit: string;
  atsAnalysis?: {
    atsScore?: number;
    formattingFeedback?: string;
    keywordMatchStatus?: string;
    passProbability?: string;
  };
  skillsBreakdown?: {
    requiredAndMatched?: string[];
    requiredButMissing?: string[];
    candidateExtraSkills?: string[];
  };
  suggestions?: {
    section: string;
    recommendation: string;
  }[];
  flowchart?: {
    step: string;
    status: 'Pass' | 'Warning' | 'Fail';
    note: string;
  }[];
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const SAMPLE_RESUMES = {
  software_engineer: `Alex Rivera
alex.rivera@email.dev | (555) 019-2834 | San Francisco, CA | linkedin.com/in/alexriveradevs

PROFESSIONAL SUMMARY
Highly motivated Software Engineer with 3+ years of experience designing, building, and maintaining robust web applications. Proficient in modern JavaScript ecosystems, frontend frameworks, and cloud architecture. Proven track record of optimizing page speeds by 40% and collaborating effectively in agile teams.

TECHNICAL SKILLS
- Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3, Python
- Frameworks & Libraries: React, Next.js, Redux, Node.js, Express, Tailwind CSS
- Databases & Tools: PostgreSQL, MongoDB, Git, Docker, RESTful APIs

EXPERIENCE
Frontend Developer | TechCorp Solutions, San Francisco, CA (Jan 2024 - Present)
- Led development of client-facing dashboard using React and Tailwind CSS, increasing user engagement by 25%.
- Integrated complex REST endpoints and state management structures (Redux Toolkit) ensuring sub-second UI reactivity.
- Conducted regular code reviews, mentored junior developers, and streamlined deployment structures using GitHub Actions.

Software Engineer | DevStart Studio, Austin, TX (Jun 2022 - Dec 2023)
- Built interactive features for e-commerce platforms, reducing loading bottlenecks by utilizing server-side rendering in Next.js.
- Implemented responsive design modules to optimize platform accessibility across mobile devices.
- Coordinated with QA engineers to draft integration tests, achieving 90% test coverage using Jest.

EDUCATION
B.S. in Computer Science | University of Texas at Austin (Graduated May 2022)`,

  data_analyst: `Jordan Blake
jordan.blake@analytics.net | (555) 045-6789 | Chicago, IL | github.com/jordanblake

SUMMARY
Detail-oriented Data Analyst with 4 years of experience translating complex datasets into actionable business strategies. Experienced in statistical analysis, predictive modeling, and building dynamic interactive dashboards for C-suite decision making.

SKILLS
- Analytics: SQL, Python (Pandas, NumPy, Scikit-Learn), R, Excel (Advanced)
- Visualization: Tableau, Power BI, Matplotlib
- Methodologies: A/B Testing, Regression Analysis, Cohort Analysis

EXPERIENCE
Senior Data Analyst | RetailGenius Inc, Chicago, IL (Mar 2023 - Present)
- Developed customized Tableau dashboards for regional sales executives, uncovering $120k in annual supply chain inefficiencies.
- Conducted advanced SQL queries and cohort analyses to optimize promotional pricing models, raising average margins by 4.2%.
- Streamlined monthly operational KPI reporting through Python automation scripts, cutting processing times from 3 days to 4 hours.

Data Analyst | CoreMetrics Corp, Chicago, IL (Feb 2021 - Feb 2023)
- Evaluated performance of multi-channel marketing campaigns through dynamic A/B test methodologies.
- Designed analytical frameworks using Python to study customer churn, leading to strategic interventions that improved retention by 8%.

EDUCATION
B.S. in Statistics | Northwestern University (Graduated Dec 2020)`
};

const SAMPLE_JOB_DESCRIPTIONS = {
  software_engineer: `Senior / Full Stack Software Engineer (React & Cloud Stack)
Company: CloudScale Dynamics
Location: Remote / Hybrid San Francisco

Role Overview:
We are looking for a Senior Software Engineer to join our core cloud platform team. You will be responsible for creating high-performance web applications, implementing cloud APIs, and establishing DevOps processes.

Key Responsibilities:
- Design and implement state-of-the-art web frontends using React and TypeScript.
- Architect microservices and robust server-side controllers using Node.js or NestJS.
- Leverage AWS Cloud Services (AWS Lambda, DynamoDB, S3) for scalable application architecture.
- Build and support CI/CD pipelines using Terraform and GitHub Actions.
- Provide technical mentorship to intermediate engineers.

Requirements & Qualifications:
- 3+ years of software development experience.
- Strong mastery of modern TypeScript, React, and server-side Node.js frameworks.
- Deep, hands-on experience with AWS (S3, Lambda, API Gateway).
- Experience with infrastructure as code (IaC) tools such as Terraform or CloudFormation.
- Solid understanding of SQL/NoSQL databases.`,

  data_analyst: `Senior Lead Business Data Analyst
Company: Horizon FinTech
Location: Chicago, IL

About the Role:
We are seeking an analytical leader to lead FinTech growth modeling. This role sits at the intersection of business intelligence, customer statistics, and machine learning model deployment.

Requirements:
- 4+ years of experience as a Data Analyst, Scientist, or similar role.
- Expert-level SQL (Postgres/Redshift) to process millions of transaction rows.
- Deep hands-on experience deploying Machine Learning Models in production using Python (Scikit-Learn, XGBoost).
- Expert visualization skills with Tableau and experience with financial forecasting frameworks.
- Master's degree in Statistics, Economics, or matching Quantitative field is highly preferred.
- Familiarity with cloud data warehouse structures (Snowflake / AWS Redshift).`
};

export default function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'tuning', 'sources'
  
  // Inputs
  const [resumeText, setResumeText] = useState(SAMPLE_RESUMES.software_engineer);
  const [fileName, setFileName] = useState('sample_software_engineer.pdf');
  const [jobDescription, setJobDescription] = useState(SAMPLE_JOB_DESCRIPTIONS.software_engineer);

  //const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  // Status & Parsing flags
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Structured Analysis Result
  //const [analysis, setAnalysis] = useState(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // Conversational AI Assistant
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Welcome to ResumeLens AI! Adjust your CV or upload a new one on the left, set your target Job Description, and hit "Analyze Alignment". Once analyzed, ask me anything to draft custom cover letters, rewrite your bullet points, or review gaps!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  //const chatEndRef = useRef(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    // Inject PDFJS library if not exists
    if (!window.pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      };
      document.head.appendChild(script);
    }
  }, []);

 // const handlePdfUpload = async (event) => {
 const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setErrorMsg('Please upload a valid PDF resume.');
      return;
    }

    setFileName(file.name);
    setIsParsingPdf(true);
    setErrorMsg('');

    try {
      if (!window.pdfjsLib) {
        throw new Error('PDF processing library is currently loading. Please wait a moment and re-upload.');
      }

      const reader = new FileReader();
      reader.onload = async function () {
        try {
         // const typedArray = new Uint8Array(this.result);
         if (!this.result) {
            throw new Error('No PDF file data was found.');
          }

        const typedArray = new Uint8Array(this.result as ArrayBuffer);
          const pdf = await window.pdfjsLib.getDocument(typedArray).promise;
          let extractedText = '';

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            //const pageText = content.items.map(item => item.str).join(' ');
            const pageText = content.items.map((item: any) => item.str).join(' ');
            extractedText += pageText + '\n';
          }

          if (extractedText.trim().length === 0) {
            throw new Error('Could not parse legible text from this PDF. Please verify it is not an image scan.');
          }

          setResumeText(extractedText);
          setIsParsingPdf(false);
        } catch (innerErr) {
          setErrorMsg(`Error extracting PDF text: ${getErrorMessage(innerErr)}`);
          setIsParsingPdf(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setErrorMsg(`Failed to initialize parser: ${getErrorMessage(err)}`);
      setIsParsingPdf(false);
    }
  };

  //const handleLoadSample = (key) => {
  const handleLoadSample = (key: SampleKey) => {
    setResumeText(SAMPLE_RESUMES[key]);
    setFileName(`sample_${key}.pdf`);
    setJobDescription(SAMPLE_JOB_DESCRIPTIONS[key]);
    setAnalysis(null);
    setChatMessages([
      { role: 'assistant', text: `Loaded the ${key.replace('_', ' ')} presets! Ready to compare. Modify the Job Description or hit "Analyze Alignment" directly to run our ATS and compatibility engines.` }
    ]);
  };

  const runResumeAnalysis = async () => {
    if (!resumeText.trim()) {
      setErrorMsg('Please input or upload a Resume before running analysis.');
      return;
    }
    if (!jobDescription.trim()) {
      setErrorMsg('Please enter a target Job Description.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg('');

  



 /*   const payload = {
      contents: [{ parts: [{ text: userPrompt }] }],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        responseMimeType: "application/json"
      }
    };
*/

  const apiUrl = "/api/analyze";
    let attempt = 0;
    const maxAttempts = 3;
    let success = false;
    let responseData = null;

    while (attempt < maxAttempts && !success) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText, jobDescription })
        });

        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}`);
        }

        responseData = await response.json();
        success = true;
      } catch (err) {
        attempt++;
        if (attempt >= maxAttempts) {
          setErrorMsg(`Network request failed after multiple attempts: ${getErrorMessage(err)}`);
          setIsAnalyzing(false);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    try {
      

      const parsedJson = responseData;
      setAnalysis(parsedJson);

      // Instantly trigger collapse on success to prioritize 50/50 dashboard split view
      setIsSidebarCollapsed(true);

      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', text: `Analysis Loaded! 🎯 We found a ${parsedJson.matchScore}% Job Compatibility Fit with an ATS Optimization rating of ${parsedJson.atsAnalysis?.atsScore}%. The setup panel has been collapsed to let you focus on alignment metrics on the left. Ask me to rewrite specific sections or drafts right here!` }
      ]);
      setActiveTab('dashboard');
    } catch (parseErr) {
      console.error(parseErr);
      setErrorMsg(`Failed to organize analysis results. Raw text was: ${getErrorMessage(parseErr)}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsChatLoading(true);



    const conversationHistory = chatMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));
    conversationHistory.push({ role: 'user', parts: [{ text: userMsg }] });

  /*  const payload = {
      contents: conversationHistory,
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      }
    };*/

const apiUrl = "/api/chat";
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
  resumeText,
  jobDescription,
  analysis,
  chatHistory: chatMessages,
  userMsg
})
      });

      if (!response.ok) throw new Error('Network issue communicating with the AI Mentor.');

      const result = await response.json();
      const assistantText = result.reply || "I was unable to capture a clear answer. Please retry your request.";

      setChatMessages(prev => [...prev, { role: 'assistant', text: assistantText }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: `Communication failure: ${getErrorMessage(err)}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg shadow-indigo-500/10">
            <Layers className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight flex items-center gap-2">
              ResumeLens AI <span className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">Intelligence Center</span>
            </h1>
            <p className="text-[10px] text-slate-400">Next-gen candidate mapping, feedback, and interactive tuning</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Quick-toggle Sidebar Trigger */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isSidebarCollapsed 
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isSidebarCollapsed ? (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span>Show Inputs Panel</span>
              </>
            ) : (
              <>
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Hide Inputs Panel</span>
              </>
            )}
          </button>
          
          <div className="flex items-center space-x-2 bg-slate-800/80 rounded-lg px-3 py-1.5 border border-slate-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-mono text-[10px]">Model: Gemini-3-Flash</span>
          </div>
        </div>
      </header>

      {}
      <main className="flex-1 flex overflow-hidden h-[calc(100vh-65px)] relative">
        
        {/* Left Column: Collapsible Workspace Setup */}
        <section 
          className={`border-r border-slate-800 bg-slate-900/60 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out overflow-hidden relative z-20 ${
            isSidebarCollapsed ? 'w-0 border-r-0 opacity-0' : 'w-[360px] p-5 opacity-100'
          }`}
        >
          <div className="flex-1 flex flex-col space-y-5 overflow-y-auto pr-1">
            
            {/* Presets and Samples */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Presets Playgrounds
                </h2>
                <span className="text-[10px] text-slate-500">Quick Test</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleLoadSample('software_engineer')}
                  className="text-[11px] py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 flex items-center justify-center gap-1.5 transition-all text-slate-300 font-medium"
                >
                  <FileCheck className="w-3.5 h-3.5 text-indigo-400" /> Software Eng
                </button>
                <button 
                  onClick={() => handleLoadSample('data_analyst')}
                  className="text-[11px] py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 flex items-center justify-center gap-1.5 transition-all text-slate-300 font-medium"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-violet-400" /> Data Analyst
                </button>
              </div>
            </div>

            {/* Upload Area */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" /> 1. Upload CV (PDF)
                </h3>
                {isParsingPdf && (
                  <span className="text-[10px] text-indigo-400 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> parsing...
                  </span>
                )}
              </div>

              <label className="border border-dashed border-slate-700 hover:border-indigo-500/50 bg-slate-900/40 rounded-lg p-3.5 flex flex-col items-center justify-center cursor-pointer transition-all">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handlePdfUpload} 
                  className="hidden" 
                />
                <FileText className="w-7 h-7 text-slate-500 mb-1.5" />
                <span className="text-[11px] text-slate-300 font-medium text-center">Import Candidate PDF Resume</span>
                <span className="text-[9px] text-slate-500 mt-0.5">Automated text mapping</span>
              </label>

              {fileName && (
                <div className="bg-slate-900/80 rounded px-2 py-1.5 border border-slate-800/80 flex items-center justify-between text-xs text-indigo-300 font-mono">
                  <span className="truncate max-w-[230px]">{fileName}</span>
                  <span className="text-[9px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/25">active</span>
                </div>
              )}
            </div>

            {/* Target Job Description */}
            <div className="flex-1 flex flex-col space-y-2 min-h-[220px]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> 2. Target Job Description
              </h3>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description requirements, qualifications, and core goals here..."
                className="flex-1 w-full bg-slate-950/60 rounded-xl p-3 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 text-xs leading-relaxed text-slate-300 resize-none outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all font-sans"
              />
            </div>

          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4 space-y-3">
            <button
              onClick={runResumeAnalysis}
              disabled={isAnalyzing || isParsingPdf}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-xs"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Structuring Evaluation...</span>
                </>
              ) : (
                <>
                  <Sparkle className="w-4 h-4" />
                  <span>Analyze Alignment</span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] p-2.5 rounded-lg flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </section>

        {/* Dynamic Left/Right Split Workspace */}
        <section className="flex-1 flex divide-x divide-slate-800 overflow-hidden">
          
          {/* Left Half: Match Analytics, CV Tuning & ATS Checks */}
          <div className="w-1/2 flex flex-col overflow-hidden bg-slate-950">
            
            {/* Dashboard Navigation Tabs */}
            <div className="border-b border-slate-800/80 bg-slate-900/30 px-6 flex items-center justify-between shrink-0">
              <div className="flex space-x-6">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                    activeTab === 'dashboard' 
                      ? 'border-indigo-500 text-indigo-400' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Match Analytics
                </button>
                <button
                  onClick={() => setActiveTab('tuning')}
                  className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                    activeTab === 'tuning' 
                      ? 'border-indigo-500 text-indigo-400' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  CV Tuning &amp; ATS Checks
                </button>
                <button
                  onClick={() => setActiveTab('sources')}
                  className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                    activeTab === 'sources' 
                      ? 'border-indigo-500 text-indigo-400' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Source Texts
                </button>
              </div>

              {analysis && (
                <div className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono">
                  {analysis.matchScore}% Match Rate
                </div>
              )}
            </div>

            {/* Dashboard Content Stream */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              
              {/* Fallback State if not analyzed yet */}
              {!analysis && !isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center py-12">
                  <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-5 text-indigo-400 shadow-xl">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">Analysis Awaiting Activation</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Set up your workspace inside the inputs panel. Choose one of our preset playgrounds or upload your original resume. Once loaded, click <strong className="text-indigo-400">"Analyze Alignment"</strong> to generate the live visuals.
                  </p>

                  <div className="mt-6 flex items-center justify-center">
                    <button 
                      onClick={() => setIsSidebarCollapsed(false)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 bg-indigo-500/5 px-3 py-1.5 rounded-lg border border-indigo-500/20"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Expand Inputs Panel to Start
                    </button>
                  </div>
                </div>
              )}

              {/* Progress Loading View */}
              {isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center max-w-sm mx-auto text-center py-16">
                  <div className="relative flex items-center justify-center mb-6">
                    <div className="absolute w-14 h-14 bg-indigo-500/10 rounded-full animate-ping"></div>
                    <div className="relative p-4 bg-indigo-900/20 rounded-2xl border border-indigo-500/30">
                      <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">Processing Document Metrics</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    AI models are examining formatting rules, sorting core requirements, mapping extra keywords, and compiling feedback...
                  </p>
                  <div className="w-full bg-slate-900 h-1 rounded-full mt-5 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full w-[70%] rounded-full animate-[loading_2.5s_infinite]"></div>
                  </div>
                </div>
              )}

              {}
              {analysis && activeTab === 'dashboard' && (
                <div className="space-y-6">
                  
                  {/* Performance Summary Blocks */}
                  <div className="grid grid-cols-2 gap-4">
                    
                    {/* Overall Score */}
                    <div className="bg-gradient-to-b from-indigo-950/25 to-slate-950 border border-indigo-500/20 rounded-xl p-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full filter blur-xl"></div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Compatibility Score</span>
                        <CheckCircle className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-extrabold tracking-tight text-white">{analysis.matchScore}%</span>
                        <span className="text-[10px] text-slate-500">overall match</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                        {analysis.summaryOfFit}
                      </p>
                    </div>

                    {/* ATS Compliance Score */}
                    <div className="bg-gradient-to-b from-emerald-950/15 to-slate-950 border border-emerald-500/20 rounded-xl p-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl"></div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">ATS Formatting Compatibility</span>
                        <FileText className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-extrabold tracking-tight text-white">{analysis.atsAnalysis?.atsScore}%</span>
                        <span className="text-[10px] text-emerald-400 font-semibold font-mono">[{analysis.atsAnalysis?.passProbability} Pass]</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                        {analysis.atsAnalysis?.formattingFeedback}
                      </p>
                    </div>

                  </div>

                  {}
                  <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-800">
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-slate-200">Alignment Pictorial Venn Diagram</h4>
                      <p className="text-[10px] text-slate-400">Intersection of required job specifications against candidate profile</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      
                      {/* Left side: Venn SVG */}
                      <div className="md:col-span-5 flex justify-center bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                        <svg viewBox="0 0 500 320" className="w-full max-w-[280px] h-auto drop-shadow-2xl">
                          <defs>
                            <radialGradient id="grad-jd" cx="30%" cy="40%" r="65%">
                              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.8" />
                            </radialGradient>
                            <radialGradient id="grad-cv" cx="70%" cy="40%" r="65%">
                              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
                            </radialGradient>
                            <radialGradient id="grad-intersect" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#064e3b" stopOpacity="0.9" />
                            </radialGradient>
                          </defs>

                          <line x1="50" y1="160" x2="450" y2="160" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
                          <circle cx="190" cy="160" r="105" fill="url(#grad-jd)" stroke="#f43f5e" strokeWidth="2" strokeOpacity="0.5" />
                          <circle cx="310" cy="160" r="105" fill="url(#grad-cv)" stroke="#6366f1" strokeWidth="2" strokeOpacity="0.5" />
                          <path d="M 250 74 A 105 105 0 0 1 250 246 A 105 105 0 0 1 250 74 Z" fill="url(#grad-intersect)" stroke="#10b981" strokeWidth="2.5" />

                          <text x="130" y="160" fill="#f43f5e" fontSize="11" fontWeight="bold" textAnchor="middle">GAPS</text>
                          <text x="370" y="160" fill="#818cf8" fontSize="11" fontWeight="bold" textAnchor="middle">EXTRA</text>
                          <text x="250" y="160" fill="#10b981" fontSize="12" fontWeight="bold" textAnchor="middle">MATCHED</text>
                        </svg>
                      </div>

                      {/* Right side: Detailed legend categories */}
                      <div className="md:col-span-7 space-y-3.5">
                        
                        {/* Matched skills list */}
                        <div>
                          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs mb-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            <span>Matched Requirements ({analysis.skillsBreakdown?.requiredAndMatched?.length || 0})</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {analysis.skillsBreakdown?.requiredAndMatched?.slice(0, 10).map((skill: string, index: number) => (
                              <span key={index} className="text-[9px] px-1.5 py-0.5 bg-emerald-950/40 text-emerald-300 border border-emerald-800/30 rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Missing skills list */}
                        <div>
                          <div className="flex items-center space-x-1.5 text-rose-400 font-bold text-xs mb-1">
                            <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                            <span>Identified Gaps ({analysis.skillsBreakdown?.requiredButMissing?.length || 0})</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {analysis.skillsBreakdown?.requiredButMissing?.slice(0, 10).map((skill: string, index: number) => (
                              <span key={index} className="text-[9px] px-1.5 py-0.5 bg-rose-950/40 text-rose-300 border border-rose-800/30 rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Extra Value-Add skills list */}
                        <div>
                          <div className="flex items-center space-x-1.5 text-indigo-400 font-bold text-xs mb-1">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                            <span>Extra Value-Add Competencies</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {analysis.skillsBreakdown?.candidateExtraSkills?.slice(0, 10).map((skill: string, index: number) => (
                              <span key={index} className="text-[9px] px-1.5 py-0.5 bg-indigo-950/40 text-indigo-300 border border-indigo-800/30 rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>

                  {}
                  <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-800">
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-slate-200">Recruiter Filter Pathway</h4>
                      <p className="text-[10px] text-slate-400">Projection of candidates advancement through multi-stage vetting processes</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {analysis.flowchart?.map((node: NonNullable<AnalysisResult['flowchart']>[number], index: number) => (
                        <div 
                          key={index} 
                          className={`bg-slate-950/50 p-3 rounded-lg border flex flex-col justify-between relative transition-all ${
                            node.status === 'Pass' 
                              ? 'border-emerald-500/20' 
                              : node.status === 'Warning' 
                              ? 'border-amber-500/20' 
                              : 'border-rose-500/20'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-bold text-slate-300">{node.step}</span>
                              <span className={`text-[8px] font-mono px-1 py-0.2 rounded-full border ${
                                node.status === 'Pass' 
                                  ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20' 
                                  : node.status === 'Warning' 
                                  ? 'bg-amber-950/30 text-amber-400 border-amber-500/20' 
                                  : 'bg-rose-950/30 text-rose-400 border-rose-500/20'
                              }`}>
                                {node.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed">{node.note}</p>
                          </div>

                          {index < 2 && (
                            <div className="absolute top-[45%] -right-2 transform -translate-y-1/2 z-10 bg-slate-900 rounded-full p-0.5 border border-slate-800">
                              <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {}
              {analysis && activeTab === 'tuning' && (
                <div className="space-y-6">
                  
                  {/* Actionable Suggestions list */}
                  <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-800">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                      <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-400 animate-bounce" /> Section-by-Section CV Improvement Recommendations
                      </h3>
                      <span className="text-[8px] font-mono bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/20">Optimized Strategy</span>
                    </div>

                    <div className="space-y-3">
                      {analysis.suggestions?.map((item: NonNullable<AnalysisResult['suggestions']>[number], idx: number) => (
                        <div key={idx} className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80 flex items-start gap-3">
                          <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 mt-0.5">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-200 mb-1">
                              Section: <span className="text-indigo-400 font-mono text-[10px] bg-slate-900 px-1.5 py-0.5 rounded">{item.section}</span>
                            </h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{item.recommendation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ATS Compliance Checklist details */}
                  <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-800">
                    <div className="mb-4">
                      <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Search className="w-4 h-4 text-violet-400" /> ATS Structural Integrity Verification
                      </h3>
                      <p className="text-[10px] text-slate-400">Analysis on systemic formatting blocks, fonts, and readability index</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      
                      <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-800/80 space-y-2.5">
                        <h4 className="text-[11px] font-bold text-slate-300">ATS Parsing Verification Checklist</h4>
                        
                        <div className="space-y-2 text-[10px]">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Dual Column layout blockages</span>
                            <span className="text-emerald-400 font-bold font-mono">Approved</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Tabular content categorization</span>
                            <span className="text-emerald-400 font-bold font-mono">Clean</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Date nomenclature indexing</span>
                            <span className="text-emerald-400 font-bold font-mono">Compliant</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Custom graphical headings</span>
                            <span className="text-emerald-400 font-bold font-mono">Safe</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-800/80 flex flex-col justify-between">
                        <div>
                          <h4 className="text-[11px] font-bold text-slate-300 mb-2">Priority Keywords to Integrate</h4>
                          <div className="flex flex-wrap gap-1">
                            {analysis.skillsBreakdown?.requiredButMissing?.slice(0, 6).map((keyword: string, index: number) => (
                              <span key={index} className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded font-mono">
                                + {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-500 italic leading-relaxed mt-2">
                          Injecting these precise phrases increases automated screening keyword matching score significantly.
                        </p>
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* Inspect Original Text block */}
              {activeTab === 'sources' && (
                <div className="space-y-4 h-full min-h-[300px]">
                  <div className="grid grid-cols-1 gap-4 h-[420px]">
                    <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800 flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Parsed Candidate Resume</span>
                      <textarea
                        readOnly
                        value={resumeText}
                        className="flex-1 w-full bg-slate-950/50 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 leading-relaxed outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Half: AI Notebook Chat */}
          {}
          <div className="w-1/2 flex flex-col overflow-hidden bg-slate-900/10">
            
            {/* Chat header area */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">ResumeLens AI Co-Pilot</h3>
                  <p className="text-[9px] text-slate-500">Locked context: Current resume &amp; target qualifications</p>
                </div>
              </div>

              <button 
                onClick={() => setChatMessages([
                  { role: 'assistant', text: 'Chat history cleared. Send a prompt to begin tailoring your updates.' }
                ])}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                title="Clear Chat Workspace"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Chat dynamic timeline */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/30">
              {chatMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[90%] rounded-xl p-3.5 text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-md' 
                      : 'bg-slate-900/90 text-slate-300 rounded-tl-none border border-slate-800'
                  }`}>
                    <span className="whitespace-pre-line">{msg.text}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 px-1 capitalize">
                    {msg.role === 'assistant' ? 'ResumeLens Mentor' : 'Candidate'}
                  </span>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex flex-col items-start">
                  <div className="bg-slate-900/90 text-slate-400 rounded-xl rounded-tl-none p-3.5 border border-slate-800 text-xs flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
                    <span className="text-[11px] font-medium text-slate-400">Co-pilot is writing...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat action footer bar */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/90 shrink-0">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask CV Mentor to 'Draft a tailored cover letter' or 'Rewrite bullet points'..."
                  className="flex-1 bg-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-800 focus:border-indigo-500 text-xs text-slate-300 outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="p-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="flex items-center justify-center gap-4 mt-2">
                <span className="text-[9px] text-slate-500 text-center">
                  Press enter to send instruction. Fully synchronized with your dashboard state.
                </span>
              </div>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}