'use client';

import React, { useState, useEffect } from 'react';
import { Cadence, WorkflowState } from '@apps/shared';

const API_BASE = 'http://localhost:3001';

const INITIAL_CADENCE = {
  id: "cad_123",
  name: "Welcome Flow",
  steps: [
    { id: "1", type: "SEND_EMAIL", subject: "Welcome", body: "Hello there" },
    { id: "2", type: "WAIT", seconds: 10 },
    { id: "3", type: "SEND_EMAIL", subject: "Follow up", body: "Checking in" }
  ]
};

export default function Home() {
  const [cadenceJson, setCadenceJson] = useState(JSON.stringify(INITIAL_CADENCE, null, 2));
  const [email, setEmail] = useState('user@example.com');
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [state, setState] = useState<WorkflowState | null>(null);
  const [msg, setMsg] = useState('');

  const saveCadence = async () => {
    try {
      await fetch(`${API_BASE}/cadences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: cadenceJson,
      });
      setMsg('Cadence saved');
    } catch { setMsg('Save failed'); }
  };

  const enroll = async () => {
    try {
      const { id } = JSON.parse(cadenceJson);
      const res = await fetch(`${API_BASE}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cadenceId: id, contactEmail: email }),
      });
      const data = await res.json();
      setEnrollmentId(data.enrollmentId);
      setMsg(`Enrolled: ${data.enrollmentId}`);
    } catch { setMsg('Enrollment failed'); }
  };

  const updateWorkflow = async () => {
    if (!enrollmentId) return;
    try {
      const { steps } = JSON.parse(cadenceJson);
      await fetch(`${API_BASE}/enrollments/${enrollmentId}/update-cadence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps }),
      });
      setMsg('Workflow updated');
    } catch { setMsg('Update failed'); }
  };

  useEffect(() => {
    if (!enrollmentId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/enrollments/${enrollmentId}`);
        setState(await res.json());
      } catch { setMsg('Status check failed'); }
    }, 2000);
    return () => clearInterval(interval);
  }, [enrollmentId]);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Email Cadence Manager
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Design and enroll contacts into automated email workflows with Temporal.io
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Cadence Definition */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800">Cadence Definition (JSON)</h2>
              </div>
              <div className="p-6">
                <textarea
                  className="w-full h-80 p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-900 text-green-400 mb-4"
                  value={cadenceJson}
                  onChange={(e) => setCadenceJson(e.target.value)}
                />
                <button 
                  onClick={saveCadence} 
                  className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Save Cadence Definition
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Enrollment & Status */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800">New Enrollment</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input
                      id="email"
                      type="email"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                    />
                  </div>
                  <button 
                    onClick={enroll} 
                    className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    Start Workflow
                  </button>
                </div>
              </div>
            </div>

            {enrollmentId && (
              <div className="bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="px-6 py-4 border-b border-blue-100 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-blue-900">Live Status</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      state?.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {state?.status || 'INITIALIZING'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="text-sm text-gray-500 break-all">
                      <span className="font-semibold text-gray-700">ID:</span> {enrollmentId}
                    </div>
                    
                    {state && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                          <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Step Index</div>
                          <div className="text-2xl font-black text-blue-600">{state.currentStepIndex ?? '0'}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                          <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Version</div>
                          <div className="text-2xl font-black text-orange-600">{state.stepsVersion ?? '1'}</div>
                        </div>
                      </div>
                    )}
                    
                    {state && (
                      <div className="mt-4">
                        <div className="text-xs font-bold text-gray-400 uppercase mb-2">Raw State</div>
                        <pre className="text-[10px] bg-gray-50 p-3 rounded-lg border border-gray-200 overflow-auto max-h-48 text-gray-600">
                          {JSON.stringify(state, null, 2)}
                        </pre>
                      </div>
                    )}

                    <button 
                      onClick={updateWorkflow} 
                      className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                    >
                      Push Updates to In-Flight
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {msg && (
          <div className={`mt-8 p-4 rounded-lg border flex items-center shadow-sm transition-all duration-300 ${
            msg.toLowerCase().includes('fail') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-700'
          }`}>
            <div className="flex-shrink-0 mr-3">
              {msg.toLowerCase().includes('fail') ? (
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-sm font-medium">{msg}</p>
          </div>
        )}
      </div>
    </main>
  );
}
