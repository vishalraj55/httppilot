'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { Environment } from '@/types';

interface Props {
  activeEnvironmentId: string | null;
  onEnvironmentChange: (id: string | null) => void;
}

export default function EnvironmentSelector({ activeEnvironmentId, onEnvironmentChange }: Props) {
  const { getToken } = useAuth();
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEnv, setEditingEnv] = useState<Environment | null>(null);
  const [newName, setNewName] = useState('');
  const [variables, setVariables] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);
  const [creating, setCreating] = useState(false);

  const loadEnvironments = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    const data = await apiFetch('/environments', token) as Environment[];
    setEnvironments(data);
  }, [getToken]);

  useEffect(() => {
    void loadEnvironments();
  }, [loadEnvironments]);

  const openCreate = () => {
    setEditingEnv(null);
    setNewName('');
    setVariables([{ key: '', value: '' }]);
    setCreating(true);
    setModalOpen(true);
  };

  const openEdit = (env: Environment) => {
    setEditingEnv(env);
    setNewName(env.name);
    const vars = Object.entries(env.variables).map(([key, value]) => ({ key, value }));
    setVariables([...vars, { key: '', value: '' }]);
    setCreating(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingEnv(null);
    setNewName('');
    setVariables([{ key: '', value: '' }]);
  };

  const updateVariable = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...variables];
    updated[index][field] = value;
    if (index === variables.length - 1 && value) {
      updated.push({ key: '', value: '' });
    }
    setVariables(updated);
  };

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const saveEnvironment = async () => {
    if (!newName.trim()) return;
    const token = await getToken();
    if (!token) return;

    const variablesObj: Record<string, string> = {};
    variables.forEach(({ key, value }) => {
      if (key.trim()) variablesObj[key.trim()] = value.trim();
    });

    if (creating) {
      await apiFetch('/environments', token, {
        method: 'POST',
        body: JSON.stringify({ name: newName, variables: variablesObj }),
      });
    } else if (editingEnv) {
      await apiFetch(`/environments/${editingEnv.id}`, token, {
        method: 'PUT',
        body: JSON.stringify({ name: newName, variables: variablesObj }),
      });
    }

    await loadEnvironments();
    closeModal();
  };

  const deleteEnvironment = async (id: string) => {
    const token = await getToken();
    if (!token) return;
    await apiFetch(`/environments/${id}`, token, { method: 'DELETE' });
    if (activeEnvironmentId === id) onEnvironmentChange(null);
    await loadEnvironments();
  };

  const activeEnv = environments.find((e) => e.id === activeEnvironmentId);

  return (
    <>
      {/* Selector Button */}
      <div className="flex items-center gap-1">
        <select
          value={activeEnvironmentId ?? ''}
          onChange={(e) => onEnvironmentChange(e.target.value || null)}
          className="bg-gray-800 border border-gray-700 text-white text-xs rounded-l px-2 py-1.5 focus:outline-none focus:border-blue-500 max-w-35"
        >
          <option value="">No Environment</option>
          {environments.map((env) => (
            <option key={env.id} value={env.id}>{env.name}</option>
          ))}
        </select>
        <button
          onClick={() => activeEnv ? openEdit(activeEnv) : openCreate()}
          title="Manage environments"
          className="bg-gray-800 border border-l-0 border-gray-700 text-gray-400 hover:text-white px-2 py-1.5 text-xs rounded-r transition"
        >
          ⚙
        </button>
        <button
          onClick={openCreate}
          title="New environment"
          className="bg-gray-800 border border-gray-700 text-gray-400 hover:text-white px-2 py-1.5 text-xs rounded transition ml-1"
        >
          +
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Panel */}
          <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[80vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div>
                <h2 className="text-white font-semibold text-sm">
                  {creating ? 'New Environment' : `Edit: ${editingEnv?.name}`}
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  Use variables as <code className="text-blue-400">{'{{variable_name}}'}</code> in your requests
                </p>
              </div>
              <button onClick={closeModal} className="text-gray-500 hover:text-white transition text-lg">✕</button>
            </div>

            {/* Environment list (when not creating) */}
            {!creating && (
              <div className="px-6 py-3 border-b border-gray-800 flex gap-2 flex-wrap">
                {environments.map((env) => (
                  <div
                    key={env.id}
                    onClick={() => openEdit(env)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs cursor-pointer border transition ${
                      editingEnv?.id === env.id
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <span>{env.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); void deleteEnvironment(env.id); }}
                      className="text-gray-400 hover:text-red-400 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={openCreate}
                  className="px-3 py-1 rounded-full text-xs border border-dashed border-gray-600 text-gray-500 hover:text-white hover:border-gray-400 transition"
                >
                  + New
                </button>
              </div>
            )}

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Name */}
              <div className="mb-4">
                <label className="text-gray-400 text-xs mb-1 block">Environment Name</label>
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Production, Development, Staging"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Variables */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-400 text-xs">Variables</label>
                  <span className="text-gray-600 text-xs">{variables.filter(v => v.key).length} variables</span>
                </div>

                {/* Table header */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <span className="text-gray-600 text-xs px-2">Key</span>
                  <span className="text-gray-600 text-xs px-2">Value</span>
                </div>

                {/* Variable rows */}
                <div className="space-y-2">
                  {variables.map((v, i) => (
                    <div key={i} className="grid grid-cols-2 gap-2 group">
                      <input
                        value={v.key}
                        onChange={(e) => updateVariable(i, 'key', e.target.value)}
                        placeholder="variable_name"
                        className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
                      />
                      <div className="flex gap-2">
                        <input
                          value={v.value}
                          onChange={(e) => updateVariable(i, 'value', e.target.value)}
                          placeholder="value"
                          className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                        />
                        {v.key && (
                          <button
                            onClick={() => removeVariable(i)}
                            className="text-gray-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100 text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={() => void saveEnvironment()}
                disabled={!newName.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                {creating ? 'Create Environment' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}