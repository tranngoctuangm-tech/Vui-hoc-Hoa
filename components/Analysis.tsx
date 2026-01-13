
import React from 'react';
import { Analysis as AnalysisType, QuizResult } from '../types';
import { Trophy, Target, Lightbulb, MapPin, ArrowRight, Share2, Download, CheckCircle2 } from 'lucide-react';

interface AnalysisProps {
  result: QuizResult;
  analysis: AnalysisType;
  onRestart: () => void;
}

const Analysis: React.FC<AnalysisProps> = ({ result, analysis, onRestart }) => {
  const accuracy = Math.round((result.correctAnswers / result.totalQuestions) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 pb-20">
      {/* Result Hero Section */}
      <div className="bg-white rounded-[2rem] p-10 shadow-2xl border border-slate-100 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Trophy className="w-10 h-10 text-yellow-500 float-anim" />
          </div>
          
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Chúc mừng bạn đã hoàn thành!</h2>
          <p className="text-slate-500 font-medium mb-8">Dưới đây là bảng phân tích chi tiết từ ChemMaster AI</p>
          
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-5xl font-black text-indigo-600 mb-1">{result.score}</div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Điểm số</div>
            </div>
            <div className="w-px h-12 bg-slate-100 hidden sm:block" />
            <div className="text-center">
              <div className="text-5xl font-black text-emerald-500 mb-1">{accuracy}%</div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Độ chính xác</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all">
              <Share2 className="w-4 h-4" /> Chia sẻ kết quả
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all">
              <Download className="w-4 h-4" /> Tải báo cáo PDF
            </button>
          </div>
        </div>
      </div>

      {/* Accuracy Progress Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg">
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-bold text-slate-800">Tỉ lệ hoàn thành mục tiêu</h3>
          <span className="text-indigo-600 font-black">{accuracy}%</span>
        </div>
        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-1000"
            style={{ width: `${accuracy}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths Card */}
        <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Target className="w-20 h-20 text-emerald-900" />
          </div>
          <div className="flex items-center gap-3 mb-6 text-emerald-700 font-bold text-lg">
            <CheckCircle2 className="w-6 h-6" />
            <h3>Điểm mạnh của bạn</h3>
          </div>
          <ul className="space-y-4">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex gap-3 items-start text-emerald-900 font-medium">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses Card */}
        <div className="bg-rose-50 rounded-3xl p-8 border border-rose-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Lightbulb className="w-20 h-20 text-rose-900" />
          </div>
          <div className="flex items-center gap-3 mb-6 text-rose-700 font-bold text-lg">
            <Lightbulb className="w-6 h-6" />
            <h3>Vùng cần bồi dưỡng</h3>
          </div>
          <ul className="space-y-4">
            {analysis.weaknesses.map((w, i) => (
              <li key={i} className="flex gap-3 items-start text-rose-900 font-medium">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Roadmap - Personal Coaching */}
      <div className="bg-slate-900 rounded-[2rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-10 blur-[80px]" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8 text-indigo-400 font-bold text-2xl">
            <MapPin className="w-8 h-8" />
            <h3>Chiến lược lấy lại gốc</h3>
          </div>
          
          <div className="space-y-6 text-slate-300 leading-relaxed font-medium">
            <div className="prose prose-invert max-w-none whitespace-pre-line text-lg">
              {analysis.roadmap}
            </div>
          </div>
          
          <div className="mt-10 p-6 bg-white/5 rounded-2xl border border-white/10 italic text-slate-400">
            <span className="text-yellow-400 font-bold not-italic mb-2 block">💡 Lời khuyên cuối cùng:</span>
            "{analysis.advice}"
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
        <button
          onClick={onRestart}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl font-bold shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 group active:scale-95"
        >
          Trở về Bảng điều khiển
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default Analysis;
