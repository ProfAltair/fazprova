import React, { useState } from 'react';
import { Exam } from '../types';
import { SlidersHorizontal, AlertCircle, FileText, Sparkles, CheckSquare, GraduationCap } from 'lucide-react';

interface AdaptationFormProps {
  savedExams: Exam[];
  selectedExam: Exam | null;
  onSelectExam: (exam: Exam | null) => void;
  onAdaptSubmit: (data: {
    originalExam: Exam;
    studentPerformance: string;
    type: 'adaptation' | 'recovery';
  }) => void;
  loading: boolean;
}

const diagnosesExamples = [
  {
    title: "TDAH / Dislexia (Foco em clareza)",
    text: "Estudante com TDAH e Dislexia. Apresenta dispersão com enunciados longos ou ambíguos. Necessita de perguntas curtas, objetivas, diretas e subdivididas, com apoios visuais de contexto."
  },
  {
    title: "Dificuldade em Frações (Recuperação)",
    text: "O aluno obteve nota baixa na prova original pois errou todas as questões conceituais e práticas envolvendo frações equivalentes e frações com denominadores diferentes."
  },
  {
    title: "Transtorno do Espectro Autista - TEA",
    text: "Estudante no espectro autista. Necessita de linguagem literal (sem metáforas ou duplo sentido), instruções passo a passo bem demarcadas e temas de interesse se possível."
  },
  {
    title: "Reforço de Leitura/Sintaxe (Recuperação)",
    text: "O diagnóstico mostra dificuldade de interpretação de textos literários complexos e identificação de sujeitos e predicados na oração. Necessita de recuperação focada nesses pilares."
  }
];

export default function AdaptationForm({
  savedExams,
  selectedExam,
  onSelectExam,
  onAdaptSubmit,
  loading
}: AdaptationFormProps) {
  const [type, setType] = useState<'adaptation' | 'recovery'>('adaptation');
  const [studentPerformance, setStudentPerformance] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !studentPerformance.trim()) return;

    onAdaptSubmit({
      originalExam: selectedExam,
      studentPerformance,
      type
    });
  };

  const applyExample = (exampleText: string) => {
    setStudentPerformance(exampleText);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-950/20 space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <div className="bg-indigo-500/10 p-2 rounded-lg">
          <SlidersHorizontal className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Item de Prova Adaptada & Recuperação</h2>
          <p className="text-xs text-slate-400">Ajustes personalizados de acordo com o desempenho individual de cada estudante</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Selecionar Prova de Origem */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            1. Selecionar Prova Base
          </label>
          {savedExams.length === 0 ? (
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 text-center text-slate-400 text-sm">
              Nenhuma prova salva na nuvem encontrada. Crie e salve uma avaliação na aba <span className="text-cyan-400 font-semibold">"Nova Prova"</span> primeiro para poder adaptá-la para seus alunos de forma personalizada.
            </div>
          ) : (
            <select
              value={selectedExam?.id || ""}
              onChange={(e) => {
                const exam = savedExams.find(ex => ex.id === e.target.value);
                onSelectExam(exam || null);
              }}
              className="w-full bg-slate-800 border border-slate-700/60 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200"
              required
            >
              <option value="">-- Escolha uma Prova de sua Lista --</option>
              {savedExams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} ({ex.subject} - {ex.grade})
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedExam && (
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 flex items-center space-x-3 text-xs text-slate-300">
            <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
            <div>
              <span className="font-semibold text-white block">Prova selecionada: {selectedExam.title}</span>
              <span>{selectedExam.questions.length} questões • Dificuldade: {selectedExam.difficulty} • Formato original: {selectedExam.format}</span>
            </div>
          </div>
        )}

        {/* 2. Escolher o Tipo de Ajuste */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            2. Tipo de Ajuste Pedagógico
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('adaptation')}
              className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                type === 'adaptation'
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300'
                  : 'bg-slate-800 border-slate-700/60 text-slate-400 hover:text-slate-300 hover:bg-slate-750'
              }`}
            >
              <div className="flex items-center space-x-2 font-semibold text-white mb-1 text-sm">
                <span>🧩</span>
                <span>Prova Adaptada</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">Adaptação para inclusão (TDAH, Dislexia, TEA, etc.). Simplifica enunciados e remove ruído cognitivo.</p>
            </button>

            <button
              type="button"
              onClick={() => setType('recovery')}
              className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                type === 'recovery'
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                  : 'bg-slate-800 border-slate-700/60 text-slate-400 hover:text-slate-300 hover:bg-slate-750'
              }`}
            >
              <div className="flex items-center space-x-2 font-semibold text-white mb-1 text-sm">
                <span>📚</span>
                <span>Prova de Recuperação</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">Avaliação de reforço focado nas lacunas específicas identificadas no diagnóstico do estudante.</p>
            </button>
          </div>
        </div>

        {/* 3. Desempenho e Diagnóstico */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex justify-between items-center">
            <span>3. Diagnóstico do Estudante / Desempenho Individual</span>
            <span className="text-[10px] text-slate-500 font-normal">Escreva as necessidades ou erros do aluno</span>
          </label>
          <textarea
            placeholder="Ex: Aluno apresenta dificuldade de leitura e errou todas as questões sobre multiplicação por 3 algarismos."
            value={studentPerformance}
            onChange={(e) => setStudentPerformance(e.target.value)}
            className="w-full h-28 bg-slate-800 border border-slate-700/60 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200 resize-none"
            required
            disabled={!selectedExam}
          />

          {/* Exemplos Rápidos de Diagnósticos */}
          {selectedExam && (
            <div className="pt-2">
              <span className="text-[10px] font-semibold text-slate-400 block mb-1.5 uppercase">Modelos Rápidos (Clique para Preencher):</span>
              <div className="flex flex-wrap gap-1.5">
                {diagnosesExamples.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyExample(ex.text)}
                    className="text-[10px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/50 px-2.5 py-1 rounded-md transition-all duration-150 cursor-pointer"
                  >
                    {ex.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botão de Envio */}
        <div>
          <button
            type="submit"
            disabled={loading || !selectedExam || !studentPerformance.trim()}
            className="w-full bg-gradient-to-r from-indigo-500 to-cyan-600 hover:from-indigo-600 hover:to-cyan-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg shadow-indigo-500/15 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center space-x-3">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processando Ajuste Individualizado...</span>
              </div>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-indigo-200 animate-pulse" />
                <span>Aplicar Adaptação Personalizada com IA</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
