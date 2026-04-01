import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ProgressIndicatorProps {
  completionPercent: number;
  completedSections: number;
  totalSections: number;
  errors: string[];
  warnings: string[];
}

export function ProgressIndicator({
  completionPercent,
  completedSections,
  totalSections,
  errors,
  warnings,
}: ProgressIndicatorProps) {
  const isValid = errors.length === 0;

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Progress Bar */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900">
                Progress
              </span>
              <span className="text-sm text-gray-600">
                {completedSections} of {totalSections} sections
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isValid ? "bg-green-500" : "bg-yellow-500"
                }`}
                style={{ width: `${Math.min(completionPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-4">
            {errors.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.length} issue{errors.length !== 1 ? "s" : ""}</span>
              </div>
            )}

            {warnings.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span>{warnings.length} warning{warnings.length !== 1 ? "s" : ""}</span>
              </div>
            )}

            {isValid && completionPercent === 100 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ready to publish</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
