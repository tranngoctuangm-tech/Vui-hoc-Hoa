
import React, { useState, useEffect } from 'react';
import { Question, QuizResult } from '../types';
import { Timer, CheckCircle, XCircle, ChevronRight, Loader2 } from 'lucide-react';

interface QuizProps {
  questions: Question[];
  onFinish: (result: QuizResult) => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number, userAnswer: number, isCorrect: boolean }[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes

  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const currentQuestion = questions[currentIndex];

  const handleNext = () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === currentQuestion.correctIndex;
    const newAnswer = {
      questionId: currentQuestion.id,
      userAnswer: selectedOption,
      isCorrect
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      handleFinish(newAnswers);
    }
  };

  const handleFinish = (finalAnswers = answers) => {
    const correctCount = finalAnswers.filter(a => a.isCorrect).length;
    const result: QuizResult = {
      score: correctCount * 5,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      answers: finalAnswers,
      date: new Date().toISOString()
    };
    onFinish(result);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-xl border border-slate-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
          <span className="bg-indigo-100 px-3 py-1 rounded-full">Câu {currentIndex + 1}/20</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 font-mono text-lg">
          <Timer className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full mb-8">
        <div 
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="mb-8">
        <div className="inline-block px-3 py-1 mb-3 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
          {currentQuestion.topic} • {currentQuestion.difficulty}
        </div>
        <h2 className="text-xl font-bold text-slate-800 leading-snug">
          {currentQuestion.text}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {currentQuestion.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => !showExplanation && setSelectedOption(idx)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between
              ${selectedOption === idx 
                ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                : 'border-slate-100 hover:border-indigo-200 bg-white text-slate-700'
              }
            `}
          >
            <span>{option}</span>
            {selectedOption === idx && <CheckCircle className="w-5 h-5 text-indigo-600" />}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNext}
          disabled={selectedOption === null}
          className={`px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all
            ${selectedOption !== null ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200' : 'bg-slate-300 cursor-not-allowed'}
          `}
        >
          {currentIndex === questions.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Quiz;
