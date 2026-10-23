import React from 'react';
import {
  GraduationCap,
  Layers,
  Database,
  Code2,
  FileCheck,
  Cpu,
  BarChart2,
  Server,
  Workflow
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Title */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm space-y-2">
        <div className="inline-flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          <span>Project Overview &amp; Architecture Documentation</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          NIRF University Rankings — Exploratory Data Analysis Dashboard
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          An end-to-end full-stack data analytics web application developed for college mini-project
          demonstrations and higher-education policy analysis. The platform links a modern interactive React frontend
          directly to Python EDA services via FastAPI.
        </p>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Project Objective */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-indigo-600">
            <Workflow className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-sm">Project Objectives</h3>
          </div>
          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
            <li>
              Analyze the institutional distribution and regional clusters of India's top universities.
            </li>
            <li>
              Investigate the numerical relationship and correlation between NIRF composite scores and national ranks.
            </li>
            <li>
              Identify score skews, statistical outliers, and quartile boundaries via parametric and non-parametric distributions.
            </li>
            <li>
              Provide an intuitive user interface for students, researchers, and academic reviewers to inspect university metrics.
            </li>
          </ul>
        </div>

        {/* Dataset Information */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-blue-600">
            <Database className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-sm">Dataset Details</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The dataset originates from official National Institutional Ranking Framework (NIRF) university tables:
          </p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5 font-mono text-slate-700">
            <div><strong>Institute ID:</strong> Unique national accreditation identifier</div>
            <div><strong>Name:</strong> Official name of the university or institute</div>
            <div><strong>City:</strong> Municipal location of primary campus</div>
            <div><strong>State:</strong> State or Union Territory</div>
            <div><strong>Score:</strong> Weighted aggregate performance mark [0 – 100]</div>
            <div><strong>Rank:</strong> All-India university ranking position [1 – 100]</div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-emerald-600">
            <Cpu className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-sm">Full-Stack Technology Stack</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-indigo-700 flex items-center space-x-1 mb-1">
                <Code2 className="w-3.5 h-3.5" />
                <span>Frontend</span>
              </span>
              <ul className="text-slate-600 space-y-1 text-[11px]">
                <li>• React 18 + TypeScript</li>
                <li>• Vite Build Engine</li>
                <li>• Tailwind CSS (Navy/Indigo)</li>
                <li>• Recharts Interactive Charts</li>
                <li>• Lucide React Icons</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-emerald-700 flex items-center space-x-1 mb-1">
                <Server className="w-3.5 h-3.5" />
                <span>Backend</span>
              </span>
              <ul className="text-slate-600 space-y-1 text-[11px]">
                <li>• Python 3.14 + FastAPI</li>
                <li>• Pandas DataFrames</li>
                <li>• NumPy Statistics</li>
                <li>• Uvicorn ASGI Server</li>
                <li>• REST API &amp; JSON Endpoints</li>
              </ul>
            </div>
          </div>
        </div>

        {/* EDA Methodology */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-purple-600">
            <BarChart2 className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-sm">EDA Methodology</h3>
          </div>
          <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>
              <strong>Data Sanitization:</strong> Whitespace stripping across headers and string cells, duplicate elimination, coercion to numeric types.
            </li>
            <li>
              <strong>Missing Value Handling:</strong> Null Rank/Score records dropped, categorical nulls filled with "Unknown".
            </li>
            <li>
              <strong>Bivariate &amp; Univariate Exploration:</strong> 15-bin histograms, 5-number box plots, and Pearson correlation matrices.
            </li>
            <li>
              <strong>Spatial Frequency:</strong> State and city frequency tables highlighting national academic hubs.
            </li>
          </ol>
        </div>
      </div>

      {/* College Project Badge Footer */}
      <div className="p-5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm">College Mini-Project Submission</h4>
          <p className="text-xs text-slate-300 mt-0.5">
            NIRF University Rankings Exploratory Data Analysis &amp; Visualization System
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Status: Operational &bull; Live Connected
        </div>
      </div>
    </div>
  );
};
