import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "../ImageUploadField";
import { suggestAltText } from "@/lib/blog-validation";
import type { BlogPost, StepItem } from "@/types/blog";

interface HowItWorksSectionProps {
  post: BlogPost;
  onUpdateSection: (sectionName: keyof BlogPost["sections"], updates: any) => void;
}

export function HowItWorksSection({ post, onUpdateSection }: HowItWorksSectionProps) {
  const title = post.primaryKeyword
    ? `How ${post.primaryKeyword} Works: Step-by-Step Process`
    : "How [Keyword] Works: Step-by-Step Process";

  const handleUpdateStep = (index: number, item: StepItem) => {
    const steps = [...post.sections.howItWorks.steps];
    steps[index] = item;
    onUpdateSection("howItWorks", { steps });
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Section Title (Auto-Generated):</strong>
          <br />
          <code className="bg-blue-100 px-2 py-1 rounded text-xs">{title}</code>
        </p>
      </div>

      <div>
        <Label className="text-base font-semibold mb-2 block">
          Process Steps <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-600 mb-4">
          Define the steps in your process. Numbering is automatic and cannot be
          changed.
        </p>

        <div className="space-y-6">
          {post.sections.howItWorks.steps.map((step, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  Step Title
                </span>
              </div>

              <div>
                <Input
                  type="text"
                  placeholder="Step title..."
                  value={step.title}
                  onChange={(e) =>
                    handleUpdateStep(index, { ...step, title: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Description (2-3 sentences)
                </Label>
                <Textarea
                  placeholder="Describe this step..."
                  value={step.description}
                  onChange={(e) =>
                    handleUpdateStep(index, {
                      ...step,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <ImageUploadField
          label="Process Diagram (Optional)"
          value={post.sections.howItWorks.diagramImage}
          onChange={(imageData) =>
            onUpdateSection("howItWorks", {
              diagramImage: {
                ...imageData,
                alt:
                  imageData.alt ||
                  suggestAltText("howItWorks", post.primaryKeyword),
              },
            })
          }
          suggestedAltText={suggestAltText("howItWorks", post.primaryKeyword)}
          helpText="Add an optional diagram or flowchart that illustrates the process."
        />
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
        <p className="text-sm text-blue-900">
          <strong>💡 Tips:</strong>
        </p>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          <li>• Keep steps in logical order</li>
          <li>• Make each step clear and actionable</li>
          <li>• Use consistent language and tone</li>
          <li>• A process diagram can make this section easier to understand</li>
        </ul>
      </div>
    </div>
  );
}
