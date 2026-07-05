import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Inicializa a API do Gemini
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("Aviso: GEMINI_API_KEY não foi configurada nas variáveis de ambiente!");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Endpoint para gerar provas normais
app.post("/api/generate-exam", async (req, res) => {
  try {
    const { subject, grade, syllabus, difficulty, format, estimatedTime } = req.body;

    if (!subject || !grade || !syllabus || !difficulty || !format || !estimatedTime) {
      return res.status(400).json({ error: "Todos os campos do formulário são obrigatórios." });
    }

    const prompt = `Gere uma prova de avaliação escolar personalizada com os seguintes parâmetros:
- Disciplina: ${subject}
- Série Escolar: ${grade}
- Conteúdo Programático: ${syllabus}
- Nível de Dificuldade: ${difficulty}
- Formato das Questões: ${format} (escolha formatos correspondentes como 'multiple_choice' para múltipla escolha, 'essay' para dissertativa, 'true_false' para verdadeiro ou falso, ou 'mixed' para misto)
- Tempo Estimado para Conclusão: ${estimatedTime}

A prova deve conter entre 5 e 10 questões de excelente qualidade pedagógica, com enunciados claros, opções bem formuladas (se houver), gabarito explícito e explicações detalhadas para cada questão. Também inclua uma análise estatística das habilidades avaliadas de acordo com a BNCC (Base Nacional Comum Curricular) e níveis cognitivos da Taxonomia de Bloom.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é um especialista em pedagogia e elaboração de avaliações escolares e acadêmicas de alta qualidade. Gere sempre respostas estruturadas de acordo com o esquema JSON fornecido, em idioma português do Brasil. Garanta que o conteúdo siga rigorosamente as diretrizes da BNCC.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Título profissional e contextualizado para a avaliação" },
            subject: { type: Type.STRING },
            grade: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            format: { type: Type.STRING },
            estimatedTime: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING, description: "Enunciado detalhado e claro da questão escolar" },
                  type: { type: Type.STRING, description: "Tipo da questão: 'multiple_choice', 'essay' ou 'true_false'" },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Alternativas se múltipla escolha de acordo com o formato solicitado (se for 'Múltipla Escolha (A a D)', gere exatamente 4 alternativas de A a D; se for 'Múltipla Escolha (A a E)', gere exatamente 5 alternativas de A a E; ex: ['A) Opção 1', 'B) Opção 2', ...]) ou verdadeiro/falso (ex: ['( ) Sentença 1', '( ) Sentença 2', ...]). Deixe vazio para questões dissertativas."
                  },
                  correctAnswer: { type: Type.STRING, description: "Gabarito claro. Para múltipla escolha, indique a letra (ex: 'A' ou 'C'). Para V/F, a sequência correta (ex: 'V, F, V'). Para dissertativa, forneça a resposta modelo ideal ou critérios de correção." },
                  explanation: { type: Type.STRING, description: "Explicação didática completa do gabarito, ajudando o professor a entender ou explicar aos alunos." }
                },
                required: ["id", "text", "type", "correctAnswer", "explanation"]
              }
            },
            statistics: {
              type: Type.OBJECT,
              properties: {
                cognitiveLevels: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Níveis cognitivos avaliados baseados na Taxonomia de Bloom (ex: 'Lembrar', 'Compreender', 'Aplicar', 'Analisar')"
                },
                difficultyScore: { type: Type.NUMBER, description: "Pontuação geral de dificuldade de 1 a 10" },
                skillsEvaluated: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Habilidades/Competências específicas avaliadas de acordo com as normas pedagógicas (BNCC)"
                },
                estimatedSuccessRate: { type: Type.NUMBER, description: "Taxa de acerto estimada média dos alunos (%)" }
              },
              required: ["cognitiveLevels", "difficultyScore", "skillsEvaluated", "estimatedSuccessRate"]
            }
          },
          required: ["title", "subject", "grade", "difficulty", "format", "estimatedTime", "questions", "statistics"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("O modelo retornou uma resposta vazia.");
    }

    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Erro ao gerar prova:", error);
    res.status(500).json({ error: error.message || "Erro desconhecido ao gerar a avaliação." });
  }
});

// Endpoint para gerar prova adaptada ou de recuperação
app.post("/api/adapt-exam", async (req, res) => {
  try {
    const { originalExam, studentPerformance, type } = req.body;

    if (!originalExam || !studentPerformance || !type) {
      return res.status(400).json({ error: "Faltam parâmetros obrigatórios para a adaptação." });
    }

    const prompt = `Você deve reestruturar e adaptar uma prova existente com base no desempenho e necessidades de um aluno.
Informações da adaptação:
- Tipo de adaptação: ${type === 'adaptation' ? 'Prova Adaptada (Inclusão/Dificuldade de Aprendizado)' : 'Prova de Recuperação (Reforço Escolar)'}
- Diagnóstico de Desempenho do Estudante: "${studentPerformance}"

Prova Original a ser adaptada:
${JSON.stringify(originalExam, null, 2)}

A nova prova adaptada deve:
1. Manter os temas principais, mas ajustar a linguagem, formato ou nível de complexidade para se adequar ao perfil do aluno descrito.
2. No caso de Recuperação, focar em reforçar os conceitos que o aluno demonstrou dificuldade no diagnóstico, adicionando dicas de raciocínio.
3. No caso de Prova Adaptada (ex: TDAH, Dislexia, TEA ou dificuldades específicas), usar enunciados mais diretos, subdivididos, com menos poluição visual e estruturas de apoio cognitivo.
4. Manter o mesmo número de questões, mas com conteúdo reformulado conforme o diagnóstico pedagógico.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é um psicopedagogo e especialista em educação especial, inclusiva e reforço escolar. Gere sempre respostas estruturadas de acordo com o esquema JSON fornecido, em português do Brasil.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Título contextualizado (ex: 'Avaliação Adaptada de Matemática' ou 'Prova de Recuperação de História')" },
            subject: { type: Type.STRING },
            grade: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            format: { type: Type.STRING },
            estimatedTime: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING, description: "Enunciado adaptado, limpo, direto e pedagogicamente facilitado para o perfil do estudante" },
                  type: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Alternativas simplificadas ou estruturadas se aplicável. Mantenha o mesmo número de opções (ex: 4 alternativas para A a D, 5 para A a E) da prova original se for múltipla escolha. Deixe vazio para dissertativas."
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING, description: "Explicação pedagógica focada no reforço do conteúdo." }
                },
                required: ["id", "text", "type", "correctAnswer", "explanation"]
              }
            },
            statistics: {
              type: Type.OBJECT,
              properties: {
                cognitiveLevels: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                difficultyScore: { type: Type.NUMBER },
                skillsEvaluated: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                estimatedSuccessRate: { type: Type.NUMBER }
              },
              required: ["cognitiveLevels", "difficultyScore", "skillsEvaluated", "estimatedSuccessRate"]
            }
          },
          required: ["title", "subject", "grade", "difficulty", "format", "estimatedTime", "questions", "statistics"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("O modelo retornou uma resposta vazia.");
    }

    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Erro ao adaptar prova:", error);
    res.status(500).json({ error: error.message || "Erro desconhecido ao adaptar a avaliação." });
  }
});

// Setup do Vite ou arquivos estáticos
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
