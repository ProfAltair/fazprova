import React, { useState } from 'react';
import { Exam } from '../types';
import { FileText, Trash2, Calendar, Share2, BookOpen, Clock, UserCheck, ShieldCheck } from 'lucide-react';

interface ExamListProps {
  exams: Exam[];
  onSelect: (exam: Exam) => void;
  onDelete: (id: string) => void;
}

export default function ExamList({ exams, onSelect, onDelete }: ExamListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatDate = (createdAt: any) => {
    if (!createdAt) return 'Recentemente';
    // Se for timestamp do firestore
    if (createdAt.seconds) {
      return new Date(createdAt.seconds * 1000).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    // Se for string ou objeto Date
    try {
      return new Date(createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return 'Recentemente';
    }
  };

  const handleShare = async (e: React.MouseEvent, exam: Exam) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}?examId=${exam.id}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(exam.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Erro ao copiar link:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center">
            <span>Minhas Provas Salvas na Nuvem</span>
            <ShieldCheck className="ml-2 h-4 w-4 text-emerald-500" title="Armazenamento seguro ativado" />
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Seu banco de dados pedagógicos pessoal e privado</p>
        </div>
        <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-700/60 font-semibold">
          {exams.length} {exams.length === 1 ? 'Prova' : 'Provas'}
        </span>
      </div>

      {exams.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-4 shadow-xl">
          <div className="bg-slate-800 h-16 w-16 rounded-full flex items-center justify-center mx-auto border border-slate-700/50">
            <FileText className="h-8 w-8 text-slate-500" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-white font-semibold text-base">Nenhuma avaliação salva ainda</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Crie uma prova de alto nível escolhendo as configurações pedagógicas e clique em <span className="text-cyan-400 font-semibold">"Salvar na Nuvem"</span> para armazená-la de forma segura em sua conta de professor.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              onClick={() => onSelect(exam)}
              className="bg-slate-900 border border-slate-850 hover:border-slate-700 p-5 rounded-2xl transition-all duration-200 cursor-pointer shadow-lg hover:shadow-slate-950/40 relative group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-bold text-sm sm:text-base leading-snug group-hover:text-cyan-400 transition-colors duration-150">
                      {exam.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center">
                      <BookOpen className="h-3 w-3 text-cyan-500 mr-1 shrink-0" />
                      <span>{exam.subject} • {exam.grade}</span>
                    </p>
                  </div>
                  
                  {exam.adaptationType && exam.adaptationType !== 'none' && (
                    <span className="text-[9px] font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 px-2 py-0.5 rounded-md uppercase shrink-0">
                      {exam.adaptationType === 'adaptation' ? 'Adaptada' : 'Recuperação'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed bg-slate-950/20 p-2.5 rounded-lg border border-slate-850/50">
                  <span className="font-semibold text-slate-300">Tópicos:</span> {exam.syllabus}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-850 pt-4 mt-4 text-[11px] text-slate-400 font-medium">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 text-slate-500 mr-1" />
                    {formatDate(exam.createdAt)}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 text-slate-500 mr-1" />
                    {exam.estimatedTime.replace(/\s*\(.*\)/, '')}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 no-print">
                  {/* Share Link */}
                  <button
                    onClick={(e) => handleShare(e, exam)}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all duration-150 border border-transparent hover:border-slate-750 cursor-pointer"
                    title="Copiar link de compartilhamento"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    {copiedId === exam.id && (
                      <span className="absolute -top-8 right-0 bg-slate-800 text-white text-[9px] px-2 py-1 rounded shadow border border-slate-750 font-bold z-10 animate-fade-in">
                        Copiado!
                      </span>
                    )}
                  </button>
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Tem certeza que deseja excluir esta avaliação de sua nuvem? Essa ação não pode ser desfeita.")) {
                        onDelete(exam.id);
                      }
                    }}
                    className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-all duration-150 border border-transparent hover:border-red-500/20 cursor-pointer"
                    title="Excluir prova"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
