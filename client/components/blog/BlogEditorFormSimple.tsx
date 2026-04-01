import { useState, useEffect, useRef } from "react";
import type { BlogPost, ValidationState } from "@/types/blog";
import { validateBlogPost, generateSlug } from "@/lib/blog-validation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { KeywordSetupSection } from "./sections/KeywordSetupSection";
import { H1TitleSection } from "./sections/H1TitleSection";
import { FeaturedImageSection } from "./sections/FeaturedImageSection";
import { IntroductionSection } from "./sections/IntroductionSection";
import { ConclusionSection } from "./sections/ConclusionSection";
import { RichTextEditor } from "./RichTextEditor";
import { CheckCircle2 } from "lucide-react";

interface BlogEditorFormSimpleProps {
  post: BlogPost;
  validation: ValidationState;
  onUpdatePost: (updates: Partial<BlogPost>) => void;
  onUpdateSection: (sectionName: keyof BlogPost["sections"], updates: any) => void;
  onValidationChange: (validation: ValidationState) => void;
}

export function BlogEditorFormSimple({
  post,
  validation,
  onUpdatePost,
  onUpdateSection,
  onValidationChange,
}: BlogEditorFormSimpleProps) {
  const [activeSection, setActiveSection] = useState<string>("keyword-title");
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

  const getSectionStatus = (sectionName: string) => {
    if (isSectionComplete(sectionName)) {
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible value={activeSection} onValueChange={setActiveSection}>
        {/* Step 1: Keyword & Title */}
        <AccordionItem value="keyword-title">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                1
              </span>
              <span className="text-left">
                Keyword & Blog Title
                {getSectionStatus("Keyword Setup")}
                {getSectionStatus("Blog Title")}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <div className="space-y-8 pb-6">
              <KeywordSetupSection
                post={post}
                onUpdatePost={onUpdatePost}
              />
              <div className="border-t pt-6">
                <H1TitleSection
                  post={post}
                  onUpdatePost={onUpdatePost}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Step 2: Featured Image */}
        <AccordionItem value="featured-image">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                2
              </span>
              <span className="text-left">
                Featured Image
                {getSectionStatus("Featured Image")}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <FeaturedImageSection
              post={post}
              onUpdatePost={onUpdatePost}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Step 3: Introduction */}
        <AccordionItem value="introduction">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                3
              </span>
              <span className="text-left">
                Introduction
                {getSectionStatus("Introduction")}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <IntroductionSection
              post={post}
              onUpdatePost={onUpdatePost}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Step 4: Main Content */}
        <AccordionItem value="main-content">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                4
              </span>
              <span className="text-left">
                Main Content
                {getSectionStatus("What Is Section")}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <div className="space-y-6 pb-6">
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
          </AccordionContent>
        </AccordionItem>

        {/* Step 5: Conclusion */}
        <AccordionItem value="conclusion">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                5
              </span>
              <span className="text-left">
                Conclusion
                {getSectionStatus("Conclusion")}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <ConclusionSection
              post={post}
              onUpdateSection={onUpdateSection}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
