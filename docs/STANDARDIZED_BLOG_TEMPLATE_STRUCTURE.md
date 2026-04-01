# STANDARDIZED BLOG TEMPLATE STRUCTURE

This document is the **single source of truth** for the blog editor application. All validation, UI flow, and output must strictly adhere to this structure.

## Overview

A standardized, SEO-optimized blog post structure designed for non-technical content creators. This template enforces proper heading hierarchy, image placement, keyword usage, and schema-friendly markup.

---

## Section-by-Section Requirements

### Pre-Flight Setup (Not a section, but required)
- **Primary Keyword**: Required. Single keyword that drives the entire post. Once locked, cannot be changed.
- **Secondary Keywords**: Optional. Tag-based input for supporting keywords.
- **Keyword Lock**: Auto-locks once blog creation starts.

---

### Section 1: H1 – Main Blog Title
**Heading Level**: H1  
**Quantity**: Exactly 1 (hard-enforced, no more allowed)  
**Position**: After featured image, before intro  
**Requirements**:
- Must include primary keyword
- Recommended length: 50-60 characters
- Character guidance shown in UI (current vs. recommended)
- Validation: Warns if primary keyword is missing

---

### Section 2: Featured Image
**Position**: Immediately after title (before intro)  
**Quantity**: Exactly 1 (required)  
**File Requirements**:
- Format: JPG, PNG, WebP
- Aspect Ratio: Landscape (16:9 recommended)
- Max file size: 5MB
- Suggested naming: `[primary-keyword]-featured.jpg`

**Metadata**:
- Alt Text (required): Auto-suggested using primary keyword
- Default suggestion: "[Primary Keyword] - Complete Guide"

---

### Section 3: Introductory Paragraph
**Heading**: None (no H2/H3)  
**Position**: After featured image, before "What Is" section  
**Content Type**: Rich text (paragraph only)  
**Word Count**: 120–180 words
- Validation: Soft warning if below 120 or above 180
- Hard constraint: None (user can override with warning)

**Restrictions**:
- ❌ No images allowed here
- ❌ No headings allowed
- ❌ Plain paragraph text only

---

### Section 4: H2 – What Is / Context & Definition
**Heading Level**: H2  
**Fixed Title Template**: "What Is [Primary Keyword] and Why It Matters Today"
- Auto-populated based on primary keyword
- User cannot manually edit title, only content

**Content Structure**:
- 2–3 short paragraphs
- Rich text editor (bold, italic, links allowed)
- Word guidance: 200–300 words total

**Image Support**:
- Optional image slot (appears after content filled)
- Alt text auto-prefilled: "what is [primary keyword]"

**Restrictions**:
- ❌ No additional H2/H3 within this section

---

### Section 5: H2 – Benefits & Why It Matters
**Heading Level**: H2  
**Fixed Title Template**: "[Primary Keyword] Benefits: Key Advantages You Need to Know"

**Content Structure**:
- Repeatable benefit blocks (3–5 items)
- Each block contains:
  - **Benefit Title** (short, punchy)
  - **Description** (2–3 lines, ~50 words)
- Benefits auto-render as bullet points in preview

**Image Support**:
- Optional image slot at end of section
- Alt text auto-prefilled: "[primary keyword] benefits"

---

### Section 6: H2 – Types / Variations
**Heading Level**: H2  
**Fixed Title Template**: "[Primary Keyword] Types: A Comprehensive Breakdown"

**Content Structure**:
- 3 pre-created H3 blocks (expandable/collapsible)
- H3 Titles:
  - Pre-suggested based on common variations
  - User can customize
- Each H3 block:
  - Title field
  - Description editor (80–120 words)

**Image Support**:
- Comparison image slot at end of entire section
- Alt text auto-prefilled: "[primary keyword] types comparison"

---

### Section 7: H2 – How It Works / Process
**Heading Level**: H2  
**Fixed Title Template**: "How [Primary Keyword] Works: Step-by-Step Process"

