'use client'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'success' | 'warning'
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning',
}: ConfirmModalProps) {
  if (!isOpen) return null

  const variantStyles = {
    danger: {
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-200',
      svgPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    },
    success: {
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700 focus:ring-green-200',
      svgPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    warning: {
      iconBg: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-200',
      svgPath: 'M13 10V3L4 14h7v7l9-11h-7z'
    },
  }

  const style = variantStyles[variant]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 transition-opacity" onClick={onCancel}></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scale-in">
          {/* Icon */}
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${style.iconBg} mb-4`}>
            <svg className={`w-6 h-6 ${style.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={style.svgPath} />
            </svg>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 whitespace-pre-line">{message}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 active:scale-95 transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 text-white font-medium rounded-md active:scale-95 transition-all focus:ring-2 ${style.button}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
