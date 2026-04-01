import { useState, useEffect, useRef } from "react";
import type { BlogPost, ValidationState } from "@/types/blog";
import { validateBlogPost, generateSlug } from "@/lib/blog-validation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { KeywordSetupSection } from "./sections/KeywordSetupSection";
import { H1TitleSection } from "./sections/H1TitleSection";
import { FeaturedImageSection } from "./sections/FeaturedImageSection";
import { IntroductionSection } from "./sections/IntroductionSection";
import { ConclusionSection } from "./sections/ConclusionSection";
import { RichTextEditor } from "./RichTextEditor";

interface BlogEditorFormTabsProps {
  post: BlogPost;
  validation: ValidationState;
  onUpdatePost: (updates: Partial<BlogPost>) => void;
  onUpdateSection: (sectionName: keyof BlogPost["sections"], updates: any) => void;
  onValidationChange: (validation: ValidationState) => void;
}

const STEPS = [
  { id: "keyword-title", label: "Keyword & Title", number: 1 },
  { id: "featured-image", label: "Featured Image", number: 2 },
  { id: "introduction", label: "Introduction", number: 3 },
  { id: "main-content", label: "Main Content", number: 4 },
  { id: "conclusion", label: "Conclusion", number: 5 },
];

export function BlogEditorFormTabs({
  post,
  validation,
  onUpdatePost,
  onUpdateSection,
  onValidationChange,
}: BlogEditorFormTabsProps) {
  const [activeTab, setActiveTab] = useState("keyword-title");
  const prevPostRef = useRef<BlogPost | null>(null);

  // Validate and update derived fields
  useEffect(() => {
    const newValidation = validateBlogPost(post);
    onValidationChange(newValidation);

    // Update slug if h1Title changed
    if (post.h1Title && prevPostRef.current?.h1Title !== post.h1Title) {
      const newSlug = generateSlug(post.h1Title);
      if (newSlug !== post.slug) {
        onUpdatePost({ slug: newSlug });
      }
    }

    // Update meta description if intro changed and metaDescription is empty
    if (
      post.introduction &&
      !post.metaDescription &&
      prevPostRef.current?.introduction !== post.introduction
    ) {
      const introText = post.introduction
        .replace(/<[^>]*>/g, "")
        .substring(0, 150);
      onUpdatePost({ metaDescription: introText });
    }

    prevPostRef.current = post;
  }, [post]);

  const isSectionComplete = (sectionName: string) => {
    return validation.completedSections.includes(sectionName);
  };

  const currentStepIndex = STEPS.findIndex((step) => step.id === activeTab);
  const canGoPrev = currentStepIndex > 0;
  const canGoNext = currentStepIndex < STEPS.length - 1;

  const handlePrev = () => {
    if (canGoPrev) {
      setActiveTab(STEPS[currentStepIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setActiveTab(STEPS[currentStepIndex + 1].id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto p-3 gap-3 bg-gray-50 rounded-lg border border-gray-200">
          {STEPS.map((step) => {
            const sectionName = step.label.split(" ")[0] === "Keyword" ? "Keyword Setup" :
                      step.label.split(" ")[0] === "Featured" ? "Featured Image" :
                      step.label.split(" ")[0] === "Introduction" ? "Introduction" :
                      step.label.split(" ")[0] === "Main" ? "What Is Section" : "Conclusion";
            const isComplete = isSectionComplete(sectionName);

            return (
            <TabsTrigger
              key={step.id}
              value={step.id}
              className={`relative rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all flex flex-col items-center gap-2 ${
                activeTab === step.id
                  ? "border-blue-500 bg-white text-blue-700 shadow-sm"
                  : isComplete
                  ? "border-green-500 bg-white text-green-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                activeTab === step.id
                  ? "bg-blue-100 text-blue-700"
                  : isComplete
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </span>
              <span className="text-xs leading-tight">{step.label}</span>
            </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Content Sections */}
        <div className="mt-8">
          {/* Step 1: Keyword & Title */}
          <TabsContent value="keyword-title" className="space-y-6">
            <div className="space-y-8 pb-6">
              <div>
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                    1
                  </span>
                  Primary Keyword & Blog Title
                </h3>
                <div className="space-y-8">
                  <KeywordSetupSection
                    post={post}
                    onUpdatePost={onUpdatePost}
                  />
                  <div className="border-t pt-8">
                    <H1TitleSection
                      post={post}
                      onUpdatePost={onUpdatePost}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Step 2: Featured Image */}
          <TabsContent value="featured-image" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                  2
                </span>
                Featured Image
              </h3>
              <FeaturedImageSection
                post={post}
                onUpdatePost={onUpdatePost}
              />
            </div>
          </TabsContent>

          {/* Step 3: Introduction */}
          <TabsContent value="introduction" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                  3
                </span>
                Introduction
              </h3>
              <IntroductionSection
                post={post}
                onUpdatePost={onUpdatePost}
              />
            </div>
          </TabsContent>

          {/* Step 4: Main Content */}
          <TabsContent value="main-content" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                  4
                </span>
                Main Content
              </h3>
              <div className="space-y-6">
                <RichTextEditor
                  label="Article Content"
                  value={post.sections.whatIs.content}
                  onChange={(value) => onUpdateSection("whatIs", { content: value })}
                  required={true}
                  helpText="Paste or write your main article content here. Include all the key information about your topic."
                  placeholder="Paste your article content here..."
                  rows={10}
                  showWordCount={true}
                />

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                  <p className="text-sm text-blue-900">
                    <strong>💡 Tips:</strong>
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1 ml-4">
                    <li>• Use clear headings (H2, H3) to organize your content</li>
                    <li>• Break content into short, digestible paragraphs</li>
                    <li>• Include your primary keyword naturally throughout</li>
                    <li>• Add relevant examples and practical insights</li>
                    <li>• You can format text with bold, italic, and links</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Step 5: Conclusion */}
          <TabsContent value="conclusion" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                  5
                </span>
                Conclusion
              </h3>
              <ConclusionSection
                post={post}
                onUpdateSection={onUpdateSection}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-6 border-t">
        <Button
          onClick={handlePrev}
          disabled={!canGoPrev}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canGoNext}
          variant="outline"
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
