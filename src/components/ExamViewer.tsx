import React, { useState } from 'react';
import { Exam, Question } from '../types';
import { 
  Printer, 
  Share2, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  BarChart4, 
  SlidersHorizontal, 
  FileCheck, 
  Copy, 
  Calendar,
  User,
  GraduationCap,
  Sparkles,
  Info
} from 'lucide-react';

interface ExamViewerProps {
  exam: Exam;
  onAdaptClick?: (exam: Exam) => void;
  onSaveToCloud?: () => void;
  isSaved?: boolean;
  saving?: boolean;
  isStudentMode?: boolean; // if student is viewing shared exam
}

export default function ExamViewer({ 
  exam, 
  onAdaptClick, 
  onSaveToCloud, 
  isSaved = false, 
  saving = false,
  isStudentMode = false 
}: ExamViewerProps) {
  const [showAnswers, setShowAnswers] = useState(!isStudentMode);
  const [showStats, setShowStats] = useState(true);
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?examId=${exam.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Prova de ${exam.subject} - ${exam.title}`,
          text: `Confira esta avaliação criada no Construtor de Prova AI de ${exam.subject} para o ${exam.grade}.`,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Erro ao compartilhar:", err);
      }
    } else {
      // Fallback para cópia para a área de transferência
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Erro ao copiar link:", err);
      }
    }
  };

  const difficultyColor = (score: number) => {
    if (score <= 4) return 'bg-emerald-500';
    if (score <= 7) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-8">
      {/* Menu de Ações Rápido (No Print) */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg">
            <FileCheck className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Avaliação Elaborada!</h3>
            <p className="text-xs text-slate-400">Escolha o que deseja fazer com a sua prova abaixo</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Visualizar Gabarito Toggle */}
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border flex items-center space-x-2 transition-all duration-200 cursor-pointer ${
              showAnswers 
                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700/80'
            }`}
          >
            <span>{showAnswers ? 'Ocultar Gabarito' : 'Mostrar Gabarito'}</span>
          </button>

          {/* Salvar na Nuvem */}
          {onSaveToCloud && !isSaved && (
            <button
              onClick={onSaveToCloud}
              disabled={saving}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 shadow-md shadow-cyan-500/15 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <span>☁️ Salvar na Nuvem</span>
                </>
              )}
            </button>
          )}

          {isSaved && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1">
              <span>✓ Salva na Nuvem</span>
            </div>
          )}

          {/* Adaptar Prova */}
          {onAdaptClick && (
            <button
              onClick={() => onAdaptClick(exam)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-500/15 transition-all duration-200 cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Adaptar / Recuperação</span>
            </button>
          )}

          {/* Compartilhar */}
          <button
            onClick={handleShare}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-700 flex items-center space-x-1.5 transition-all duration-200 cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span>{copied ? 'Link Copiado!' : 'Compartilhar'}</span>
          </button>

          {/* Imprimir / PDF */}
          <button
            onClick={handlePrint}
            className="bg-slate-100 hover:bg-white text-slate-900 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 transition-all duration-200 cursor-pointer shadow-md"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir / Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Estatísticas e Análise Pedagógica (No Print) */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <button
          onClick={() => setShowStats(!showStats)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-850/50 transition-all duration-200 cursor-pointer text-left"
        >
          <div className="flex items-center space-x-3">
            <BarChart4 className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Análise Estatística & Pedagógica</h3>
              <p className="text-xs text-slate-400">Habilidades BNCC, Taxonomia de Bloom e complexidade pedagógica</p>
            </div>
          </div>
          {showStats ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </button>

        {showStats && (
          <div className="p-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-900/40">
            {/* Dificuldade */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Índice de Dificuldade</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold text-white">{exam.statistics.difficultyScore}/10</span>
                <span className="text-xs text-slate-400">({exam.difficulty})</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className={`h-full ${difficultyColor(exam.statistics.difficultyScore)}`} 
                  style={{ width: `${exam.statistics.difficultyScore * 10}%` }}
                />
              </div>
            </div>

            {/* Sucesso Estimado */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Média de Acerto Estimada</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold text-emerald-400">{exam.statistics.estimatedSuccessRate}%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Média prevista de acertos com base na complexidade formulada.</p>
            </div>

            {/* Bloom */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Níveis Cognitivos (Bloom)</span>
              <div className="flex flex-wrap gap-1 mt-2">
                {exam.statistics.cognitiveLevels.map((lvl, index) => (
                  <span key={index} className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/20 font-medium">
                    {lvl}
                  </span>
                ))}
              </div>
            </div>

            {/* BNCC */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Habilidades BNCC</span>
              <div className="flex flex-col space-y-1 mt-1.5 max-h-[72px] overflow-y-auto pr-1">
                {exam.statistics.skillsEvaluated.map((skill, index) => (
                  <div key={index} className="text-[10px] text-slate-300 flex items-start">
                    <span className="text-cyan-400 mr-1">•</span>
                    <span className="truncate" title={skill}>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DOCUMENTO DA PROVA DE FATO (Esta área é formatada pelo @media print) */}
      <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xl print:shadow-none print:border-none print:p-0 print:mx-0">
        
        {/* Cabeçalho Escolar Oficial */}
        <div className="border-b-2 border-slate-900 pb-6 mb-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight uppercase">
                {exam.title || "Avaliação Escolar"}
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Disciplina: <span className="font-bold text-slate-900">{exam.subject}</span> | Série: <span className="font-bold text-slate-900">{exam.grade}</span>
              </p>
              {exam.adaptationType && exam.adaptationType !== 'none' && (
                <div className="inline-block bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border border-indigo-200 mt-1">
                  {exam.adaptationType === 'adaptation' ? 'Ajustada Pedagogicamente (Inclusiva)' : 'Recuperação Paralela'}
                </div>
              )}
            </div>
            
            <div className="text-right text-[10px] sm:text-xs text-slate-500 space-y-0.5">
              <p className="font-semibold text-slate-800">CONSTRUTOR DE PROVA</p>
              <p className="font-medium text-slate-700">Prof. Altair de Jesus</p>
              <p>Código: {exam.id.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>

          {/* Grade de Aluno */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 border-t border-slate-200 pt-4 text-xs">
            <div className="col-span-2 border-b border-slate-300 pb-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Nome do Estudante:</span>
              <div className="h-6" />
            </div>
            <div className="border-b border-slate-300 pb-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Turma:</span>
              <div className="h-6" />
            </div>
            <div className="border-b border-slate-300 pb-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Data:</span>
              <div className="h-6" />
            </div>
            <div className="col-span-2 sm:col-span-1 border-b border-slate-300 pb-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Professor(a):</span>
              <div className="h-6 text-slate-800 font-semibold pt-1">
                {exam.developerName || "Prof. Altair de Jesus"}
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 border-b border-slate-300 pb-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Tempo Sugerido:</span>
              <div className="h-6 text-slate-800 pt-1 font-medium">{exam.estimatedTime}</div>
            </div>
            <div className="border-b border-slate-300 pb-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Nota / Conceito:</span>
              <div className="h-6" />
            </div>
            <div className="border-b border-slate-300 pb-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Rubrica:</span>
              <div className="h-6" />
            </div>
          </div>
        </div>

        {/* Tópico de Instruções */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 mb-8 leading-relaxed">
          <p className="font-bold text-slate-800 mb-1">INSTRUÇÕES DE PROVA:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Preencha seu nome completo legivelmente no cabeçalho acima.</li>
            <li>Leia atentamente cada questão antes de iniciar a sua resposta.</li>
            <li>Utilize caneta esferográfica azul ou preta para as respostas definitivas.</li>
            <li>Não serão toleradas rasuras nas questões de múltipla escolha ou verdadeiro/falso.</li>
            <li>Evite o uso de aparelhos eletrônicos ou consultas não autorizadas pelo docente.</li>
          </ul>
        </div>

        {/* QUESTÕES */}
        <div className="space-y-8">
          {exam.questions.map((question, index) => (
            <div key={question.id} className="print-question-card space-y-4">
              <div className="flex items-start space-x-2">
                <span className="font-bold text-slate-900 text-sm sm:text-base bg-slate-100 px-2 py-0.5 rounded mr-1">
                  Questão {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-slate-900 font-semibold leading-relaxed text-sm sm:text-base">
                    {question.text}
                  </p>
                </div>
              </div>

              {/* Opções conforme o tipo */}
              {question.type === 'multiple_choice' && question.options && (
                <div className="grid grid-cols-1 gap-2.5 pl-6 sm:pl-10 mt-2">
                  {question.options.map((opt, oIndex) => (
                    <div key={oIndex} className="text-xs sm:text-sm text-slate-800 flex items-start space-x-2">
                      <span className="font-medium inline-block min-w-[20px]">{String.fromCharCode(65 + oIndex)})</span>
                      <span>{opt.replace(/^[A-Z]\)\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'true_false' && question.options && (
                <div className="space-y-2 pl-6 sm:pl-10 mt-2">
                  {question.options.map((opt, oIndex) => (
                    <div key={oIndex} className="text-xs sm:text-sm text-slate-800 flex items-start space-x-3">
                      <span className="inline-block border border-slate-400 rounded px-1.5 py-0.5 text-[10px] font-bold font-mono">
                        ( &nbsp; &nbsp; )
                      </span>
                      <span>{opt.replace(/^(\(\s*\))\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'essay' && (
                <div className="space-y-2 pl-6 sm:pl-10 mt-4 no-print">
                  <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Espaço reservado para resposta do estudante</p>
                    <div className="h-24" />
                  </div>
                </div>
              )}

              {/* Linhas de pauta reais para IMPRESSÃO (Substitui o quadrado acima no PDF) */}
              {question.type === 'essay' && (
                <div className="hidden print:block space-y-4 pl-6 sm:pl-10 mt-4">
                  <div className="border-b border-slate-300 h-6" />
                  <div className="border-b border-slate-300 h-6" />
                  <div className="border-b border-slate-300 h-6" />
                  <div className="border-b border-slate-300 h-6" />
                  <div className="border-b border-slate-300 h-6" />
                </div>
              )}

              {/* Resposta e Gabarito (Condicional) */}
              {showAnswers && (
                <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs leading-relaxed no-print print:block print:bg-slate-50 print:border print:border-slate-200 print:mt-4">
                  <div className="flex items-center space-x-1.5 text-indigo-600 font-bold uppercase tracking-wider text-[10px]">
                    <CheckCircle className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Gabarito Automático</span>
                  </div>
                  <p className="text-slate-900 font-semibold">
                    Resposta Esperada: <span className="bg-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded font-mono font-bold text-[11px]">{question.correctAnswer}</span>
                  </p>
                  <p className="text-slate-600 mt-1">
                    <span className="font-bold text-slate-700">Explicação para o Professor:</span> {question.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Rodapé da Prova */}
        <div className="border-t border-slate-200 mt-12 pt-6 flex justify-between items-center text-[10px] text-slate-500">
          <p>Avaliação elaborada através da Inteligência Artificial do Construtor de Prova.</p>
          <p className="font-medium text-slate-700">Desenvolvedor: Prof. Altair de Jesus</p>
        </div>
      </div>
    </div>
  );
}
