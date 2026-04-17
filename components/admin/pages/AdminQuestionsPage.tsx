import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../services/supabase.ts';
import type { Database } from '../../../database/types.ts';

type QuizRow = Database['public']['Tables']['quizzes']['Row'];
type QuestionRow = Database['public']['Tables']['questions']['Row'];

const AdminQuestionsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [quizId, setQuizId] = useState<string>('');
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [search, setSearch] = useState('');

  // form
  const [itemNo, setItemNo] = useState('');
  const [questionType, setQuestionType] = useState<QuestionRow['question_type']>('Multiple Choice');
  const [difficulty, setDifficulty] = useState<QuestionRow['difficulty']>('Easy');
  const [questionText, setQuestionText] = useState('');
  const [optionsRaw, setOptionsRaw] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');

  const loadQuizzes = useMemo(() => {
    return async () => {
      setError(null);
      const { data, error } = await supabase
        .from('quizzes')
        .select('id,title,is_published,created_at,updated_at,description,created_by')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      setQuizzes(data ?? []);
      if (!quizId && (data?.[0]?.id)) {
        setQuizId(data[0].id);
      }
    };
  }, [quizId]);

  const loadQuestions = useMemo(() => {
    return async (qid: string) => {
      if (!qid) {
        setQuestions([]);
        return;
      }
      const { data, error } = await supabase
        .from('questions')
        .select('id,quiz_id,item_no,question_type,difficulty,question_text,options,correct_answer,explanation,created_at,updated_at')
        .eq('quiz_id', qid)
        .order('item_no', { ascending: true })
        .limit(1000);
      if (error) throw error;
      setQuestions(data ?? []);
    };
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        await loadQuizzes();
      } catch (e: any) {
        setError(e?.message || 'Failed to load quizzes.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [loadQuizzes]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        await loadQuestions(quizId);
      } catch (e: any) {
        setError(e?.message || 'Failed to load questions.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [quizId, loadQuestions]);

  const filtered = questions.filter((x) => {
    const needle = search.trim().toLowerCase();
    if (!needle) return true;
    return (
      (x.item_no || '').toLowerCase().includes(needle) ||
      (x.question_text || '').toLowerCase().includes(needle) ||
      (x.correct_answer || '').toLowerCase().includes(needle)
    );
  });

  const parseOptions = (): string[] => {
    if (questionType === 'Multiple Choice') {
      return optionsRaw.split('\n').map((s) => s.trim()).filter(Boolean);
    }
    if (questionType === 'True or False') {
      return ['True', 'False'];
    }
    return [];
  };

  const create = async () => {
    setError(null);
    if (!quizId) return setError('Select a quiz first.');
    const inItem = itemNo.trim();
    const inText = questionText.trim();
    const inCorrect = correctAnswer.trim();

    if (!inItem) return setError('Item number is required.');
    if (!inText) return setError('Question text is required.');
    if (!inCorrect) return setError('Correct answer is required.');

    const options = parseOptions();

    if (questionType === 'Multiple Choice' && options.length !== 4) {
      return setError('Multiple Choice requires exactly 4 options (one per line).');
    }
    if (questionType === 'True or False' && !['true', 'false'].includes(inCorrect.toLowerCase())) {
      return setError('True/False correct answer must be "True" or "False".');
    }

    const { data, error } = await supabase
      .from('questions')
      .insert({
        quiz_id: quizId,
        item_no: inItem,
        question_type: questionType,
        difficulty,
        question_text: inText,
        options,
        correct_answer: inCorrect,
      })
      .select('id,quiz_id,item_no,question_type,difficulty,question_text,options,correct_answer,explanation,created_at,updated_at')
      .single();

    if (error) return setError(error.message);
    setQuestions((prev) => [...prev, data].sort((a, b) => a.item_no.localeCompare(b.item_no)));
    setItemNo('');
    setQuestionText('');
    setOptionsRaw('');
    setCorrectAnswer('');
  };

  const remove = async (row: QuestionRow) => {
    const ok = confirm(`Delete question item "${row.item_no}"?`);
    if (!ok) return;
    setError(null);
    const { error } = await supabase.from('questions').delete().eq('id', row.id);
    if (error) return setError(error.message);
    setQuestions((prev) => prev.filter((x) => x.id !== row.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="text-sm text-slate-400">Question Bank</div>
          <div className="text-2xl font-black">Questions</div>
          <div className="text-sm text-slate-300 mt-1">
            Scoring: Easy <span className="font-bold">+20</span>, Medium <span className="font-bold">+50</span>, Hard <span className="font-bold">+80</span>
          </div>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-red-900/60 bg-red-950/40 p-4 text-red-200">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <select
                value={quizId}
                onChange={(e) => setQuizId(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-sm outline-none focus:border-indigo-500"
              >
                {quizzes.map((qz) => (
                  <option key={qz.id} value={qz.id}>
                    {qz.title} {qz.is_published ? '(Published)' : '(Draft)'}
                  </option>
                ))}
              </select>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search item/text/answer…"
                className="w-full sm:w-80 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div className="text-sm text-slate-400">
              {loading ? 'Loading…' : `${filtered.length} shown`}
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="text-left font-semibold py-2">Item</th>
                  <th className="text-left font-semibold py-2">Type</th>
                  <th className="text-left font-semibold py-2">Difficulty</th>
                  <th className="text-left font-semibold py-2">Question</th>
                  <th className="text-right font-semibold py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-slate-300">No questions found.</td></tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="border-t border-slate-800 align-top">
                      <td className="py-3 font-bold text-indigo-200">{row.item_no}</td>
                      <td className="py-3 text-slate-200">{row.question_type}</td>
                      <td className="py-3">
                        <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-bold border ${
                          row.difficulty === 'Easy'
                            ? 'bg-emerald-500/10 text-emerald-200 border-emerald-600/30'
                            : row.difficulty === 'Medium'
                              ? 'bg-amber-500/10 text-amber-200 border-amber-600/30'
                              : 'bg-rose-500/10 text-rose-200 border-rose-600/30'
                        }`}>
                          {row.difficulty}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="font-semibold text-slate-100 line-clamp-2">{row.question_text}</div>
                        <div className="text-xs text-slate-400 mt-1">Answer: <span className="text-slate-200">{row.correct_answer}</span></div>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => remove(row)}
                          className="rounded-lg border border-red-900/60 bg-red-950/20 hover:bg-red-950/40 px-3 py-2 text-xs font-semibold text-red-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl">
          <div className="text-lg font-bold">Add question</div>
          <div className="mt-4 space-y-3">
            <input
              value={itemNo}
              onChange={(e) => setItemNo(e.target.value)}
              placeholder="Item number (e.g., 1, 1.1, Q-001)"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as QuestionRow['question_type'])}
                className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              >
                <option value="Multiple Choice">Multiple Choice</option>
                <option value="Identification">Identification</option>
                <option value="True or False">True or False</option>
              </select>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as QuestionRow['difficulty'])}
                className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Question text"
              rows={4}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
            {questionType === 'Multiple Choice' && (
              <textarea
                value={optionsRaw}
                onChange={(e) => setOptionsRaw(e.target.value)}
                placeholder={'Options (exactly 4 lines)\nOption A\nOption B\nOption C\nOption D'}
                rows={5}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            )}
            <input
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder={questionType === 'True or False' ? 'Correct answer (True/False)' : 'Correct answer'}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
            <button
              onClick={create}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-3 font-semibold transition-colors"
            >
              Add
            </button>
            <div className="text-xs text-slate-400">
              Custom item numbers are enforced unique per quiz (quiz_id + item_no).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuestionsPage;


