import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { QuestionnaireQuestion, QuestionType } from '../../types';
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  ListOrdered,
  Layers,
  FileQuestion,
  X,
  Save,
} from 'lucide-react';

const CATEGORIES = [
  'Building & Construction Details',
  'Occupancy & Sleeping Risks',
  'Fire Alarm & Detection Systems',
  'Emergency Lighting & Escape Routes',
  'Fire Extinguishing Appliances',
  'Management & Maintenance Procedures',
  'Hazardous Substances & High Risk Areas',
];

export const QuestionnaireSettings: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionnaireQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [editingQuestion, setEditingQuestion] = useState<Partial<QuestionnaireQuestion> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [optionsInput, setOptionsInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const list = await api.getQuestions(false);
      setQuestions(list.sort((a, b) => a.orderIndex - b.orderIndex));
    } catch (err: any) {
      setError(err.message || 'Failed to load questionnaire questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingQuestion({
      category: CATEGORIES[0],
      questionText: '',
      questionType: 'yes_no',
      options: [],
      isMandatory: true,
      guidance: '',
      helpText: '',
      orderIndex: questions.length + 1,
    });
    setOptionsInput('');
    setIsModalOpen(true);
    setError(null);
  };

  const handleOpenEdit = (q: QuestionnaireQuestion) => {
    setEditingQuestion({ ...q });
    setOptionsInput(q.options ? q.options.join(', ') : '');
    setIsModalOpen(true);
    setError(null);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !editingQuestion.questionText) return;

    try {
      const parsedOptions = optionsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...editingQuestion,
        options: parsedOptions.length > 0 ? parsedOptions : undefined,
      };

      if (editingQuestion.id) {
        await api.updateQuestion(editingQuestion.id, payload);
      } else {
        await api.createQuestion(payload);
      }

      setIsModalOpen(false);
      setEditingQuestion(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await loadQuestions();
    } catch (err: any) {
      setError(err.message || 'Failed to save question.');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this question from the pre-assessment questionnaire?')) {
      return;
    }
    try {
      await api.deleteQuestion(id);
      await loadQuestions();
    } catch (err: any) {
      setError(err.message || 'Failed to delete question.');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;

    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIndex];
    newQuestions[targetIndex] = temp;

    setQuestions(newQuestions);

    try {
      await api.reorderQuestions(newQuestions.map((q) => q.id));
    } catch (err: any) {
      console.error('Failed to update question order:', err);
      await loadQuestions();
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (selectedCategory === 'ALL') return true;
    return q.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900">Pre-Assessment Questionnaire Configurator</h2>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              Part 18 Standard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Configure questions delivered to dutyholders and responsible persons prior to site attendance.
            Responses populate the assessment workspace and pre-populate PAS 79 findings.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Questionnaire Item</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Questionnaire configuration updated and deployed to client portal.</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
            selectedCategory === 'ALL'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Categories ({questions.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = questions.filter((q) => q.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center space-x-1.5 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{cat}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading questionnaire configuration...</div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileQuestion className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-medium text-slate-600">No questions defined for this category.</p>
            <p className="text-[11px] text-slate-400">Click &quot;Add Questionnaire Item&quot; to define building questions.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 hover:bg-slate-50/60 transition flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex flex-col items-center justify-center space-y-1 pt-0.5">
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:hover:text-slate-400"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">{q.orderIndex}</span>
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === filteredQuestions.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:hover:text-slate-400"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {q.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                        {q.questionType.replace('_', ' ')}
                      </span>
                      {q.isMandatory ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Mandatory
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-50 text-slate-500 border border-slate-200">
                          Optional
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-semibold text-slate-900 leading-snug">
                      {q.questionText}
                    </div>

                    {q.guidance && (
                      <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="font-semibold text-slate-700">Assessor Guidance: </span>
                        {q.guidance}
                      </div>
                    )}

                    {q.options && q.options.length > 0 && (
                      <div className="flex items-center space-x-1 flex-wrap gap-1 text-[10px]">
                        <span className="text-slate-400">Options:</span>
                        {q.options.map((opt, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded">
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                    title="Edit question"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveQuestion}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingQuestion.id ? 'Edit Questionnaire Question' : 'Add Pre-Assessment Question'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Question Category *</label>
                <select
                  value={editingQuestion.category || CATEGORIES[0]}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, category: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Question Text *</label>
                <textarea
                  rows={2}
                  required
                  value={editingQuestion.questionText || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                  placeholder="e.g. Is an emergency lighting system installed and tested monthly in accordance with BS 5266?"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Response Type</label>
                  <select
                    value={editingQuestion.questionType || 'yes_no'}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        questionType: e.target.value as QuestionType,
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="yes_no">Yes / No</option>
                    <option value="text">Single-line Text</option>
                    <option value="long_text">Long Narrative</option>
                    <option value="single_select">Single Choice Select</option>
                    <option value="multiple_select">Multiple Choice Select</option>
                    <option value="number">Numeric Value</option>
                    <option value="date">Date</option>
                    <option value="file_upload">Document Upload</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mandatory</label>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="isMandatory"
                      checked={editingQuestion.isMandatory ?? true}
                      onChange={(e) =>
                        setEditingQuestion({ ...editingQuestion, isMandatory: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 rounded border-slate-300"
                    />
                    <label htmlFor="isMandatory" className="text-slate-700 font-medium">
                      Must be answered
                    </label>
                  </div>
                </div>
              </div>

              {['single_select', 'multiple_select'].includes(editingQuestion.questionType || '') && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Selectable Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={optionsInput}
                    onChange={(e) => setOptionsInput(e.target.value)}
                    placeholder="e.g. Conventional, Addressable, Wireless, None"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assessor Guidance & Legal Rationale</label>
                <textarea
                  rows={2}
                  value={editingQuestion.guidance || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, guidance: e.target.value })}
                  placeholder="e.g. References Regulatory Reform (Fire Safety) Order 2005 Article 14 and BS 5266 Part 1."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Question</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
