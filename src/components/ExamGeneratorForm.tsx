import React, { useState } from 'react';
import { BookOpen, FileText, BarChart, Clock, Award, Sparkles } from 'lucide-react';

interface ExamGeneratorFormProps {
  onGenerate: (formData: {
    subject: string;
    grade: string;
    syllabus: string;
    difficulty: string;
    format: string;
    estimatedTime: string;
  }) => void;
  loading: boolean;
}

const subjects = [
  "Matemática",
  "Língua Portuguesa",
  "História",
  "Geografia",
  "Ciências",
  "Biologia",
  "Física",
  "Química",
  "Inglês",
  "Filosofia",
  "Sociologia",
  "Artes"
];

const grades = [
  "1º ano (Fundamental I)",
  "2º ano (Fundamental I)",
  "3º ano (Fundamental I)",
  "4º ano (Fundamental I)",
  "5º ano (Fundamental I)",
  "6º ano (Fundamental II)",
  "7º ano (Fundamental II)",
  "8º ano (Fundamental II)",
  "9º ano (Fundamental II)",
  "1º ano (Ensino Médio)",
  "2º ano (Ensino Médio)",
  "3º ano (Ensino Médio)",
  "Curso Pré-Vestibular / ENEM"
];

const difficulties = [
  { value: "Fácil", label: "Fácil (Introdução/Conceitual)" },
  { value: "Médio", label: "Médio (Aplicação/Raciocínio)" },
  { value: "Difícil", label: "Difícil (Análise/Complexo)" }
];

const formats = [
  { value: "Múltipla Escolha (A a E)", label: "Múltipla Escolha (A a E)" },
  { value: "Múltipla Escolha (A a D)", label: "Múltipla Escolha (A a D)" },
  { value: "Dissertativa", label: "Dissertativa (Respostas Escritas)" },
  { value: "Verdadeiro ou Falso", label: "Verdadeiro ou Falso (V / F)" },
  { value: "Misto", label: "Formato Misto (Diversificado)" }
];

const times = [
  "45 minutos (1 aula)",
  "90 minutos (2 aulas)",
  "120 minutos (Avaliação Completa)",
  "Sem limite de tempo"
];

export default function ExamGeneratorForm({ onGenerate, loading }: ExamGeneratorFormProps) {
  const [subject, setSubject] = useState(subjects[0]);
  const [customSubject, setCustomSubject] = useState('');
  const [isCustomSubject, setIsCustomSubject] = useState(false);

  const [grade, setGrade] = useState(grades[5]);
  const [customGrade, setCustomGrade] = useState('');
  const [isCustomGrade, setIsCustomGrade] = useState(false);

  const [syllabus, setSyllabus] = useState('');
  const [difficulty, setDifficulty] = useState(difficulties[1].value);
  const [format, setFormat] = useState(formats[0].value);
  const [estimatedTime, setEstimatedTime] = useState(times[1]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabus.trim()) return;

    onGenerate({
      subject: isCustomSubject ? customSubject : subject,
      grade: isCustomGrade ? customGrade : grade,
      syllabus,
      difficulty,
      format,
      estimatedTime
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-950/20 space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <div className="bg-cyan-500/10 p-2 rounded-lg">
          <BookOpen className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Configurações Pedagógicas</h2>
          <p className="text-xs text-slate-400">Preencha os campos para orientar a inteligência artificial</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Disciplina */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            1. Disciplina
          </label>
          <div className="flex flex-col space-y-2">
            {!isCustomSubject ? (
              <select
                value={subject}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomSubject(true);
                  } else {
                    setSubject(e.target.value);
                  }
                }}
                className="w-full bg-slate-800 border border-slate-700/60 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200"
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
                <option value="custom">Outra disciplina...</option>
              </select>
            ) : (
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Nome da disciplina"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700/60 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsCustomSubject(false)}
                  className="text-xs text-slate-400 hover:text-white underline px-2"
                >
                  Lista
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. Série Escolar */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            2. Série Escolar
          </label>
          <div className="flex flex-col space-y-2">
            {!isCustomGrade ? (
              <select
                value={grade}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomGrade(true);
                  } else {
                    setGrade(e.target.value);
                  }
                }}
                className="w-full bg-slate-800 border border-slate-700/60 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200"
              >
                {grades.map((gr) => (
                  <option key={gr} value={gr}>{gr}</option>
                ))}
                <option value="custom">Outra série...</option>
              </select>
            ) : (
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Ex: 5º período Faculdade"
                  value={customGrade}
                  onChange={(e) => setCustomGrade(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700/60 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsCustomGrade(false)}
                  className="text-xs text-slate-400 hover:text-white underline px-2"
                >
                  Lista
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Conteúdo Programático (Full Width) */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex justify-between items-center">
            <span>3. Conteúdo Programático / Tópicos</span>
            <span className="text-[10px] text-slate-500 font-normal normal-case">Ex: Frações, Segunda Guerra Mundial, Sintaxe...</span>
          </label>
          <textarea
            placeholder="Digite os temas, conteúdos ou capítulos da matéria que serão cobrados nesta prova para um direcionamento cirúrgico."
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            className="w-full h-24 bg-slate-800 border border-slate-700/60 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200 resize-none"
            required
          />
        </div>

        {/* 4. Nível de Dificuldade */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            4. Nível de Dificuldade
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/60 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200"
          >
            {difficulties.map((diff) => (
              <option key={diff.value} value={diff.value}>{diff.label}</option>
            ))}
          </select>
        </div>

        {/* 5. Formato das Questões */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            5. Formato das Questões
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/60 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200"
          >
            {formats.map((form) => (
              <option key={form.value} value={form.value}>{form.label}</option>
            ))}
          </select>
        </div>

        {/* 6. Tempo Estimado para Conclusão */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            6. Tempo Estimado para a Conclusão da Prova
          </label>
          <select
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/60 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200"
          >
            {times.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading || !syllabus.trim()}
          className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center space-x-3">
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Elaborando Prova com IA...</span>
            </div>
          ) : (
            <>
              <Sparkles className="h-5 w-5 animate-pulse text-cyan-200" />
              <span>Gerar Exame Instantaneamente</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
