
import React, { useState, useEffect, useCallback } from 'react';
import { AppTab, SentencePair, WordAnalysis, AcademicWord, AcademicSentence, HistoryItem, LessonContent, ExamQuestion, WisdomItem, Subject, LessonPart } from './types';
import { geminiService } from './services/geminiService';
import { CURRICULUM_DATA } from './data/curriculumData';
import { BookOpen, Languages, Sparkles, BookCheck, ArrowLeft, Loader2, Search, Info, Copy, Check, Clock, Trash2, Home, GraduationCap, Lightbulb, Send, BrainCircuit, School, Download, ClipboardList, BookMarked, Printer, RotateCcw, XCircle, CheckCircle2, ListChecks, FileDown, Layers, FileText, LayoutGrid, Award, BookOpenCheck } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.HOME);
  const [inputText, setInputText] = useState('');
  const [sourceLang, setSourceLang] = useState<'English' | 'Arabic'>('English');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copyingId, setCopyingId] = useState<string | null>(null);

  // Virtual School States
  const [schoolLevel, setSchoolLevel] = useState<'Primary' | 'Secondary' | 'University' | null>(null);
  const [grade, setGrade] = useState<string | null>(null);
  const [curriculum, setCurriculum] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [lessonLength, setLessonLength] = useState<'Short' | 'Long'>('Short');
  const [studyMode, setStudyMode] = useState<'Topic' | 'FullSubject'>('Topic');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [exam, setExam] = useState<ExamQuestion[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [examResult, setExamResult] = useState<{ score: number; total: number; percentage: number } | null>(null);
  
  const [wisdoms, setWisdoms] = useState<WisdomItem[]>([]);
  const [results, setResults] = useState<{
    sentences?: SentencePair[];
    wordAnalysis?: WordAnalysis[];
    academicWords?: AcademicWord[];
    academicSentences?: AcademicSentence[];
  }>({});

  useEffect(() => {
    const saved = localStorage.getItem('makaranta_ai_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = useCallback((type: AppTab, data: any, input?: string) => {
    const newItem: HistoryItem = { id: Date.now().toString(), timestamp: Date.now(), type, input, data };
    const updated = [newItem, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem('makaranta_ai_history', JSON.stringify(updated));
  }, [history]);

  const loadFromHistory = useCallback((item: HistoryItem) => {
    setActiveTab(item.type);
    if (item.type === AppTab.VIRTUAL_SCHOOL) {
      setLesson(item.data);
    } else if (item.type === AppTab.WISDOM_HUB) {
      setWisdoms(item.data);
    } else if (item.type === AppTab.VOCAB_100) {
      setResults(prev => ({ ...prev, academicWords: item.data }));
    } else if (item.type === AppTab.SENTENCES_50) {
      setResults(prev => ({ ...prev, academicSentences: item.data }));
    } else if (item.type === AppTab.SENTENCE_STUDY) {
      setResults(prev => ({ ...prev, sentences: item.data }));
      if (item.input) setInputText(item.input);
    } else if (item.type === AppTab.WORD_BY_WORD) {
      setResults(prev => ({ ...prev, wordAnalysis: item.data }));
      if (item.input) setInputText(item.input);
    }
  }, []);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyingId(id);
      setTimeout(() => setCopyingId(null), 2000);
    } catch (err) {}
  };

  const copyAll = async (type: string) => {
    let fullText = "";
    if (type === 'lesson' && lesson) {
      fullText = `TITLE: ${lesson.title}\n\n`;
      lesson.parts.forEach((p, i) => {
        fullText += `Part ${i+1}\nEnglish: ${p.english}\nHausa: ${p.hausa}\n\n`;
      });
    } else if (type === 'sentences' && results.sentences) {
      fullText = results.sentences.map((s, i) => `${i + 1}. ${s.original} -> ${s.hausa}`).join('\n\n');
    }
    if (fullText) copyToClipboard(fullText, 'copy-all');
  };

  const handleSelectGrade = (lvl: string, grd: string) => {
    setGrade(grd);
    setCurriculum(CURRICULUM_DATA[lvl] || []);
  };

  const startLesson = async () => {
    if (!selectedTopic || !selectedSubject || !grade || !schoolLevel) return;
    setLoading(true);
    setStudyMode('Topic');
    try {
      const data = await geminiService.generateLesson(schoolLevel, grade, selectedSubject.name, selectedTopic, lessonLength);
      setLesson(data);
      setExam(null);
      setExamResult(null);
      setUserAnswers({});
      saveToHistory(AppTab.VIRTUAL_SCHOOL, data, `${grade}: ${selectedTopic}`);
    } catch (e) { 
      alert("An kasa samar da darasi. Tabbatar kana da intanet."); 
    } finally { 
      setLoading(false); 
    }
  };

  const startFullSubjectStudy = async (subject: Subject) => {
    if (!grade || !schoolLevel) return;
    setLoading(true);
    setStudyMode('FullSubject');
    setSelectedSubject(subject);
    try {
      const data = await geminiService.generateFullSubjectLesson(schoolLevel, grade, subject);
      setLesson(data);
      setExam(null);
      setExamResult(null);
      setUserAnswers({});
      saveToHistory(AppTab.VIRTUAL_SCHOOL, data, `${grade}: Full ${subject.name}`);
    } catch (e) {
      alert("An kasa samar da cikakken darasi.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueLesson = async () => {
    if (!lesson) return;
    setLoading(true);
    try {
      const newData = await geminiService.continueLesson(lesson);
      if (newData && newData.parts && newData.parts.length > 0) {
        const combinedLesson: LessonContent = {
          ...lesson,
          parts: [...lesson.parts, ...newData.parts],
          conclusion: newData.conclusion || lesson.conclusion
        };
        setLesson(combinedLesson);
        setTimeout(() => {
          window.scrollBy({ top: 300, behavior: 'smooth' });
        }, 100);
      } else {
        alert("Babu sauran bayanan da za a kara a yanzu.");
      }
    } catch (e) { 
      alert("An sami matsala wajen ci gaba da darasi."); 
    } finally { 
      setLoading(false); 
    }
  };

  const startExam = async () => {
    if (!lesson) return;
    setLoading(true);
    try {
      let questions: ExamQuestion[] = [];
      if (studyMode === 'FullSubject' && selectedSubject) {
        questions = await geminiService.generateFullSubjectExam(selectedSubject.name, selectedSubject.topics);
      } else {
        questions = await geminiService.generateExam(JSON.stringify(lesson));
      }
      setExam(questions);
    } catch (e) {
      alert("An kasa samar da jarabawa.");
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!inputText) return;
    setLoading(true);
    try {
      const data = await geminiService.getSentenceBySentence(inputText, sourceLang);
      setResults(prev => ({ ...prev, sentences: data }));
      saveToHistory(AppTab.SENTENCE_STUDY, data, inputText);
    } catch (e) { alert("An kasa yin fassara."); } finally { setLoading(false); }
  };

  const handleAnalyze = async () => {
    if (!inputText) return;
    setLoading(true);
    try {
      const data = await geminiService.getWordByWordAnalysis(inputText, sourceLang);
      setResults(prev => ({ ...prev, wordAnalysis: data }));
      saveToHistory(AppTab.WORD_BY_WORD, data, inputText);
    } catch (e) { alert("An kasa yin bincike."); } finally { setLoading(false); }
  };

  const submitExam = () => {
    if (!exam) return;
    let correctCount = 0;
    exam.forEach((q, i) => {
      if (userAnswers[i] === q.correctAnswer) correctCount++;
    });
    const percentage = Math.round((correctCount / exam.length) * 100);
    setExamResult({ score: correctCount, total: exam.length, percentage });
  };

  const retakeExam = () => {
    setUserAnswers({});
    setExamResult(null);
  };

  const filteredCurriculum = curriculum.filter(sub => 
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderVirtualSchool = () => (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <button onClick={() => { setActiveTab(AppTab.HOME); setLesson(null); setSchoolLevel(null); setGrade(null); setCurriculum([]); setSelectedSubject(null); setSelectedTopic(null); setExam(null); setExamResult(null); setStudyMode('Topic'); setSearchQuery(''); }} className="no-print flex items-center gap-2 text-slate-500 bg-white px-5 py-2.5 rounded-full border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors">
        <ArrowLeft size={18} /> Babban Shafin Farko
      </button>

      {!schoolLevel ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
          {['Primary', 'Secondary', 'University'].map(l => (
            <div key={l} onClick={() => setSchoolLevel(l as any)} className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-50 text-center cursor-pointer hover:border-indigo-500 hover:shadow-2xl transition-all active:scale-95 group">
              <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap size={40} className="text-indigo-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{l}</h3>
              <p className="text-slate-400 text-xs mt-2 font-bold uppercase">Makaranta</p>
            </div>
          ))}
        </div>
      ) : !grade ? (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 no-print shadow-xl">
          <h2 className="text-3xl font-black mb-8 text-slate-800 text-center">Zabi Aji (Level)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(schoolLevel === 'Primary' ? ['Aji 1', 'Aji 2', 'Aji 3', 'Aji 4', 'Aji 5', 'Aji 6'] : 
              schoolLevel === 'Secondary' ? ['JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'] :
              ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level', 'Final Year']).map(g => (
              <button key={g} onClick={() => handleSelectGrade(schoolLevel, g)} className="p-6 bg-slate-50 rounded-3xl font-black text-slate-700 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-sm">
                {g}
              </button>
            ))}
          </div>
        </div>
      ) : !lesson ? (
        <div className="space-y-6 no-print">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b-2 border-slate-50 pb-6">
               <h2 className="text-3xl font-black text-indigo-600 flex items-center gap-3"><BookMarked size={32} /> Tsarin Karatun {grade}</h2>
               <div className="relative w-full md:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Nemo darasi..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                  />
               </div>
            </div>
            
            <div className="space-y-4">
              {!selectedSubject ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCurriculum.map((sub, i) => (
                    <div key={i} className="group bg-white border-2 border-slate-100 rounded-[2rem] p-6 hover:border-indigo-500 hover:shadow-xl transition-all flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                         <span className="font-black text-slate-800 text-2xl">{sub.name}</span>
                         <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600"><BookOpen size={20}/></div>
                      </div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{sub.topics.length} Topics</p>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <button onClick={() => { setSelectedSubject(sub); setStudyMode('Topic'); }} className="bg-indigo-600 text-white py-3 rounded-xl font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-2">
                          <LayoutGrid size={16}/> Zaɓi Topic
                        </button>
                        <button onClick={() => startFullSubjectStudy(sub)} className="bg-emerald-600 text-white py-3 rounded-xl font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-2">
                          <Layers size={16}/> Full Subject
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredCurriculum.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                       <Search size={48} className="mx-auto text-slate-200 mb-4" />
                       <p className="text-slate-400 font-black italic">Ba a sami darasin da kake nema ba.</p>
                    </div>
                  )}
                </div>
              ) : !selectedTopic && studyMode === 'Topic' ? (
                <div className="space-y-5">
                  <button onClick={() => setSelectedSubject(null)} className="text-indigo-600 font-black flex items-center gap-2 mb-2 hover:bg-indigo-50 px-4 py-2 rounded-full transition-colors"><ArrowLeft size={18}/> Komawa ga Subjects</button>
                  <h3 className="font-black text-slate-800 text-xl border-b-2 border-slate-100 pb-2">Zabi Topic a cikin {selectedSubject.name}:</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedSubject.topics.map((t, i) => (
                      <button key={i} onClick={() => setSelectedTopic(t)} className="p-5 bg-indigo-50 rounded-2xl text-left font-black text-indigo-800 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">{t}</button>
                    ))}
                  </div>
                </div>
              ) : null}
              {selectedTopic && studyMode === 'Topic' && !lesson && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <button onClick={() => setSelectedTopic(null)} className="text-indigo-600 font-black flex items-center gap-2 hover:bg-indigo-50 px-4 py-2 rounded-full transition-colors"><ArrowLeft size={18}/> Zabi Wani Topic</button>
                  <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100">
                    <p className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-2">Shirye kake ka fara koyon:</p>
                    <h4 className="text-4xl font-black">{selectedTopic}</h4>
                  </div>
                  <div className="space-y-3 bg-slate-50 p-6 rounded-3xl">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Zabi Yadda Darasin Zai Kasance (Length):</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setLessonLength('Short')} className={`p-5 rounded-2xl font-black border-2 transition-all flex flex-col items-center gap-2 ${lessonLength === 'Short' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'}`}>
                        <span className="text-xl">Gajere</span>
                        <span className="text-[10px] uppercase opacity-60">(Short Lesson)</span>
                      </button>
                      <button onClick={() => setLessonLength('Long')} className={`p-5 rounded-2xl font-black border-2 transition-all flex flex-col items-center gap-2 ${lessonLength === 'Long' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'}`}>
                        <span className="text-xl">Dogo</span>
                        <span className="text-[10px] uppercase opacity-60">(Long Lesson)</span>
                      </button>
                    </div>
                  </div>
                  <button onClick={startLesson} disabled={loading} className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black text-2xl shadow-xl shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-4">
                     {loading ? <Loader2 className="animate-spin" /> : <Sparkles />} Fara Karatun Yanzu
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="content-box bg-white p-2 rounded-[3rem] no-print:shadow-2xl no-print:border no-print:border-slate-100">
          {loading && !exam && (
             <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-6 no-print">
                <Loader2 size={64} className="text-indigo-600 animate-spin" />
                <div className="text-center space-y-2">
                   <h2 className="text-3xl font-black text-slate-800">
                      {studyMode === 'FullSubject' ? 'Muna Shirya Cikakken Karatun Darasi...' : 'Muna Shirya Maka Jarabawa...'}
                   </h2>
                   <p className="text-slate-400 font-bold uppercase tracking-widest">
                      {studyMode === 'FullSubject' ? 'Ana tattaro dukkan topics na wannan darasin' : 'Wannan jarabawar za ta fito daga dukkan sassan karatu'}
                   </p>
                </div>
             </div>
          )}
          <div className="p-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 no-print border-b border-slate-50 pb-6 gap-4">
              <div className="flex items-center gap-4">
                 <div className={`p-4 rounded-2xl text-white shadow-lg ${studyMode === 'FullSubject' ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
                    {studyMode === 'FullSubject' ? <Layers size={32}/> : <BookMarked size={32}/>}
                 </div>
                 <div>
                    <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">{lesson.title}</h2>
                    <p className="flex items-center gap-2 text-slate-400 font-bold uppercase text-xs mt-1">
                       {selectedSubject?.name} • {grade} 
                       {studyMode === 'FullSubject' && (
                         <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                           <Award size={12}/> FULL COURSE
                         </span>
                       )}
                    </p>
                 </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button onClick={() => window.print()} className="flex-1 md:flex-none p-5 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-3 font-black group" title="Zazzage a matsayin PDF">
                  <FileDown size={24} className="group-hover:translate-y-0.5 transition-transform" />
                  <span>Zazzage PDF</span>
                </button>
                <button onClick={() => copyAll('lesson')} className="p-5 bg-slate-100 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all hover:bg-white hover:shadow-md" title="Kofi Duka">
                   {copyingId === 'copy-all' ? <Check size={24} className="text-green-500" /> : <ClipboardList size={24}/>}
                </button>
              </div>
            </div>
            
            {/* Professional Paper Header for PDF */}
            <div className="print-only mb-10 text-center border-b-[6pt] border-double border-slate-900 pb-6">
              <h1 className="text-4xl font-black uppercase mb-2 tracking-tighter">MAKARANTA AI ACADEMY</h1>
              <p className="text-base font-black text-slate-600 italic">Bilingual Lesson Resource: English & Hausa Sentence-by-Sentence</p>
              <p className="text-sm font-bold uppercase mt-2">{studyMode === 'FullSubject' ? 'FINAL FULL SUBJECT COURSE MATERIAL' : 'SINGLE TOPIC STUDY MATERIAL'}</p>
              
              <div className="mt-8 flex justify-between gap-10 text-sm font-black uppercase">
                 <div className="flex-1 border-b border-black text-left pb-1">SUNA (NAME): ________________________________________________</div>
                 <div className="w-1/3 border-b border-black text-left pb-1">DATE: ___________________</div>
              </div>

              <div className="flex justify-between mt-8 text-sm font-black uppercase tracking-widest border-t border-slate-200 pt-4">
                <span>SUBJECT: {selectedSubject?.name}</span>
                <span>GRADE: {grade}</span>
                <span>ACADEMIC YEAR: 2025/2026</span>
              </div>
            </div>

            <h2 className="print-only title-print">{lesson.title}</h2>
            
            <div className="lesson-section mb-10 p-8 bg-indigo-50/50 rounded-[2.5rem] border-l-[12px] border-indigo-600 shadow-sm print:bg-white print:border-l-4 print:p-4 print:rounded-none">
               <p className="text-2xl leading-relaxed text-indigo-900 font-black print:text-lg">{lesson.introduction}</p>
            </div>

            <div className="space-y-8 md:space-y-12 print:space-y-6">
              {lesson.parts.map((part, i) => (
                <div key={i} className="bilingual-container group animate-in fade-in slide-in-from-bottom-2">
                  <div className="bilingual-part-eng p-6 md:p-8 bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm group-hover:border-indigo-100 transition-all print:border-none print:p-0 print:shadow-none">
                    <span className="no-print flex items-center gap-2 text-xs font-black text-indigo-400 uppercase tracking-widest mb-3">
                       {studyMode === 'FullSubject' ? (
                         <><BookOpen size={14}/> TOPIC: {selectedSubject?.topics[i] || 'Details'}</>
                       ) : (
                         <>Ingilishi (Part {i+1})</>
                       )}
                    </span>
                    <p className="text-2xl md:text-3xl text-slate-900 leading-[1.6] font-bold print:text-base print:leading-normal">{part.english}</p>
                  </div>
                  <div className="bilingual-part-hau p-6 md:p-8 bg-slate-50 rounded-[2rem] border-l-8 border-emerald-500 print:bg-white print:border-l print:p-0 print:pl-4 print:border-slate-300">
                    <span className="no-print block text-xs font-black text-emerald-400 uppercase tracking-widest mb-3">Fassarar Hausa</span>
                    <p className="text-2xl md:text-3xl text-slate-700 italic leading-[1.6] font-black print:text-base print:leading-normal">{part.hausa}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="lesson-section mt-12 p-8 bg-slate-900 rounded-[2.5rem] text-white print:bg-white print:text-black print:border-t-2 print:border-slate-200 print:mt-10 print:p-4">
               <p className="text-2xl leading-relaxed font-black print:text-lg">Conclusion: {lesson.conclusion}</p>
            </div>

            <div className="mt-16 flex flex-col md:flex-row gap-6 no-print">
              <button 
                onClick={startExam} 
                disabled={loading} 
                className={`flex-[1.5] text-white py-6 rounded-3xl font-black text-2xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 ${studyMode === 'FullSubject' ? 'bg-orange-600 shadow-orange-200' : 'bg-indigo-600 shadow-indigo-200'}`}
              >
                {loading && !exam ? <Loader2 className="animate-spin" /> : <BookOpenCheck size={32} />} 
                {studyMode === 'FullSubject' ? 'Fara Babban Jarabawa (50 Qs)' : 'Fara Jarabawa (30 Qs)'}
              </button>
              {studyMode === 'Topic' && (
                <button 
                  onClick={handleContinueLesson} 
                  disabled={loading} 
                  className="flex-1 bg-emerald-600 text-white py-6 rounded-3xl font-black text-2xl shadow-2xl shadow-emerald-200 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading && !exam ? <Loader2 className="animate-spin" /> : <Sparkles size={32} />} Ci gaba da Karatu
                </button>
              )}
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-white border-2 border-slate-200 text-slate-500 py-6 rounded-3xl font-black text-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Printer size={24}/> Print Course
              </button>
              <button onClick={() => { setLesson(null); setSelectedSubject(null); }} className="px-10 bg-slate-100 text-slate-500 rounded-3xl font-black text-xl hover:bg-slate-200 transition-colors">Koma Curriculum</button>
            </div>
          </div>

          {exam && !examResult && (
            <div className="mt-12 p-10 bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-100 space-y-10 no-print">
              <div className="flex justify-between items-center sticky top-20 bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-sm z-10 border border-slate-100">
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${studyMode === 'FullSubject' ? 'bg-orange-600' : 'bg-indigo-600'}`}>
                      {studyMode === 'FullSubject' ? <Award size={24}/> : <FileText size={24}/>}
                   </div>
                   <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                      {studyMode === 'FullSubject' ? `Final Exam: ${selectedSubject?.name}` : `Quiz: ${selectedTopic}`}
                   </h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-400 uppercase">Progress</p>
                    <p className="text-xl font-black text-slate-800">{Object.keys(userAnswers).length} / {exam.length}</p>
                  </div>
                  <div className="w-40 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${studyMode === 'FullSubject' ? 'bg-orange-500' : 'bg-indigo-500'}`} style={{ width: `${(Object.keys(userAnswers).length / exam.length) * 100}%` }}></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-12">
                {exam.map((q, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2rem] shadow-lg border border-slate-50 space-y-6">
                    <p className="text-2xl font-black text-slate-900 leading-relaxed">
                       <span className={`${studyMode === 'FullSubject' ? 'text-orange-600' : 'text-indigo-600'} mr-2`}>Q{i + 1}:</span> {q.question}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => setUserAnswers({ ...userAnswers, [i]: opt })} 
                          className={`p-6 rounded-[1.5rem] border-2 text-left transition-all text-lg font-black flex items-center gap-4 ${userAnswers[i] === opt ? (studyMode === 'FullSubject' ? 'bg-orange-600 text-white border-orange-600' : 'bg-indigo-600 text-white border-indigo-600') + ' shadow-xl -translate-y-1' : 'bg-slate-50 border-transparent hover:border-indigo-200 hover:bg-white'}`}
                        >
                          <span className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-sm">{String.fromCharCode(65 + idx)}</span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-10 text-center">
                <button 
                  onClick={submitExam} 
                  disabled={Object.keys(userAnswers).length < exam.length} 
                  className="bg-green-600 text-white px-16 py-8 rounded-[2rem] font-black text-3xl shadow-2xl shadow-green-200 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-95"
                >
                  Mika Amsoshi (Submit Final Exam)
                </button>
                {Object.keys(userAnswers).length < exam.length && (
                  <p className="text-red-500 font-black mt-4 animate-bounce">Sauran tambayoyi {exam.length - Object.keys(userAnswers).length}!</p>
                )}
              </div>
            </div>
          )}

          {examResult && (
            <div className="mt-12 p-12 bg-white rounded-[3rem] text-center space-y-10 no-print border-4 border-slate-100">
              <div className="space-y-4">
                <div className={`w-48 h-48 rounded-full flex flex-col items-center justify-center mx-auto shadow-inner border-[12px] ${examResult.percentage >= 70 ? 'bg-green-50 text-green-600 border-green-500' : examResult.percentage >= 40 ? 'bg-orange-50 text-orange-600 border-orange-500' : 'bg-red-50 text-red-600 border-red-500'}`}>
                  <span className="text-6xl font-black leading-none">{examResult.percentage}</span>
                  <span className="text-xs font-black uppercase tracking-tighter mt-1">Maki (Score / 100)</span>
                </div>
                <h3 className="text-4xl font-black text-slate-800 tracking-tight">Madallah! Ga Sakamakon Ka</h3>
                <p className="text-2xl text-slate-500 font-bold">Ka amsa tambayoyi <span className="text-black">{examResult.score}</span> daidai cikin <span className="text-black">{examResult.total}</span>.</p>
              </div>

              <div className="space-y-8 text-left max-w-3xl mx-auto">
                <h4 className="text-2xl font-black border-b-2 border-slate-100 pb-3 flex items-center gap-3"><ListChecks className="text-indigo-600" /> Review Questions:</h4>
                <div className="space-y-6">
                  {exam?.map((q, i) => {
                    const isCorrect = userAnswers[i] === q.correctAnswer;
                    return (
                      <div key={i} className={`p-6 rounded-3xl border-2 ${isCorrect ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                        <p className="font-black text-slate-800 mb-3 text-lg flex gap-3">
                          <span className="shrink-0">{i+1}.</span>
                          <span>{q.question}</span>
                        </p>
                        <div className="space-y-2">
                           <p className={`flex items-center gap-2 text-sm font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                             {isCorrect ? <CheckCircle2 size={16}/> : <XCircle size={16}/>} 
                             Amsar Ka: {userAnswers[i]}
                           </p>
                           {!isCorrect && (
                             <p className="flex items-center gap-2 text-sm font-black text-emerald-600 bg-emerald-50 p-2 rounded-xl">
                               <CheckCircle2 size={16}/> Amsar Da Take Daidai: {q.correctAnswer}
                             </p>
                           )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <button onClick={retakeExam} className="flex-1 bg-indigo-600 text-white py-6 px-10 rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-3">
                   <RotateCcw /> Sake Rubuta Jarabawar
                </button>
                <button onClick={() => {setExam(null); setExamResult(null); setLesson(null); setSelectedSubject(null);}} className="flex-1 bg-slate-900 text-white py-6 px-10 rounded-[2rem] font-black text-xl shadow-xl shadow-slate-100 active:scale-95 transition-all">
                   Koma Shafi Na Baya
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 selection:bg-indigo-100">
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 px-6 h-16 flex items-center justify-between no-print shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab(AppTab.HOME)}>
          <div className="bg-indigo-600 w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-200 group-hover:rotate-6 transition-transform">M</div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Makaranta<span className="text-indigo-600 font-black">AI</span></h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab(AppTab.HOME)} className={`p-2.5 rounded-xl transition-all ${activeTab === AppTab.HOME ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`} title="Gida"><Home size={24} /></button>
          <button onClick={() => setActiveTab(AppTab.HISTORY)} className={`p-2.5 rounded-xl transition-all ${activeTab === AppTab.HISTORY ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`} title="Tarihi"><Clock size={24} /></button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6">
        {activeTab === AppTab.HOME && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-6 animate-in slide-in-from-bottom-6 duration-700 no-print">
            <Card onClick={() => setActiveTab(AppTab.VIRTUAL_SCHOOL)} icon={School} color="indigo" title="Virtual School" desc="Primary, Secondary & University" />
            <Card onClick={() => setActiveTab(AppTab.WISDOM_HUB)} icon={BrainCircuit} color="rose" title="Wisdom Hub" desc="Karin Magana & Hikimomi" />
            <Card onClick={() => setActiveTab(AppTab.SENTENCE_STUDY)} icon={Languages} color="blue" title="Translate Sentence" desc="Fassarar Jimla (Eng/Ara)" />
            <Card onClick={() => setActiveTab(AppTab.WORD_BY_WORD)} icon={Search} color="emerald" title="Word Analysis" desc="Binciken Kalmomi daki-daki" />
            <Card onClick={() => { setLoading(true); geminiService.get100AcademicWords().then(d => { setResults(r => ({...r, academicWords: d})); setActiveTab(AppTab.VOCAB_100); setLoading(false); }); }} icon={BookOpen} color="purple" title="100 Academic Words" desc="Muhimman Kalmomin Karatu" />
            <Card onClick={() => { setLoading(true); geminiService.get50AcademicSentences().then(d => { setResults(r => ({...r, academicSentences: d})); setActiveTab(AppTab.SENTENCES_50); setLoading(false); }); }} icon={BookCheck} color="orange" title="50 High Sentences" desc="Muhimman Jimloli 50" />
          </div>
        )}

        {loading && activeTab === AppTab.HOME && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
             <Loader2 className="animate-spin text-indigo-600" size={64} />
             <p className="font-black text-indigo-600 text-xl animate-pulse">Ana loda abubuwan karatu...</p>
          </div>
        )}

        {activeTab === AppTab.VIRTUAL_SCHOOL && renderVirtualSchool()}
        
        {activeTab === AppTab.WISDOM_HUB && (
          <div className="p-4 max-w-4xl mx-auto space-y-6">
            <button onClick={() => setActiveTab(AppTab.HOME)} className="no-print bg-white px-6 py-3 rounded-full border shadow-sm flex items-center gap-2 font-bold text-slate-500"><ArrowLeft size={18}/> Komawa Gida</button>
            <div className="flex flex-wrap gap-3 no-print">
              {['Karin Magana', 'Hikima', 'Falsafa', 'Tunani'].map(type => (
                <button key={type} onClick={() => { setLoading(true); geminiService.getWisdomContent(type).then(d => { setWisdoms(d); setLoading(false); }); }} className="px-8 py-4 bg-white rounded-3xl font-black text-slate-700 hover:bg-rose-600 hover:text-white border-2 border-transparent transition-all shadow-md active:scale-95">{type}</button>
              ))}
            </div>
            {loading ? <div className="py-20 text-center"><Loader2 className="animate-spin text-rose-500 mx-auto" size={48} /></div> : (
              <div className="grid grid-cols-1 gap-6 content-box">
                {wisdoms.map((w, i) => (
                  <div key={i} className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-50 shadow-lg lesson-section hover:-translate-y-1 transition-transform">
                    <h3 className="text-3xl font-black text-rose-600 mb-6 leading-tight italic">"{w.text}"</h3>
                    <div className="bg-slate-50 p-6 rounded-3xl border-l-8 border-rose-200">
                       <p className="text-xl text-slate-700 leading-relaxed font-black">{w.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(activeTab === AppTab.SENTENCE_STUDY || activeTab === AppTab.WORD_BY_WORD) && (
          <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
            <button onClick={() => setActiveTab(AppTab.HOME)} className="bg-white px-6 py-3 rounded-full border shadow-sm flex items-center gap-2 font-bold text-slate-500"><ArrowLeft size={18}/> Komawa Gida</button>
            <div className="bg-white p-10 rounded-[3rem] border shadow-2xl space-y-8">
              <h2 className="text-3xl font-black text-slate-800 text-center">{activeTab === AppTab.SENTENCE_STUDY ? 'Translate Sentence (Eng/Ara to Hausa)' : 'Word-by-Word Analysis'}</h2>
              <div className="space-y-6">
                <div className="flex gap-3 bg-slate-50 p-2 rounded-2xl">
                  <button onClick={() => setSourceLang('English')} className={`flex-1 py-4 rounded-xl font-black text-lg transition-all ${sourceLang === 'English' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>English</button>
                  <button onClick={() => setSourceLang('Arabic')} className={`flex-1 py-4 rounded-xl font-black text-lg transition-all ${sourceLang === 'Arabic' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Arabic</button>
                </div>
                <div className="space-y-2">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Rubuta abin da kake son fassarawa:</p>
                   <textarea value={inputText} onChange={e => setInputText(e.target.value)} placeholder={`Misali: "Education is the most powerful weapon..."`} className="w-full h-48 p-8 bg-slate-50 rounded-3xl border-none focus:ring-4 focus:ring-indigo-100 font-black text-2xl transition-all resize-none shadow-inner" />
                </div>
                <button onClick={activeTab === AppTab.SENTENCE_STUDY ? handleTranslate : handleAnalyze} disabled={loading || !inputText} className={`w-full py-6 rounded-2xl font-black text-2xl flex items-center justify-center gap-4 active:scale-95 transition-all shadow-xl ${activeTab === AppTab.SENTENCE_STUDY ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-emerald-600 text-white shadow-emerald-100'}`}>
                  {loading ? <Loader2 className="animate-spin" /> : activeTab === AppTab.SENTENCE_STUDY ? <Languages size={32} /> : <Search size={32} />} {activeTab === AppTab.SENTENCE_STUDY ? 'Fassara Yanzu' : 'Bincika Kalmomin'}
                </button>
              </div>
            </div>

            {results.sentences && activeTab === AppTab.SENTENCE_STUDY && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-2xl font-black text-slate-800 px-4">Sakamakon Fassara:</h3>
                {results.sentences.map((s, i) => (
                  <div key={i} className="bg-white p-10 rounded-[2.5rem] border shadow-lg space-y-8">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Original Sentence</p>
                       <p className="text-3xl font-bold text-slate-800 leading-snug">{s.original}</p>
                    </div>
                    <div className="h-0.5 bg-slate-50" />
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">Fassarar Hausa</p>
                       <p className="text-3xl font-black text-indigo-600 italic leading-snug">{s.hausa}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {results.wordAnalysis && activeTab === AppTab.WORD_BY_WORD && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                {results.wordAnalysis.map((w, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2rem] border shadow-lg space-y-6 hover:-translate-y-1 transition-transform">
                    <h4 className="text-4xl font-black text-emerald-600 tracking-tight">{w.word}</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Ma'anonin Kalmar (Hausa)</p>
                        <div className="flex flex-wrap gap-2">
                           {w.meanings.map((m, idx) => (
                             <span key={idx} className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-black border border-emerald-100 uppercase">{m}</span>
                           ))}
                        </div>
                      </div>
                      {w.context && (
                        <div className="bg-slate-50 p-5 rounded-2xl border-l-8 border-emerald-500">
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Amfani (Context)</p>
                          <p className="text-lg font-bold text-slate-600 italic leading-relaxed">{w.context}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === AppTab.VOCAB_100 && (
          <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
             <button onClick={() => setActiveTab(AppTab.HOME)} className="no-print bg-white px-6 py-3 rounded-full border shadow-sm font-bold text-slate-500">Gida</button>
             <div className="flex justify-between items-center no-print bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">100 Academic English Words</h2>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">High-Level Vocabulary for Students</p>
                </div>
                <button onClick={() => window.print()} className="p-4 bg-purple-600 text-white rounded-2xl shadow-xl shadow-purple-100 active:scale-95 transition-all flex items-center gap-2 font-black">
                   <Download /> Zazzage PDF
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 content-box">
                {results.academicWords?.map((item, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-[2rem] border-2 border-slate-50 shadow-md lesson-section hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3 mb-3">
                       <span className="bg-purple-100 text-purple-700 w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shadow-inner">{idx+1}</span>
                       <h3 className="text-2xl font-black text-slate-800 tracking-tight">{item.word}</h3>
                    </div>
                    <p className="text-xl font-black text-purple-600 mb-5 leading-tight">{item.hausaMeanings.join(', ')}</p>
                    <div className="p-5 bg-slate-50 rounded-2xl border-l-4 border-purple-200">
                      <p className="text-sm italic text-slate-400 mb-2 leading-relaxed">"{item.example}"</p>
                      <p className="text-sm font-black text-purple-400 leading-relaxed">{item.exampleHausa}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === AppTab.SENTENCES_50 && (
           <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
             <button onClick={() => setActiveTab(AppTab.HOME)} className="no-print bg-white px-6 py-3 rounded-full border shadow-sm font-bold text-slate-500">Gida</button>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 content-box">
                {results.academicSentences?.map((item, idx) => (
                  <div key={idx} className="bg-white p-10 rounded-[2.5rem] border shadow-lg lesson-section hover:-translate-y-1 transition-transform">
                    <div className="flex items-start gap-4 mb-4">
                       <span className="bg-orange-100 text-orange-700 w-12 h-12 rounded-full flex items-center justify-center text-lg font-black shrink-0 shadow-inner">{idx+1}</span>
                       <p className="text-3xl font-black text-slate-800 leading-snug tracking-tight">{item.sentence}</p>
                    </div>
                    <div className="h-0.5 bg-slate-50 my-6" />
                    <p className="text-3xl text-orange-600 font-black italic leading-snug mb-6">{item.hausa}</p>
                    <div className="p-6 bg-orange-50/50 rounded-3xl text-lg font-black text-slate-600 border-l-[10px] border-orange-200 leading-relaxed">
                       {item.explanation}
                    </div>
                  </div>
                ))}
             </div>
           </div>
        )}

        {activeTab === AppTab.HISTORY && (
          <div className="p-8 max-w-3xl mx-auto space-y-8 no-print animate-in slide-in-from-right-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-3xl font-black text-slate-800">Tarihin Bincike</h2>
              <button 
                onClick={() => { if(window.confirm("Shin kana son goge tarihin ka duka?")) { setHistory([]); localStorage.removeItem('makaranta_ai_history'); } }} 
                className="bg-red-50 text-red-600 px-6 py-3 rounded-full font-black text-sm hover:bg-red-100 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16}/> Goge Duka
              </button>
            </div>
            {history.length === 0 ? (
              <div className="text-center py-32 flex flex-col items-center gap-6">
                 <Clock size={80} className="text-slate-100" />
                 <p className="text-2xl text-slate-300 font-black italic">Babu tarihin bincike tukuna.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map(item => (
                  <div key={item.id} onClick={() => loadFromHistory(item)} className="bg-white p-8 rounded-[2rem] border-2 border-transparent hover:border-indigo-500 shadow-xl transition-all group cursor-pointer flex justify-between items-center hover:-translate-x-1">
                    <div className="overflow-hidden">
                      <p className="font-black text-2xl text-slate-800 truncate mb-1">{item.input || 'Activity'}</p>
                      <div className="flex items-center gap-3">
                         <p className="text-[10px] text-white bg-indigo-600 px-3 py-1 rounded-full uppercase font-black tracking-widest">{item.type.replace('_', ' ')}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(item.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                      <ArrowLeft size={24} className="rotate-180" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-3xl border border-white/40 px-10 py-5 rounded-[3rem] shadow-[0_25px_60px_rgba(0,0,0,0.15)] flex items-center gap-12 md:hidden z-40 no-print transition-all hover:scale-105 active:scale-95">
        <NavButton active={activeTab === AppTab.HOME} onClick={() => setActiveTab(AppTab.HOME)} icon={Home} />
        <NavButton active={activeTab === AppTab.VIRTUAL_SCHOOL} onClick={() => setActiveTab(AppTab.VIRTUAL_SCHOOL)} icon={School} />
        <NavButton active={activeTab === AppTab.WISDOM_HUB} onClick={() => setActiveTab(AppTab.WISDOM_HUB)} icon={BrainCircuit} />
        <NavButton active={activeTab === AppTab.HISTORY} onClick={() => setActiveTab(AppTab.HISTORY)} icon={Clock} />
      </nav>
    </div>
  );
};

const Card = ({ onClick, icon: Icon, color, title, desc }: any) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 hover:border-indigo-500 shadow-indigo-100/20',
    rose: 'bg-rose-50 text-rose-600 hover:border-rose-500 shadow-rose-100/20',
    blue: 'bg-blue-50 text-blue-600 hover:border-blue-500 shadow-blue-100/20',
    emerald: 'bg-emerald-50 text-emerald-600 hover:border-emerald-500 shadow-emerald-100/20',
    purple: 'bg-purple-50 text-purple-600 hover:border-purple-500 shadow-purple-100/20',
    orange: 'bg-orange-50 text-orange-600 hover:border-orange-500 shadow-orange-100/20',
  }[color as string] || 'bg-blue-50 text-blue-600 hover:border-blue-500';

  return (
    <div onClick={onClick} className={`group bg-white p-10 rounded-[3rem] border-2 border-slate-50 ${colors} shadow-2xl hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] cursor-pointer transition-all active:scale-95 flex flex-col items-start gap-6 hover:-translate-y-2`}>
      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg ${colors.split(' ')[0]}`}>
        <Icon size={36} strokeWidth={2.5} />
      </div>
      <div>
        <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight group-hover:text-black transition-colors">{title}</h3>
        <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.2em]">{desc}</p>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon: Icon }: any) => (
  <button onClick={onClick} className={`relative group transition-all duration-500 ${active ? 'text-indigo-600 scale-150' : 'text-slate-400 hover:text-slate-600'}`}>
    <Icon size={28} strokeWidth={active ? 3 : 2} />
    {active && <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.8)]"></span>}
  </button>
);

export default App;