**Content Structure**:
- Step-based repeater (Step 1, Step 2, Step 3, optionally Step 4)
- Step numbering auto-managed (cannot be manually edited)
- Each step:
  - Step title (short descriptor)
  - Description (2–3 sentences)

**Image Support**:
- Diagram/process image slot at end
- Alt text auto-prefilled: "[primary keyword] process diagram"

---

### Section 8: H2 – Use Cases / Real-World Applications
**Heading Level**: H2  
**Fixed Title Template**: "[Primary Keyword] Use Cases: Real-World Applications"

**Content Structure**:
- 3 pre-created H3 blocks:
  - "Residential / Personal Use"
  - "Commercial / Business Use"
  - "Specialized / Industry-Specific Use"
- Each H3:
  - Auto-titled (user can override)
  - Description editor (80–120 words)

**Image Support**:
- One optional image slot after entire section
- Alt text auto-prefilled: "[primary keyword] real-world use cases"

---

### Section 9: Brand / Service Promotion (Optional / Toggleable)
**Heading Level**: H3 or plain text block  
**Position**: Before FAQs  
**Can be toggled on/off**: Yes  

**Content Structure**:
- Brand name input (optional, with default)
- USP Bullets (3–5 key points)
- CTA field (call-to-action text)

**Rendering**:
- Renders as a highlighted/callout box in preview
- No image required

---

### Section 10: H2 – FAQs
**Heading Level**: H2  
**Fixed Title Template**: "Frequently Asked Questions About [Primary Keyword]"

**Content Structure**:
- FAQ repeater (4–6 items)
- Each FAQ item:
  - **Question** (automatically bold)
  - **Answer** (short, concise; <100 words)

**Restrictions**:
- ❌ No images allowed (hard-locked)
- ❌ No H3 headings within answers

**Schema Compatibility**:
- Output must support FAQ schema markup
- Questions and answers properly structured for SEO

---

### Section 11: H2 – Conclusion & Next Steps
**Heading Level**: H2  
**Fixed Title Template**: "Conclusion: [Primary Keyword] & Moving Forward"

**Content Structure**:
- Summary editor (2–3 paragraphs, 100–150 words)
- CTA reminder (optional)

**Restrictions**:
- ❌ No images

---

## Validation Rules & Guardrails

### Hard Constraints (Prevent Publishing)
1. **Exactly 1 H1** – No more, no fewer
2. **H1 must include primary keyword**
3. **Featured image required**
4. **Heading hierarchy**: Only H1 → H2 → H3 allowed (no H4–H6)
5. **All required fields filled**: Primary keyword, H1, Featured image, intro, all major sections

### Soft Constraints (Warn but Allow)
1. **Word counts**: If intro/section is outside recommended range, warn but allow override
2. **Keyword density**: If primary keyword is missing from H2s, warn
3. **Image placement**: Warn if recommended image slots are empty

### Auto-Enforcement
1. **Alt text**: Auto-suggest based on keyword and context
2. **File naming**: Suggest proper naming conventions
3. **Title templates**: Lock template titles; only let user edit content
4. **H3 pre-creation**: Auto-create 3 H3 blocks in Types/Use Cases sections

---

## Output Format

