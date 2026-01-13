
import React, { useState, useEffect } from 'react';
import { User, QuizResult, Question, Analysis as AnalysisType, LeaderboardEntry, StudySummary } from './types';
import { generateQuiz, analyzeResults, getTopicSummary } from './services/geminiService';
import Quiz from './components/Quiz';
import Analysis from './components/Analysis';
import ChatBot from './components/ChatBot';
import { 
  Beaker, BrainCircuit, GraduationCap, LayoutDashboard, 
  ListOrdered, LogOut, Search, Sparkles, Loader2, 
  ArrowRight, BookOpen, Star, Clock, FileText, 
  Globe, Github, Code, Download 
} from 'lucide-react';

const App: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('chem_user'));
  const [tempName, setTempName] = useState('');
  const [view, setView] = useState<'home' | 'quiz' | 'analysis' | 'leaderboard' | 'materials' | 'guide'>('home');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentResult, setCurrentResult] = useState<QuizResult | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("AI đang chuẩn bị nội dung...");
  const [activeMaterial, setActiveMaterial] = useState<StudySummary | null>(null);
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

  const loadMaterial = async (topic: string) => {
    setIsLoading(true);
    setLoadingMsg(`AI đang tóm tắt kiến thức ${topic}...`);
    try {
      const summary = await getTopicSummary(topic);
      setActiveMaterial(summary);
      setView('materials');
    } catch (err) {
      alert("Không thể tải tài liệu lúc này.");
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    const data = leaderboard.map(e => `${e.name},${e.score},${e.date}`).join('\n');
    const blob = new Blob([`Tên,Điểm,Ngày\n${data}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chem_master_progress_${userName}.csv`;
    a.click();
  };

  const onQuizFinish = async (result: QuizResult) => {
    setIsLoading(true);
    setLoadingMsg("AI đang nghiên cứu bài làm của bạn...");
    setView('analysis');
    setCurrentResult(result);
    
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
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
          <button 
            onClick={() => loadMaterial('Cấu tạo nguyên tử')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${view === 'materials' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <FileText className="w-6 h-6" />
            Tài liệu học tập
          </button>
          <button 
            onClick={() => setView('guide')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${view === 'guide' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Globe className="w-6 h-6" />
            Hướng dẫn xuất bản
          </button>
        </nav>
        
        <div className="p-6 border-t">
          <div className="flex items-center gap-4 mb-6 px-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
              {userName[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-slate-900 truncate">{userName}</p>
              <button onClick={exportData} className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                <Download className="w-3 h-3" /> XUẤT DỮ LIỆU
              </button>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-sm font-bold">
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative">
        {isLoading && view !== 'quiz' && (
          <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-center p-6">
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              <Beaker className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="font-black text-2xl text-slate-900 mb-2">{loadingMsg}</h3>
            <p className="text-slate-500 font-medium">Đang xử lý dữ liệu qua Gemini AI...</p>
          </div>
        )}

        {view === 'home' && (
          <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Chào {userName}! 🚀</h1>
                <p className="text-lg text-slate-500 font-medium">Bảng điều khiển học tập cá nhân của bạn.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl group">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-auto">
                    <h3 className="text-4xl font-black mb-4 leading-tight">Bắt đầu ôn luyện</h3>
                    <p className="text-indigo-100 text-lg mb-8 max-w-md opacity-90 font-medium">Hệ thống sẽ tự động điều chỉnh độ khó dựa trên lịch sử làm bài của bạn.</p>
                  </div>
                  <button onClick={() => startQuiz()} className="w-full sm:w-fit bg-white text-indigo-600 px-10 py-5 rounded-[1.25rem] font-black text-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-3">
                    Làm bài tổng hợp <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl">
                 <h4 className="font-black text-xl text-slate-900 mb-6 flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                    Đọc nhanh kiến thức
                  </h4>
                  <div className="space-y-4">
                    {['Cấu tạo nguyên tử', 'Bảng tuần hoàn', 'Liên kết hóa học'].map(t => (
                      <button key={t} onClick={() => loadMaterial(t)} className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all font-bold text-slate-700 flex justify-between items-center group">
                        {t}
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                  </div>
              </div>
            </div>
          </div>
        )}

        {view === 'materials' && activeMaterial && (
          <div className="max-w-4xl mx-auto p-6 md:p-10 animate-in slide-in-from-right duration-500">
            <button onClick={() => setView('home')} className="mb-6 text-indigo-600 font-bold flex items-center gap-2">
              <ArrowRight className="w-4 h-4 rotate-180" /> Quay lại
            </button>
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
              <div className="bg-indigo-600 p-10 text-white">
                <h2 className="text-3xl font-black mb-2">{activeMaterial.topic}</h2>
                <p className="text-indigo-100 font-medium">{activeMaterial.content}</p>
              </div>
              <div className="p-10 space-y-8">
                <div>
                  <h4 className="font-black text-xl text-slate-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" /> Kiến thức trọng tâm
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeMaterial.keyPoints.map((p, i) => (
                      <li key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium text-slate-700 flex gap-3">
                        <span className="text-indigo-600 font-black">{i+1}.</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                   <h4 className="font-black text-indigo-900 mb-2">💡 Ví dụ minh họa:</h4>
                   <p className="text-indigo-800 leading-relaxed italic">{activeMaterial.example}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'guide' && (
          <div className="max-w-4xl mx-auto p-6 md:p-10 animate-in slide-in-from-bottom-8 duration-700">
            <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden text-white">
              <div className="p-12 border-b border-white/10">
                <Globe className="w-16 h-16 text-indigo-400 mb-6" />
                <h2 className="text-4xl font-black mb-4">Hướng dẫn Triển khai</h2>
                <p className="text-slate-400 text-lg">Cách đưa ứng dụng ChemMaster của bạn lên môi trường sản phẩm thực tế.</p>
              </div>
              <div className="p-12 space-y-12">
                <div className="space-y-6">
                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black shrink-0 shadow-lg">1</div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Chuẩn bị mã nguồn</h4>
                      <p className="text-slate-400 mb-4">Tải toàn bộ thư mục dự án lên một kho lưu trữ (Repository) trên **GitHub**.</p>
                      <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-sm text-indigo-300">
                        git add . <br/>
                        git commit -m "Initial commit" <br/>
                        git push origin main
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black shrink-0 shadow-lg">2</div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Kết nối Hosting (Vercel)</h4>
                      <p className="text-slate-400 mb-4">Truy cập **Vercel.com**, đăng nhập bằng GitHub và chọn "Add New Project".</p>
                      <ul className="list-disc ml-4 text-slate-400 space-y-1">
                        <li>Chọn Repo "ChemMaster"</li>
                        <li>Framework: Vite (Mặc định)</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center font-black shrink-0 shadow-lg">3</div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Cài đặt Biến môi trường (QUAN TRỌNG)</h4>
                      <p className="text-slate-400 mb-4">Tại phần **Environment Variables**, thêm biến API_KEY.</p>
                      <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 flex items-center gap-3 text-rose-300">
                        <Code className="w-5 h-5" />
                        <span>Key: <b>API_KEY</b> | Value: [Dán mã khóa Gemini của bạn]</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-10 border-t border-white/10 text-center">
                  <p className="text-slate-500 text-sm italic">"Ứng dụng sẽ tự động được cập nhật mỗi khi bạn đẩy mã mới lên GitHub."</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'quiz' && <div className="min-h-full flex items-center justify-center p-4"><Quiz questions={questions} onFinish={onQuizFinish} /></div>}
        {view === 'analysis' && currentResult && analysis && <Analysis result={currentResult} analysis={analysis} onRestart={() => setView('home')} />}
        {view === 'leaderboard' && (
          <div className="max-w-3xl mx-auto p-6 md:p-10 animate-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
              <div className="bg-indigo-600 p-12 text-white text-center relative overflow-hidden">
                <ListOrdered className="w-16 h-16 mx-auto mb-6 text-indigo-200" />
                <h2 className="text-4xl font-black mb-2 tracking-tight">Bảng Vàng ChemMaster</h2>
              </div>
              <div className="p-8">
                {leaderboard.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-5 p-5 rounded-2xl transition-all border border-slate-50 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black bg-indigo-50 text-indigo-600">{idx+1}</div>
                    <div className="flex-1 font-bold text-slate-800">{entry.name}</div>
                    <div className="text-2xl font-black text-indigo-600">{entry.score}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <ChatBot />
    </div>
  );
};

export default App;
