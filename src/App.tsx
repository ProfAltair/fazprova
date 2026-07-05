import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  Sparkles, 
  FileText, 
  Layers, 
  ShieldAlert, 
  Info, 
  ExternalLink, 
  Award, 
  BookmarkCheck,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import Header from './components/Header';
import ExamGeneratorForm from './components/ExamGeneratorForm';
import ExamViewer from './components/ExamViewer';
import ExamList from './components/ExamList';
import AdaptationForm from './components/AdaptationForm';
import { auth, saveExam, listUserExams, deleteExam, getExam } from './lib/firebase';
import { Exam } from './types';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'my-exams' | 'adapt'>('generate');
  const [loading, setLoading] = useState(false);
  const [adaptingLoading, setAdaptingLoading] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [selectedExamToAdapt, setSelectedExamToAdapt] = useState<Exam | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estados de Compartilhamento / Aluno
  const [sharedExam, setSharedExam] = useState<Exam | null>(null);
  const [isSharedView, setIsSharedView] = useState(false);
  const [loadingShared, setLoadingShared] = useState(false);

  // 1. Escuta mudanças de Autenticação do Usuário e Carrega Provas
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userExams = await listUserExams(currentUser.uid);
          setExams(userExams);
        } catch (err) {
          console.error("Erro ao carregar provas do usuário:", err);
        }
      } else {
        setExams([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Verifica se a URL contém um parâmetro de compartilhamento (examId)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const examId = params.get('examId');
    if (examId) {
      setLoadingShared(true);
      setIsSharedView(true);
      getExam(examId)
        .then((exam) => {
          if (exam) {
            setSharedExam(exam);
          } else {
            setError("A avaliação que você está tentando acessar não existe ou foi removida pelo professor.");
          }
        })
        .catch((err) => {
          console.error("Erro ao carregar prova compartilhada:", err);
          setError("Ocorreu um erro ao carregar a avaliação compartilhada.");
        })
        .finally(() => {
          setLoadingShared(false);
        });
    }
  }, []);

  // 3. Gerar Exame pelo Backend
  const handleGenerateExam = async (formData: {
    subject: string;
    grade: string;
    syllabus: string;
    difficulty: string;
    format: string;
    estimatedTime: string;
  }) => {
    setLoading(true);
    setError(null);
    setCurrentExam(null);

    try {
      const response = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro de servidor ao gerar avaliação.");
      }

      const data = await response.json();
      
      // Criar objeto completo de exame (com id provisório)
      const newExam: Exam = {
        ...data,
        id: 'tmp_' + Math.random().toString(36).substring(2, 11),
        createdBy: user?.uid || 'anonymous',
        createdAt: new Date().toISOString(),
        developerName: "Prof. Altair de Jesus",
        adaptationType: 'none'
      };

      setCurrentExam(newExam);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Não foi possível gerar a prova. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Adaptar Exame Existente pelo Backend
  const handleAdaptExam = async (data: {
    originalExam: Exam;
    studentPerformance: string;
    type: 'adaptation' | 'recovery';
  }) => {
    setAdaptingLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/adapt-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalExam: data.originalExam,
          studentPerformance: data.studentPerformance,
          type: data.type
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro de servidor ao adaptar avaliação.");
      }

      const adaptedData = await response.json();

      const newAdaptedExam: Exam = {
        ...adaptedData,
        id: 'tmp_' + Math.random().toString(36).substring(2, 11),
        createdBy: user?.uid || 'anonymous',
        createdAt: new Date().toISOString(),
        developerName: "Prof. Altair de Jesus",
        originalExamId: data.originalExam.id,
        adaptationType: data.type,
        studentPerformanceInfo: data.studentPerformance
      };

      setCurrentExam(newAdaptedExam);
      setActiveTab('generate'); // muda para aba de visualização do exame gerado
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Não foi possível aplicar a adaptação à prova.");
    } finally {
      setAdaptingLoading(false);
    }
  };

  // 5. Salvar Avaliação na Nuvem
  const handleSaveToCloud = async () => {
    if (!user) {
      alert("Por favor, acesse sua conta no cabeçalho clicando em 'Acessar Nuvem' para salvar suas provas com segurança!");
      return;
    }
    if (!currentExam) return;

    try {
      // Se tiver id temporário, cria um ID definitivo limpo para o Firestore
      const isTemp = currentExam.id.startsWith('tmp_');
      const finalId = isTemp ? 'exam_' + Math.random().toString(36).substring(2, 11) : currentExam.id;

      const examToSave: Exam = {
        ...currentExam,
        id: finalId,
        createdBy: user.uid,
        developerName: "Prof. Altair de Jesus"
      };

      await saveExam(examToSave);
      
      // Atualiza estado local
      setCurrentExam(examToSave);
      const updatedList = await listUserExams(user.uid);
      setExams(updatedList);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar a prova na nuvem de dados pedagógicos.");
    }
  };

  // 6. Excluir Avaliação da Nuvem
  const handleDeleteExam = async (id: string) => {
    try {
      await deleteExam(id);
      if (currentExam?.id === id) {
        setCurrentExam(null);
      }
      if (user) {
        const updatedList = await listUserExams(user.uid);
        setExams(updatedList);
      }
    } catch (err) {
      console.error("Erro ao excluir:", err);
    }
  };

  // 7. Selecionar uma Prova para Visualização/Ajuste
  const handleSelectSavedExam = (exam: Exam) => {
    setCurrentExam(exam);
    setActiveTab('generate');
  };

  // 8. Selecionar uma Prova para ser adaptada
  const handleSelectExamToAdapt = (exam: Exam) => {
    setSelectedExamToAdapt(exam);
    setActiveTab('adapt');
  };

  // Se estiver na VISUALIZAÇÃO DE COMPARTILHAMENTO DO ALUNO ou link externo
  if (isSharedView) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        {/* Cabeçalho do Aluno */}
        <header className="bg-slate-900 border-b border-slate-800 py-4 px-6 flex justify-between items-center no-print">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🎓</span>
            <h1 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
              Portal do Estudante - Avaliação AI
            </h1>
          </div>
          <div className="flex items-center space-x-2 text-[10px] sm:text-xs text-slate-400">
            <span>Desenvolvido por: </span>
            <span className="text-cyan-400 font-bold">Prof. Altair de Jesus</span>
          </div>
        </header>

        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
          {loadingShared ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-20">
              <svg className="animate-spin h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-slate-400">Carregando avaliação segura na nuvem...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto text-rose-400 font-bold text-xl">!</div>
              <p className="text-slate-200 text-sm font-medium">{error}</p>
              <button 
                onClick={() => {
                  window.location.href = window.location.origin;
                }}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Ir para o Painel Geral
              </button>
            </div>
          ) : sharedExam ? (
            <div className="space-y-6">
              <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Área do Aluno</span>
                  <p className="text-xs text-slate-300">Você pode ler, responder e imprimir esta prova para entrega física.</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
                >
                  <span>🖨️ Imprimir Prova</span>
                </button>
              </div>

              <ExamViewer exam={sharedExam} isStudentMode={true} />
            </div>
          ) : null}
        </main>
      </div>
    );
  }

  // INTERFACE PRINCIPAL DO PROFESSOR
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header user={user} onSelectTab={setActiveTab} activeTab={activeTab} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner Informativo (No Print) */}
        <div className="no-print bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1.5 text-center md:text-left">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center justify-center md:justify-start">
              <span className="mr-2">📚</span> Construtor Inteligente de Avaliações
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Desenvolvido pelo <span className="text-cyan-400 font-semibold">Prof. Altair de Jesus</span>, este assistente de IA pedagógica elabora avaliações escolares precisas, gerando gabarito completo de forma segura. Acesse sua conta Google no canto superior para salvar e compartilhar com seus alunos na nuvem.
            </p>
          </div>
          
          {!user && (
            <div className="flex items-center space-x-2 text-[10px] sm:text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 px-3 py-2 rounded-xl shrink-0">
              <Info className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>Modo visitante. Salve na nuvem fazendo login!</span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="no-print bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-xl text-xs sm:text-sm flex items-start space-x-3">
            <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Erro Encontrado</p>
              <p className="text-slate-300 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Abas */}
        <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Lado Esquerdo - Formulário / Navegação */}
          <div className="lg:col-span-5 space-y-6">
            {activeTab === 'generate' && (
              <ExamGeneratorForm onGenerate={handleGenerateExam} loading={loading} />
            )}

            {activeTab === 'adapt' && (
              <AdaptationForm 
                savedExams={exams} 
                selectedExam={selectedExamToAdapt} 
                onSelectExam={setSelectedExamToAdapt}
                onAdaptSubmit={handleAdaptExam} 
                loading={adaptingLoading} 
              />
            )}

            {activeTab === 'my-exams' && (
              <ExamList 
                exams={exams} 
                onSelect={handleSelectSavedExam} 
                onDelete={handleDeleteExam} 
              />
            )}
          </div>

          {/* Lado Direito - Visualização da Prova Atual */}
          <div className="lg:col-span-7">
            {currentExam ? (
              <ExamViewer 
                exam={currentExam} 
                onAdaptClick={handleSelectExamToAdapt}
                onSaveToCloud={handleSaveToCloud}
                isSaved={exams.some(ex => ex.id === currentExam.id)}
                saving={false}
              />
            ) : (
              <div className="no-print bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl h-[400px] flex flex-col items-center justify-center text-center p-8">
                <div className="bg-slate-900 h-16 w-16 rounded-full flex items-center justify-center border border-slate-800 shadow-md mb-4">
                  <BookmarkCheck className="h-7 w-7 text-indigo-400/70" />
                </div>
                <h3 className="text-slate-200 font-semibold text-base">Nenhum exame visualizado</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                  Configure os campos pedagógicos ao lado e clique em <span className="text-cyan-400 font-semibold">"Gerar Exame"</span>, ou selecione uma prova na aba <span className="text-cyan-400 font-semibold">"Minhas Provas"</span> para visualizá-la aqui.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer (No Print) */}
      <footer className="no-print bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-400 flex items-center justify-center">
          <Award className="h-3.5 w-3.5 text-cyan-400 mr-1.5" /> CONSTRUTOR DE PROVA AI
        </p>
        <p className="mt-1 font-medium text-slate-400">Desenvolvido por Prof. Altair de Jesus</p>
        <p className="text-[10px] text-slate-600 mt-2">Dados armazenados de forma criptografada na nuvem pedagógica segura.</p>
      </footer>
    </div>
  );
}
