'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

const departments = [
  { id: 'hr', name: 'Human Resources', icon: '👥', color: 'var(--accent-subtle)' },
  { id: 'sales', name: 'Sales', icon: '💰', color: 'var(--success-light)' },
  { id: 'engineering', name: 'Engineering', icon: '⚙️', color: 'var(--blue-100)' },
  { id: 'support', name: 'Customer Support', icon: '🎧', color: 'var(--warning-light)' },
  { id: 'marketing', name: 'Marketing', icon: '📣', color: 'var(--error-light)' },
  { id: 'operations', name: 'Operations', icon: '📋', color: 'var(--sidebar-bg)' },
  { id: 'finance', name: 'Finance', icon: '📊', color: 'var(--accent-subtle)' },
  { id: 'other', name: 'Other', icon: '🤖', color: 'var(--success-light)' },
];

export default function CreateBot() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    description: '',
  });
  const [errors, setErrors] = useState<{ name?: string; department?: string }>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDepartmentSelect = (departmentId: string) => {
    setFormData((prev) => ({ ...prev, department: departmentId }));
    if (errors.department) {
      setErrors((prev) => ({ ...prev, department: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { name?: string; department?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Bot name is required';
    }
    if (!formData.department) {
      newErrors.department = 'Please select a department';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Store form data in sessionStorage for the next page
    sessionStorage.setItem('newBotData', JSON.stringify(formData));

    // Navigate to configuration page
    router.push('/configuration-bot');
  };

  const handleCancel = () => {
    router.push('/create-bot-dashboard');
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />

      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[var(--background)]/80 backdrop-blur-sm border-b border-[var(--card-border)]">
          <div className="px-8 py-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Create New Bot</h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Set up your knowledge bot in a few steps</p>
              </div>
            </div>
          </div>
        </header>

        {/* Form Content */}
        <div className="p-8 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Bot Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-[var(--text-primary)]">
                Bot Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., HR Assistant, Sales Helper"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.name
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : 'border-[var(--card-border)] focus:border-[var(--accent-primary)] focus:ring-[var(--accent-subtle)]'
                } bg-[var(--card-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-4 transition-all`}
              />
              {errors.name && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Department Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                Department <span className="text-red-400">*</span>
              </label>
              <p className="text-sm text-[var(--text-secondary)]">
                Select the department this bot will serve
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleDepartmentSelect(dept.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      formData.department === dept.id
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)]/60 shadow-md'
                        : 'border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--accent-primary)]/50 hover:bg-[var(--sidebar-hover)]'
                    }`}
                  >
                    <span className="text-2xl">{dept.icon}</span>
                    <span className={`text-xs font-medium text-center ${
                      formData.department === dept.id
                        ? 'text-[var(--accent-primary)]'
                        : 'text-[var(--text-secondary)]'
                    }`}>
                      {dept.name}
                    </span>
                  </button>
                ))}
              </div>
              {errors.department && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.department}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-[var(--text-primary)]">
                Description <span className="text-[var(--text-muted)]">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe what this bot will help with. E.g., 'Answers questions about company policies, benefits, and HR procedures.'"
                className="w-full px-4 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-subtle)] transition-all resize-none"
              />
              <p className="text-xs text-[var(--text-muted)]">
                This helps set context for your bot's responses
              </p>
            </div>

            {/* Preview Card */}
            {formData.name && (
              <div className="p-4 rounded-xl bg-[var(--sidebar-bg)] border border-[var(--card-border)]">
                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-3">Preview</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center text-xl">
                    {formData.department
                      ? departments.find((d) => d.id === formData.department)?.icon
                      : '🤖'}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{formData.name}</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {formData.department
                        ? departments.find((d) => d.id === formData.department)?.name
                        : 'Select a department'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--card-border)]">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl text-sm font-medium text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] transition-colors shadow-sm hover:shadow-md flex items-center gap-2"
              >
                Continue
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