### Final HTML Structure
```html
<h1>[Primary Keyword] – [Unique Angle]</h1>
<img alt="[Alt Text]" src="[Featured Image]" />

<p>[Introductory Paragraph]</p>

<h2>What Is [Primary Keyword] and Why It Matters Today</h2>
<p>...</p>
<img alt="..." src="..." />

<h2>[Primary Keyword] Benefits: Key Advantages You Need to Know</h2>
<ul>
  <li>[Benefit 1]</li>
  <li>[Benefit 2]</li>
  ...
</ul>
<img alt="..." src="..." />

<h2>[Primary Keyword] Types: A Comprehensive Breakdown</h2>
<h3>[Type 1]</h3>
<p>...</p>
<h3>[Type 2]</h3>
<p>...</p>
<h3>[Type 3]</h3>
<p>...</p>
<img alt="..." src="..." />

<h2>How [Primary Keyword] Works: Step-by-Step Process</h2>
<ol>
  <li>[Step 1]</li>
  <li>[Step 2]</li>
  <li>[Step 3]</li>
</ol>
<img alt="..." src="..." />

<h2>[Primary Keyword] Use Cases: Real-World Applications</h2>
<h3>Residential / Personal Use</h3>
<p>...</p>
<h3>Commercial / Business Use</h3>
<p>...</p>
<h3>Specialized / Industry-Specific Use</h3>
<p>...</p>
<img alt="..." src="..." />

<!-- Optional: Brand Promotion Section -->
<div class="brand-promotion">...</div>

<h2>Frequently Asked Questions About [Primary Keyword]</h2>
<dl>
  <dt>[Question]</dt>
  <dd>[Answer]</dd>
  ...
</dl>

<h2>Conclusion: [Primary Keyword] & Moving Forward</h2>
<p>...</p>
```

### Shopify Metafield Integration
- **Metafield Name**: `content_html`
- **Output Type**: Clean HTML (no wrapper elements, no CSS classes for styling if not needed)
- **Ready for**: Direct insertion into Shopify's rich text field

---

## SEO Best Practices Built-In

1. **Keyword Consistency**: Primary keyword appears in H1, featured image alt, and major H2s
2. **Heading Hierarchy**: Strict enforcement prevents SEO penalties
3. **Image Optimization**: Alt text required and auto-suggested
4. **Content Length**: Section-level word count guidance ensures adequacy
5. **Schema Markup**: FAQ schema support for rich snippets
6. **Meta Description**: Generated based on first 150 characters of intro (separate field in UI)
7. **Slug**: Auto-generated from H1, editable before publish

---

## User Experience Flow

### Step-by-Step Linear Flow
1. **Enter Primary Keyword** → System locks it, enables other steps
2. **Set H1 Title** → Must include keyword, validation shows immediately
3. **Upload Featured Image** → Required, with drag-drop and file guidance
4. **Write Introduction** → Word counter, live preview, inline restrictions
5. **Fill "What Is" Section** → Fixed title, rich editor, optional image
6. **Create Benefits** → Repeatable blocks, auto-rendered as bullets
7. **Configure Types** → 3 Pre-made H3 blocks, customizable titles
8. **Define Process** → Steps auto-numbered, diagram image optional
9. **Add Use Cases** → 3 Pre-made H3 blocks for residential/commercial/specialized
10. **Optional: Brand Promotion** → Toggle on/off, input brand details
11. **Create FAQs** → 4–6 Q&A pairs, schema-ready
12. **Write Conclusion** → Summary + optional CTA

### Visual Feedback
- ✅ Green checkmark when section is complete
- ⚠️ Orange warning when section has issues but is not blocking
- 🔴 Red error when section violates hard constraints
- 📊 Progress indicator (sticky) shows % complete, number of items validated

---

## Glossary

- **Primary Keyword**: Core topic of the blog post (e.g., "SEO optimization")
- **Secondary Keywords**: Supporting topics (optional tags)
- **Heading Hierarchy**: H1 is title, H2 are major sections, H3 are subsections; no H4+
- **Schema Markup**: Structured data (JSON-LD) for search engines (FAQ, BreadcrumbList, etc.)
- **Alt Text**: Descriptive text for images (accessibility + SEO)
- **Metafield**: Shopify's custom field system for storing arbitrary data
- **WYSIWYG**: "What You See Is What You Get" – live preview of formatted content
- **CTA**: Call-to-Action (button text, link, directive to user)

---

## Notes for Developers

- **Template Immutability**: H2 titles are fixed templates; only content is editable.
- **Auto-Generation**: Many fields (alt text, file naming, H3 titles) are auto-suggested but overridable.
- **Validation**: Client-side validation on every field; server-side validation on save/publish.
- **Output**: Final HTML must be clean and semantic, suitable for rendering in Shopify or any CMS.
- **Non-Technical UX**: No code editors, no raw HTML input, no technical jargon.
