
import React, { useState, useEffect } from 'react';
import { User, QuizResult, Question, Analysis as AnalysisType, LeaderboardEntry } from './types';
import { generateQuiz, analyzeResults } from './services/geminiService';
import Quiz from './components/Quiz';
import Analysis from './components/Analysis';
import ChatBot from './components/ChatBot';
import { Beaker, BrainCircuit, GraduationCap, LayoutDashboard, ListOrdered, LogOut, Search, Sparkles, Loader2, ArrowRight, BookOpen, Star, Clock } from 'lucide-react';

const App: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('chem_user'));
  const [tempName, setTempName] = useState('');
  const [view, setView] = useState<'home' | 'quiz' | 'analysis' | 'leaderboard'>('home');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentResult, setCurrentResult] = useState<QuizResult | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("AI đang chuẩn bị nội dung...");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(
    JSON.parse(localStorage.getItem('chem_leaderboard') || '[]')
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      localStorage.setItem('chem_user', tempName);
      setUserName(tempName);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('chem_user');
    setUserName(null);
    setView('home');
  };

  const startQuiz = async (topic?: string) => {
    setIsLoading(true);
    setLoadingMsg(topic ? `AI đang biên soạn đề về ${topic}...` : "AI đang chuẩn bị đề ôn tập tổng hợp...");
    try {
      const newQuestions = await generateQuiz(topic);
      setQuestions(newQuestions);
      setView('quiz');
    } catch (err) {
      alert("Hệ thống đang bận. Vui lòng thử lại sau giây lát.");
    } finally {
      setIsLoading(false);
    }
  };

  const onQuizFinish = async (result: QuizResult) => {
    setIsLoading(true);
    setLoadingMsg("AI đang nghiên cứu bài làm của bạn...");
    setView('analysis');
    setCurrentResult(result);
    
    // Update leaderboard
    const newEntry: LeaderboardEntry = { name: userName!, score: result.score, date: result.date };
    const newLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    setLeaderboard(newLeaderboard);
    localStorage.setItem('chem_leaderboard', JSON.stringify(newLeaderboard));

    try {
      const report = await analyzeResults(questions, result.answers);
      setAnalysis(report);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userName) {
    return (
      <div className="min-h-screen bg-[#4f46e5] flex items-center justify-center p-4">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-700">
          <div className="hidden md:flex flex-col justify-center p-12 bg-indigo-50 border-r border-slate-100">
            <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
              <Beaker className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6 leading-tight">Chinh phục Hóa học 10 cùng AI.</h2>
            <div className="space-y-6">
              {[
                { icon: <Star className="text-yellow-500" />, text: "Phân tích lỗ hổng kiến thức chuẩn xác" },
                { icon: <Clock className="text-emerald-500" />, text: "Ôn tập theo chủ đề chỉ trong 20 phút" },
                { icon: <Sparkles className="text-purple-500" />, text: "Gia sư AI hỗ trợ giải đáp 24/7" }
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-4 text-slate-600 font-medium">
                  <div className="p-2 bg-white rounded-xl shadow-sm">{f.icon}</div>
                  {f.text}
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="md:hidden flex justify-center mb-8">
               <div className="bg-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center">
                <Beaker className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-center md:text-left mb-10">
              <h1 className="text-3xl font-black text-slate-800 mb-2">Chào mừng bạn!</h1>
              <p className="text-slate-500">Bắt đầu hành trình nâng cao điểm số ngay hôm nay.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Tên của bạn</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Nhập tên để AI nhận diện..."
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:outline-none transition-all text-lg font-semibold"
                />
              </div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-indigo-100 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3">
                Vào học ngay <ArrowRight className="w-5 h-5" />
              </button>
            </form>
            <p className="mt-8 text-center text-xs text-slate-400 font-medium">Phiên bản chính thức 1.0.0 • Powered by Gemini AI</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-8 border-b flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-2xl text-slate-900 tracking-tight">ChemMaster</span>
        </div>
        
        <nav className="flex-1 p-6 space-y-3">
          <button 
            onClick={() => setView('home')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${view === 'home' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <LayoutDashboard className="w-6 h-6" />
            Bảng điều khiển
          </button>
          <button 
            onClick={() => setView('leaderboard')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${view === 'leaderboard' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <ListOrdered className="w-6 h-6" />
            Bảng xếp hạng
          </button>
        </nav>
        
        <div className="p-6 border-t">
          <div className="flex items-center gap-4 mb-6 px-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
              {userName[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-slate-900 truncate">{userName}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Gold Student</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-sm font-bold"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          <span className="font-black text-xl text-slate-900">ChemMaster</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setView('leaderboard')} className="p-2 text-slate-500"><ListOrdered className="w-5 h-5" /></button>
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs" onClick={() => setView('home')}>
            {userName[0].toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        {isLoading && view !== 'quiz' && (
          <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-center p-6">
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              <Beaker className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="font-black text-2xl text-slate-900 mb-2">{loadingMsg}</h3>
            <p className="text-slate-500 font-medium">Trí tuệ nhân tạo đang làm việc để tạo ra nội dung tốt nhất cho bạn.</p>
          </div>
        )}

        {view === 'home' && (
          <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Chào {userName}! 🚀</h1>
                <p className="text-lg text-slate-500 font-medium">Hôm nay là một ngày tuyệt vời để học Hóa.</p>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-slate-600">AI Tutor: Online</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 group">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-auto">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-xs font-black uppercase tracking-widest mb-6">Thách thức hôm nay</span>
                    <h3 className="text-4xl font-black mb-4 leading-tight">Bài kiểm tra<br/>Năng lực Tổng hợp</h3>
                    <p className="text-indigo-100 text-lg mb-8 max-w-md opacity-90 font-medium">Hệ thống AI sẽ quét toàn bộ kiến thức của bạn để lập biểu đồ hổng kiến thức chỉ sau 20 câu hỏi.</p>
                  </div>
                  <button 
                    onClick={() => startQuiz()}
                    disabled={isLoading}
                    className="w-full sm:w-fit bg-white text-indigo-600 px-10 py-5 rounded-[1.25rem] font-black text-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 group"
                  >
                    Bắt đầu Kiểm tra ngay
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
                <BrainCircuit className="absolute -right-16 -bottom-16 w-80 h-80 text-white opacity-10 rotate-12 group-hover:rotate-0 transition-all duration-700" />
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                  <h4 className="font-black text-xl text-slate-900 mb-6 flex items-center gap-3">
                    <GraduationCap className="w-6 h-6 text-indigo-600" />
                    Lộ trình ưu tiên
                  </h4>
                  <div className="space-y-5">
                    {[
                      { topic: "Cấu tạo nguyên tử", color: "bg-emerald-500", progress: "85%" },
                      { topic: "Bảng tuần hoàn", color: "bg-indigo-500", progress: "40%" },
                      { topic: "Phản ứng Redox", color: "bg-rose-500", progress: "10%" }
                    ].map((m, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                          <span>{m.topic}</span>
                          <span className="text-xs text-slate-400">{m.progress}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                          <div className={`h-full ${m.color}`} style={{ width: m.progress }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    <span className="font-bold text-slate-400 text-sm">Học nhanh cùng AI</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">"Bạn có biết: Cân bằng phản ứng Oxi hóa khử bằng phương pháp thăng bằng electron là nền tảng quan trọng nhất của Hóa 10?"</p>
                  <button className="text-indigo-400 font-bold text-sm hover:underline flex items-center gap-1">Tìm hiểu thêm <ArrowRight className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
            
            <section>
              <div className="flex items-center justify-between mb-8">
                <h4 className="font-black text-2xl text-slate-900 tracking-tight">Ôn tập theo chuyên đề</h4>
                <button className="text-indigo-600 font-bold text-sm hover:underline">Xem tất cả</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: 'Cấu tạo nguyên tử', desc: 'Hạt nhân, lớp vỏ, obitan', icon: '⚛️' },
                  { name: 'Bảng tuần hoàn', desc: 'Chu kỳ, nhóm, quy luật', icon: '📅' },
                  { name: 'Liên kết hóa học', desc: 'Cộng hóa trị, ion', icon: '🔗' },
                  { name: 'Phản ứng Redox', desc: 'Số oxi hóa, cân bằng', icon: '⚡' }
                ].map((topic, i) => (
                  <button 
                    key={i} 
                    onClick={() => startQuiz(topic.name)}
                    disabled={isLoading}
                    className="group text-left bg-white p-6 rounded-[1.75rem] border border-slate-100 shadow-sm hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100 transition-all active:scale-[0.97] flex flex-col"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 text-3xl group-hover:bg-indigo-50 transition-colors">
                      {topic.icon}
                    </div>
                    <p className="font-black text-lg text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{topic.name}</p>
                    <p className="text-sm font-medium text-slate-400">{topic.desc}</p>
                    <div className="mt-6 flex items-center gap-2 text-indigo-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-all">
                      Học ngay <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
            
            <footer className="pt-10 border-t border-slate-200 text-center text-slate-400 text-xs font-bold uppercase tracking-widest pb-10">
              ChemMaster v1.0 • Final Release • © 2025 AI Education
            </footer>
          </div>
        )}

        {view === 'quiz' && (
          <div className="min-h-full flex items-center justify-center p-4">
            <Quiz questions={questions} onFinish={onQuizFinish} />
          </div>
        )}

        {view === 'analysis' && currentResult && analysis && (
          <Analysis 
            result={currentResult} 
            analysis={analysis} 
            onRestart={() => setView('home')} 
          />
        )}

        {view === 'leaderboard' && (
          <div className="max-w-3xl mx-auto p-6 md:p-10 animate-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
              <div className="bg-indigo-600 p-12 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                <div className="relative z-10">
                  <ListOrdered className="w-16 h-16 mx-auto mb-6 text-indigo-200" />
                  <h2 className="text-4xl font-black mb-2 tracking-tight">Bảng Vàng ChemMaster</h2>
                  <p className="text-indigo-100 font-medium text-lg">Vinh danh những học sinh xuất sắc nhất</p>
                </div>
              </div>
              <div className="p-4 md:p-8">
                {leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.map((entry, idx) => (
                      <div key={idx} className={`flex items-center gap-5 p-5 rounded-2xl transition-all border ${
                        idx === 0 ? 'bg-yellow-50 border-yellow-100' : 'bg-white border-slate-50 hover:border-indigo-100'
                      }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                          idx === 0 ? 'bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-200' :
                          idx === 1 ? 'bg-slate-200 text-slate-600' :
                          idx === 2 ? 'bg-orange-100 text-orange-700' :
                          'text-slate-300 bg-slate-50'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`font-black text-lg ${idx === 0 ? 'text-yellow-900' : 'text-slate-800'}`}>{entry.name}</p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(entry.date).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-indigo-600 leading-none">{entry.score}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-black mt-1">Điểm</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                      <Star className="w-10 h-10" />
                    </div>
                    <p className="text-slate-400 font-bold">Chưa có dữ liệu bảng xếp hạng</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-8 text-center">
              <button onClick={() => setView('home')} className="text-indigo-600 font-black hover:underline">Quay lại bảng điều khiển</button>
            </div>
          </div>
        )}
      </main>

      <ChatBot />
    </div>
  );
};

export default App;
