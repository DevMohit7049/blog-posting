import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import * as express from "express";
import express__default from "express";
import cors from "cors";
import multer from "multer";
async function demoAction() {
  return { statusCode: 200, body: { message: "Hello from Express server" } };
}
const handleDemo = (_req, res) => {
  demoAction().then((r) => res.status(r.statusCode).json(r.body));
};
const SECTION_RULES = {
  section1: {
    id: "section1",
    name: "Hero/Title",
    description: "Main heading (H1) with optional featured image",
    wrapper: "h1",
    image: {
      position: "after",
      alt: "Blog post featured image",
      required: false
    },
    schema: "article",
    required: true,
    order: 1
  },
  section2: {
    id: "section2",
    name: "Intro Paragraph",
    description: "Lead paragraph that hooks the reader",
    wrapper: "p",
    maxWords: 180,
    minWords: 50,
    required: true,
    order: 2,
    validationRules: {
      allowLineBreaks: false
    }
  },
  section3: {
    id: "section3",
    name: "Table of Contents",
    description: "Key topics covered (bullet list)",
    wrapper: "ul",
    itemWrapper: "li",
    required: true,
    order: 3
  },
  section4: {
    id: "section4",
    name: "Key Benefits/Overview",
    description: "Benefits or overview (bullet list with descriptions)",
    wrapper: "ul",
    itemWrapper: "li",
    required: true,
    order: 4
  },
  section5: {
    id: "section5",
    name: "Section Body",
    description: "Main content with subheadings (H2 format)",
    wrapper: "article",
    image: {
      position: "after",
      alt: "Supporting image",
      required: false
    },
    maxWords: 800,
    minWords: 300,
    required: true,
    order: 5
  },
  section6: {
    id: "section6",
    name: "Statistics/Facts",
    description: "Highlighted callout with stats or important fact",
    wrapper: "blockquote",
    required: false,
    order: 6
  },
  section7: {
    id: "section7",
    name: "Comparison",
    description: "Feature comparison or side-by-side content",
    wrapper: "table",
    itemWrapper: "tr",
    required: false,
    order: 7
  },
  section8: {
    id: "section8",
    name: "Expert Quote",
    description: "Attributed quote or testimonial",
    wrapper: "blockquote",
    required: false,
    order: 8
  },
  section9: {
    id: "section9",
    name: "How-To Steps",
    description: "Numbered steps or instructions",
    wrapper: "ol",
    itemWrapper: "li",
    required: false,
    order: 9
  },
  section10: {
    id: "section10",
    name: "Internal Links",
    description: "Related content or cross-links (as list)",
    wrapper: "ul",
    itemWrapper: "li",
    required: false,
    order: 10
  },
  section11: {
    id: "section11",
    name: "FAQs",
    description: "Frequently asked questions with answers",
    wrapper: "div",
    schema: "faq",
    required: false,
    order: 11,
    validationRules: {
      minItems: 4,
      maxItems: 12
    }
  },
  section12: {
    id: "section12",
    name: "CTA/Conclusion",
    description: "Call-to-action or closing paragraph",
    wrapper: "p",
    maxWords: 150,
    minWords: 30,
    required: true,
    order: 12,
    validationRules: {
      allowLineBreaks: false
    }
  }
};
function parseDocument(documentText) {
  const sections = [];
  const allImages = [];
  const warnings = [];
  const missingRequired = [];
  const sectionRegex = /\{(section\d+)\}/gi;
  const matches = Array.from(documentText.matchAll(sectionRegex));
  if (matches.length === 0) {
    return {
      sections: [],
      images: [],
      metadata: {
        totalWords: 0,
        totalSections: 0,
        isValid: false,
        missingRequired: [],
        warnings: ["No sections found. Document should contain {section1}, {section2}, etc."]
      }
    };
  }
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const sectionId = match[1].toLowerCase();
    const startIndex = match.index + match[0].length;
    const nextMatch = matches[i + 1];
    const endIndex = nextMatch ? nextMatch.index : documentText.length;
    const rawContent = documentText.substring(startIndex, endIndex).trim();
    const rule = SECTION_RULES[sectionId];
    if (!rule) {
      warnings.push(`Unknown section: ${sectionId}`);
      continue;
    }
    const sectionImages = extractImageReferences(rawContent, sectionId);
    if (sectionImages.length > 0) {
      console.log(`Found ${sectionImages.length} image(s) in ${sectionId}:`, sectionImages);
    }
    allImages.push(...sectionImages);
    const cleanContent = rawContent.replace(/\{img\}\s*([^\n\r{}]+)/gi, "").trim();
    const lines = cleanContent.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
    const wordCount = countWords(cleanContent);
    const sectionWarnings = validateSection(sectionId, cleanContent, wordCount, rule);
    sections.push({
      id: sectionId,
      name: rule.name,
      rawContent: cleanContent,
      lines,
      wordCount,
      rule,
      valid: sectionWarnings.length === 0,
      warnings: sectionWarnings,
      images: sectionImages
    });
  }
  const providedSections = sections.map((s) => s.id);
  for (const [sectionId, rule] of Object.entries(SECTION_RULES)) {
    if (rule.required && !providedSections.includes(sectionId)) {
      missingRequired.push(`${sectionId}: ${rule.name}`);
    }
  }
  const totalWords = sections.reduce((sum, s) => sum + s.wordCount, 0);
  const allWarnings = [...warnings, ...sections.flatMap((s) => s.warnings)];
  return {
    sections,
    images: allImages,
    metadata: {
      totalWords,
      totalSections: sections.length,
      isValid: missingRequired.length === 0 && allWarnings.length === 0,
      missingRequired,
      warnings: allWarnings
    }
  };
}
function validateSection(sectionId, content, wordCount, rule) {
  const warnings = [];
  if (rule.maxWords && wordCount > rule.maxWords) {
    warnings.push(
      `${sectionId}: Exceeds maximum word count (${wordCount}/${rule.maxWords})`
    );
  }
  if (rule.minWords && wordCount < rule.minWords) {
    warnings.push(
      `${sectionId}: Below minimum word count (${wordCount}/${rule.minWords})`
    );
  }
  if (sectionId !== "section1" && content.includes("<h1")) {
    warnings.push(`${sectionId}: Contains H1 tag (only section1 should have H1)`);
  }
  if (rule.validationRules) {
    const lines = content.split("\n").filter((line) => line.trim().length > 0);
    if (rule.validationRules.minItems && lines.length < rule.validationRules.minItems) {
      warnings.push(
        `${sectionId}: Too few items (${lines.length}/${rule.validationRules.minItems})`
      );
    }
    if (rule.validationRules.maxItems && lines.length > rule.validationRules.maxItems) {
      warnings.push(
        `${sectionId}: Too many items (${lines.length}/${rule.validationRules.maxItems})`
      );
    }
  }
  return warnings;
}
function countWords(text) {
  return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
}
function extractImageReferences(content, sectionId) {
  const imageRegex = /\{img\}\s*([^\n\r{}]+)/gi;
  const images = [];
  let match;
  let position = 0;
  while ((match = imageRegex.exec(content)) !== null) {
    const keyword = match[1].trim();
    if (keyword && keyword.length > 0) {
      images.push({
        keyword,
        sectionId,
        position
      });
      position++;
    }
  }
  return images;
}
async function parseDocumentAction(body) {
  try {
    const b = body;
    if (!b || !b.document) {
      return { statusCode: 400, body: { error: "Missing 'document' field in request body", details: "Document must be a non-empty string" } };
    }
    try {
      const parsed = parseDocument(b.document);
      return { statusCode: 200, body: { success: true, data: parsed } };
    } catch (parseError) {
      console.error("Error parsing document:", parseError);
      return { statusCode: 500, body: { error: "Failed to parse document", details: parseError instanceof Error ? parseError.message : String(parseError) } };
    }
  } catch (error) {
    console.error("Unexpected error in handleParseDocument:", error);
    return { statusCode: 500, body: { error: "Failed to parse document", details: error instanceof Error ? error.message : String(error) } };
  }
}
const handleParseDocument = (req, res) => {
  parseDocumentAction(req.body).then((r) => res.status(r.statusCode).json(r.body));
};
function generateHTML(parsed, options = {}) {
  const {
    includeSchema = true,
    includeImages = true,
    blogTitle,
    blogDate,
    authorName,
    imageUrls = {},
    featuredImageUrl
  } = options;
  const sections = [];
  if (includeSchema) {
    const schema = generateArticleSchema(blogTitle, blogDate, authorName);
    console.log("Generated schema markup:", schema.length, "characters");
    sections.push(schema);
  }
  if (includeImages && featuredImageUrl) {
    console.log("Adding featured image to HTML:", featuredImageUrl);
    const featuredImageHtml = `<img src="${featuredImageUrl}" alt="Featured image" style="width: 100%; max-width: 900px; height: auto; aspect-ratio: 16 / 9; object-fit: contain; margin: 0 auto 40px auto; border-radius: 12px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); display: block; background-color: #f5f5f5;" />`;
    sections.push(featuredImageHtml);
  } else {
    console.log("Featured image not included. includeImages:", includeImages, "featuredImageUrl:", featuredImageUrl);
  }
  for (const section of parsed.sections) {
    const html = generateSectionHTML(section, includeImages, imageUrls);
    console.log(`Section ${section.id} (${section.name}): generated ${html.length} characters`);
    if (html) {
      sections.push(html);
    }
  }
  const result = sections.join("\n\n");
  console.log("Total HTML output:", result.length, "characters from", sections.length, "sections");
  return result;
}
function generateSectionHTML(section, includeImages, imageUrls) {
  const { id, rawContent, rule, lines } = section;
  if (!id) {
    console.warn("Section has no ID");
    return "";
  }
  if (!rawContent && lines.length === 0) {
    console.warn(`Section ${id} has no content`);
    return "";
  }
  switch (id) {
    case "section1":
      return generateHero(rawContent, rule, includeImages, section, imageUrls);
    case "section2":
      return `<p style="font-size: 1.05em; line-height: 1.8; margin-bottom: 15px; margin-top: 0; color: #3a3a3a;">${textWithLinksToHTML(rawContent)}</p>`;
    case "section3":
      return generateList(lines, "ul", "Table of Contents");
    case "section4":
      return generateList(lines, "ul", "Key Benefits");
    case "section5":
      return generateSectionBody(rawContent, includeImages, section, imageUrls);
    case "section6":
      return `<blockquote style="border-left: 5px solid #d4a574; padding: 25px 30px; margin: 20px 0; background-color: #fef9f5; font-style: italic; font-size: 1.15em; color: #5a5a5a; line-height: 1.8;">${textWithLinksToHTML(rawContent)}</blockquote>`;
    case "section7":
      return generateComparisonTable(lines);
    case "section8":
      return `<blockquote style="border-left: 5px solid #d4a574; padding: 25px 30px; margin: 20px 0; background-color: #fef9f5; font-style: italic; font-size: 1.15em; color: #5a5a5a; line-height: 1.8;">${textWithLinksToHTML(rawContent)}</blockquote>`;
    case "section9":
      return generateList(lines, "ol", "Steps");
    case "section10":
      return generateList(lines, "ul", "Related Resources");
    case "section11":
      return generateFAQSection(lines);
    case "section12":
      return `<p style="font-size: 1.05em; line-height: 1.8; margin-bottom: 15px; margin-top: 0; color: #3a3a3a;">${textWithLinksToHTML(rawContent)}</p>`;
    default:
      console.warn(`Unknown section ID: ${id}. Valid sections are section1-section12.`);
      return "";
  }
}
function generateHero(content, rule, includeImages, section, imageUrls) {
  const h1 = `<h1 style="font-size: 2.5em; font-weight: 700; margin-bottom: 30px; margin-top: 0; line-height: 1.2; color: #424423; letter-spacing: -0.5px;">${textWithLinksToHTML(content)}</h1>`;
  if (includeImages && rule.image?.position === "after" && section.images && section.images.length > 0) {
    const image = section.images[0];
    console.log(`Looking for image keyword: "${image.keyword}"`);
    console.log(`Available imageUrls keys: ${Object.keys(imageUrls).join(", ")}`);
    const imageUrl = imageUrls[image.keyword];
    if (imageUrl) {
      console.log(`Resolved image URL: ${imageUrl}`);
      const imgTag = `<img src="${imageUrl}" alt="${image.keyword}" style="width: 100%; max-width: 850px; height: auto; display: block; margin: 25px auto 30px auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); object-fit: contain; background-color: #f5f5f5;" />`;
      return `${h1}
${imgTag}`;
    } else {
      console.log(`Image URL not available for keyword: ${image.keyword}`);
    }
  }
  return h1;
}
function generateList(lines, listType, title) {
  const tag = listType === "ul" ? "ul" : "ol";
  const listStyle = listType === "ul" ? "margin: 20px 0 20px 35px; line-height: 1.9;" : "margin: 20px 0 20px 35px; line-height: 1.9;";
  const items = lines.map((line) => `<li style="margin-bottom: 12px; font-size: 1.05em; color: #3a3a3a;">${textWithLinksToHTML(line)}</li>`).join("\n");
  let html = `<${tag} style="${listStyle}">
${items}
</${tag}>`;
  if (title) {
    html = `<h2 style="font-size: 1.8em; font-weight: 600; margin-top: 40px; margin-bottom: 20px; line-height: 1.3; color: #424423; border-bottom: 3px solid #e8e8e8; padding-bottom: 12px;">${title}</h2>
${html}`;
  }
  return html;
}
function generateSectionBody(content, includeImages, section, imageUrls) {
  const paragraphs = content.split(/\n\n+/).map((p) => p.trim());
  const sectionImages = section.images || [];
  let imageIndex = 0;
  const imagePlacementInterval = Math.ceil(paragraphs.length / (sectionImages.length || 1));
  const html = paragraphs.map((para, idx) => {
    const lines = para.split("\n");
    let result = "";
    if (lines[0].length < 60 && (lines[0].endsWith(":") || lines[0] === lines[0].toUpperCase())) {
      result += `<h2 style="font-size: 1.8em; font-weight: 600; margin-top: 40px; margin-bottom: 20px; line-height: 1.3; color: #424423; border-bottom: 3px solid #e8e8e8; padding-bottom: 12px;">${textWithLinksToHTML(lines[0])}</h2>
`;
      lines.shift();
    }
    const bodyText = lines.join("\n").trim();
    if (bodyText) {
      result += `<p style="font-size: 1.05em; line-height: 1.8; margin-bottom: 20px; margin-top: 0; color: #3a3a3a;">${textWithLinksToHTML(bodyText)}</p>`;
    }
    if (includeImages && imageIndex < sectionImages.length) {
      const shouldInsertImage = idx % imagePlacementInterval === imagePlacementInterval - 1 || idx === paragraphs.length - 1;
      if (shouldInsertImage && imageIndex < sectionImages.length) {
        const image = sectionImages[imageIndex];
        console.log(`Looking for image keyword: "${image.keyword}" in section at position ${imageIndex}`);
        const imageUrl = imageUrls[image.keyword];
        if (imageUrl) {
          console.log(`Resolved image URL for section: ${imageUrl}`);
          result += `
<img src="${imageUrl}" alt="${image.keyword}" style="width: 100%; max-width: 850px; height: auto; display: block; margin: 30px auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); object-fit: contain; background-color: #f5f5f5;" />`;
          imageIndex++;
        } else {
          console.log(`Image URL not available for keyword: ${image.keyword}. Image will be skipped.`);
          imageIndex++;
        }
      }
    }
    return result;
  }).join("\n\n");
  if (includeImages && imageIndex < sectionImages.length) {
    console.log(`Adding ${sectionImages.length - imageIndex} remaining image(s) at end of section`);
    const remainingImages = paragraphs.length > 0 ? "\n\n" : "";
    const additionalImages = sectionImages.slice(imageIndex).map((image) => {
      const imageUrl = imageUrls[image.keyword];
      if (imageUrl) {
        console.log(`Adding remaining image: ${image.keyword}`);
        return `<img src="${imageUrl}" alt="${image.keyword}" style="width: 100%; max-width: 850px; height: auto; display: block; margin: 30px auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); object-fit: contain; background-color: #f5f5f5;" />`;
      }
      return null;
    }).filter(Boolean).join("\n\n");
    return html + remainingImages + additionalImages;
  }
  return html;
}
function generateComparisonTable(lines) {
  if (lines.length < 2) {
    return '<p style="font-size: 1.05em; line-height: 1.8; margin-bottom: 15px; margin-top: 0; color: #3a3a3a;">No comparison data provided</p>';
  }
  const headers = lines[0].split("|").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => line.split("|").map((cell) => cell.trim()));
  let html = '<table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 1em; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); border-radius: 6px; overflow: hidden;">\n';
  html += '<thead style="background: linear-gradient(135deg, #f5f5f5 0%, #ebebeb 100%);"><tr>';
  for (const header of headers) {
    html += `<th style="padding: 15px 18px; text-align: left; font-weight: 600; color: #424423; border-bottom: 2px solid #d0d0d0; font-size: 0.95em; text-transform: uppercase; letter-spacing: 0.5px;">${textWithLinksToHTML(header)}</th>`;
  }
  html += "</tr></thead>\n";
  html += "<tbody>";
  for (const row of rows) {
    html += "<tr>";
    for (const cell of row) {
      html += `<td style="padding: 15px 18px; border-bottom: 1px solid #e8e8e8; color: #3a3a3a;">${textWithLinksToHTML(cell)}</td>`;
    }
    html += "</tr>";
  }
  html += "</tbody>\n</table>";
  return html;
}
function generateFAQSection(lines) {
  const faqs = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/^Q\d*:?\s+/i)) {
      const question = line.replace(/^Q\d*:?\s+/i, "").trim();
      if (!question) continue;
      let answer = "";
      let answerLines = [];
      let j = i + 1;
      let foundExplicitAnswer = false;
      while (j < lines.length) {
        const nextLine = lines[j];
        if (nextLine.match(/^Q\d*:?\s+/i)) {
          break;
        }
        if (nextLine.match(/^A\d*:?\s+/i)) {
          answer = nextLine.replace(/^A\d*:?\s+/i, "").trim();
          foundExplicitAnswer = true;
          break;
        }
        if (!foundExplicitAnswer && j === i + 1) {
          answerLines.push(nextLine);
        } else if (!foundExplicitAnswer && answerLines.length > 0) {
          answerLines.push(nextLine);
        }
        j++;
      }
      if (!foundExplicitAnswer && answerLines.length > 0) {
        answer = answerLines.join(" ").trim();
      }
      if (question && answer) {
        faqs.push({ question, answer });
      }
    }
  }
  if (faqs.length === 0) {
    const fullText = lines.join(" ");
    const qPattern = /Q\d*:?\s*([\s\S]*?)(?=A\d*:?\s*)/gi;
    const aPattern = /A\d*:?\s*([\s\S]*?)(?=Q\d*:?\s*|$)/gi;
    let qMatch;
    let aMatches = [...fullText.matchAll(aPattern)];
    let qIndex = 0;
    while ((qMatch = qPattern.exec(fullText)) !== null) {
      const question = qMatch[1].trim();
      const answer = aMatches[qIndex] ? aMatches[qIndex][1].trim() : "";
      if (question && answer) {
        faqs.push({ question, answer });
      }
      qIndex++;
    }
  }
  if (faqs.length === 0) {
    return '<p style="font-size: 1.05em; line-height: 1.8; margin-bottom: 15px; margin-top: 0; color: #3a3a3a;">No FAQs provided</p>';
  }
  let html = '<h2 style="font-size: 1.8em; font-weight: 600; margin-top: 50px; margin-bottom: 28px; line-height: 1.3; color: #424423; border-bottom: 3px solid #e8e8e8; padding-bottom: 12px;">Frequently Asked Questions</h2>\n';
  html += '<div style="margin: 25px 0;">\n';
  for (const faq of faqs) {
    html += `
<details style="margin-bottom: 18px; border: 1px solid #d0d0d0; border-radius: 6px; overflow: hidden;">
  <summary style="padding: 20px 22px; background-color: #f9f9f9; cursor: pointer; font-weight: 600; font-size: 1.05em; color: #424423; user-select: none; display: flex; align-items: center; transition: background-color 0.2s ease;">
    ${textWithLinksToHTML(faq.question)}
  </summary>
  <div style="padding: 20px 22px; border-top: 1px solid #e0e0e0; background-color: #ffffff; color: #3a3a3a; font-size: 1em; line-height: 1.8;">
    ${textWithLinksToHTML(faq.answer)}
  </div>
</details>
`;
  }
  html += "</div>";
  return html;
}
function generateArticleSchema(title, datePublished, author) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title || "Blog Post",
    datePublished: datePublished || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    author: {
      "@type": "Person",
      name: author || "Author"
    }
  };
  return `<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
<\/script>`;
}
function escapeHTML(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
function textWithLinksToHTML(text) {
  let escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  escaped = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
    if (isValidURL(url)) {
      return `<a href="${escapeHTML(url)}" style="color: #2563eb; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 2px;">${linkText}</a>`;
    }
    return match;
  });
  return escaped;
}
function isValidURL(url) {
  if (url.startsWith("javascript:") || url.startsWith("data:") || url.startsWith("vbscript:")) {
    return false;
  }
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("mailto:") || url.startsWith("/") || url.startsWith("#") || url.startsWith("?")) {
    return true;
  }
  if (!url.includes("://")) {
    return true;
  }
  return false;
}
function getBlogStyles() {
  return `
    .blog-content {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      line-height: 1.7;
      color: #2c3e50;
      max-width: 720px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .blog-content * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* Typography */
    .blog-content h1 {
      font-size: 2.5em;
      font-weight: 700;
      margin-bottom: 30px;
      margin-top: 0;
      line-height: 1.2;
      color: #424423;
      letter-spacing: -0.5px;
    }

    .blog-content h2 {
      font-size: 1.8em;
      font-weight: 600;
      margin-top: 50px;
      margin-bottom: 28px;
      line-height: 1.3;
      color: #424423;
      border-bottom: 3px solid #e8e8e8;
      padding-bottom: 12px;
    }

    .blog-content h3 {
      font-size: 1.4em;
      font-weight: 600;
      margin-top: 40px;
      margin-bottom: 20px;
      line-height: 1.3;
      color: #424423;
    }

    .blog-content p {
      font-size: 1.05em;
      line-height: 1.8;
      margin-bottom: 20px;
      color: #3a3a3a;
      text-align: justify;
    }

    /* Links */
    .blog-content a {
      color: #2563eb;
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 2px;
      transition: all 0.2s ease;
    }

    .blog-content a:hover {
      color: #1d4ed8;
      text-decoration-thickness: 2px;
    }

    .blog-content a:visited {
      color: #7c3aed;
    }

    /* Images */
    .blog-content img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 40px auto;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    /* Featured image */
    .blog-content img.featured-image {
      width: 100%;
      max-width: 100%;
      height: auto;
      aspect-ratio: 16 / 9;
      object-fit: cover;
      margin: 0 0 40px 0;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    /* Lists */
    .blog-content ul,
    .blog-content ol {
      margin: 16px 0 28px 35px;
      line-height: 1.9;
    }

    .blog-content li {
      margin-bottom: 16px;
      font-size: 1.05em;
      color: #3a3a3a;
    }

    /* Blockquotes */
    .blog-content blockquote {
      border-left: 5px solid #d4a574;
      padding: 25px 30px;
      margin: 40px 0;
      background-color: #fef9f5;
      font-style: italic;
      font-size: 1.15em;
      color: #5a5a5a;
      line-height: 1.8;
    }

    /* Tables */
    .blog-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 40px 0;
      font-size: 1em;
      background-color: #ffffff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border-radius: 6px;
      overflow: hidden;
    }

    .blog-content thead {
      background: linear-gradient(135deg, #f5f5f5 0%, #ebebeb 100%);
    }

    .blog-content th {
      padding: 15px 18px;
      text-align: left;
      font-weight: 600;
      color: #424423;
      border-bottom: 2px solid #d0d0d0;
      font-size: 0.95em;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .blog-content td {
      padding: 15px 18px;
      border-bottom: 1px solid #e8e8e8;
      color: #3a3a3a;
    }

    .blog-content tbody tr:last-child td {
      border-bottom: none;
    }

    .blog-content tbody tr:hover {
      background-color: #f9f9f9;
    }

    /* Details/Accordion */
    .blog-content details {
      margin: 18px 0;
      padding: 0;
      border: 1px solid #d0d0d0;
      border-radius: 6px;
      background-color: transparent;
      cursor: pointer;
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .blog-content details:hover {
      background-color: #f5f5f5;
      border-color: #d0d0d0;
    }

    .blog-content details[open] {
      background-color: #f5f5f5;
    }

    .blog-content summary {
      font-weight: 600;
      font-size: 1.05em;
      color: #424423;
      cursor: pointer;
      outline: none;
      user-select: none;
      padding: 20px 22px;
      background-color: #f9f9f9;
      display: flex;
      align-items: center;
      transition: background-color 0.2s ease;
    }

    .blog-content details > div {
      padding: 20px 22px;
      border-top: 1px solid #e0e0e0;
      background-color: #ffffff;
      color: #3a3a3a;
      font-size: 1em;
      line-height: 1.8;
    }

    /* Schema markup */
    .blog-content script[type="application/ld+json"] {
      display: none;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .blog-content h1 {
        font-size: 2em;
        margin-bottom: 24px;
      }

      .blog-content h2 {
        font-size: 1.5em;
        margin-top: 40px;
        margin-bottom: 20px;
      }

      .blog-content p {
        font-size: 1em;
        text-align: left;
      }

      .blog-content ul,
      .blog-content ol {
        margin-left: 24px;
      }

      .blog-content blockquote {
        padding: 20px 24px;
        font-size: 1.05em;
      }

      .blog-content table {
        font-size: 0.95em;
      }

      .blog-content th,
      .blog-content td {
        padding: 12px;
      }
    }
  `;
}
function generateStyledHTML(parsed, options = {}) {
  const content = generateHTML(parsed, options);
  const wrapperStyle = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    line-height: 1.7;
    color: #2c3e50;
    max-width: 720px;
    margin: 0 auto;
    padding: 40px 20px;
    background-color: #ffffff;
  `;
  const styleTag = `<style>
    .blog-content {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      line-height: 1.7;
      color: #2c3e50;
      max-width: 720px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .blog-content * { margin: 0; padding: 0; box-sizing: border-box; }
    .blog-content h1 { font-size: 2.5em; font-weight: 700; margin-bottom: 30px; margin-top: 0; line-height: 1.2; color: #424423; letter-spacing: -0.5px; }
    .blog-content h2 { font-size: 1.8em; font-weight: 600; margin-top: 40px; margin-bottom: 20px; line-height: 1.3; color: #424423; border-bottom: 3px solid #e8e8e8; padding-bottom: 12px; }
    .blog-content p { font-size: 1.05em; line-height: 1.8; margin-bottom: 20px; color: #3a3a3a; }
    .blog-content ul, .blog-content ol { margin: 20px 0 20px 35px; line-height: 1.9; }
    .blog-content li { margin-bottom: 12px; font-size: 1.05em; color: #3a3a3a; }
    .blog-content blockquote { border-left: 5px solid #d4a574; padding: 25px 30px; margin: 20px 0; background-color: #fef9f5; font-style: italic; font-size: 1.15em; color: #5a5a5a; line-height: 1.8; }
    .blog-content table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 1em; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); border-radius: 6px; overflow: hidden; }
    .blog-content thead { background: linear-gradient(135deg, #f5f5f5 0%, #ebebeb 100%); }
    .blog-content th { padding: 15px 18px; text-align: left; font-weight: 600; color: #424423; border-bottom: 2px solid #d0d0d0; font-size: 0.95em; text-transform: uppercase; letter-spacing: 0.5px; }
    .blog-content td { padding: 15px 18px; border-bottom: 1px solid #e8e8e8; color: #3a3a3a; }
    .blog-content img { max-width: 100%; height: auto; display: block; margin: 40px auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
    .blog-content details { margin: 18px 0; padding: 0; border: 1px solid #d0d0d0; border-radius: 6px; cursor: pointer; overflow: hidden; }
    .blog-content summary { font-weight: 600; font-size: 1.05em; color: #424423; cursor: pointer; outline: none; user-select: none; padding: 20px 22px; background-color: #f9f9f9; display: flex; align-items: center; }
    .blog-content details > div { padding: 20px 22px; border-top: 1px solid #e0e0e0; background-color: #ffffff; color: #3a3a3a; font-size: 1em; line-height: 1.8; }
    @media (max-width: 768px) {
      .blog-content h1 { font-size: 2em; margin-bottom: 24px; }
      .blog-content h2 { font-size: 1.5em; margin-top: 40px; margin-bottom: 20px; }
      .blog-content p { font-size: 1em; }
      .blog-content ul, .blog-content ol { margin-left: 24px; }
    }
  </style>`;
  return `${styleTag}<div class="blog-content" style="${wrapperStyle.replace(/\n/g, "")}">
${content}
</div>`;
}
function generateHTMLDocument(parsed, options = {}) {
  const content = generateHTML(parsed, options);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(options.blogTitle || "Blog Post")}</title>
  <style>
    html {
      scroll-behavior: smooth;
    }
    body {
      background-color: #fafafa;
      margin: 0;
      padding: 0;
    }
    ${getBlogStyles()}
  </style>
</head>
<body>
  <div class="blog-content">
    ${content}
  </div>
</body>
</html>`;
}
async function generateHTMLAction(body) {
  try {
    const b = body;
    if (!b || typeof b !== "object") {
      return { statusCode: 400, body: { error: "Invalid request body", details: "Body must be a JSON object" } };
    }
    const { document, options = {}, format = "fragment" } = b;
    if (!document || typeof document !== "string") {
      return { statusCode: 400, body: { error: "Missing 'document' field in request body", details: "Document must be a non-empty string" } };
    }
    if (options.imageUrls) {
      console.log("Received imageUrls:", JSON.stringify(options.imageUrls, null, 2));
    }
    if (options.featuredImageUrl) {
      console.log("Received featuredImageUrl:", options.featuredImageUrl);
    } else {
      console.log("No featuredImageUrl provided in options");
    }
    if (typeof parseDocument !== "function" || typeof generateHTML !== "function") {
      return { statusCode: 500, body: { error: "Server initialization error", details: "Required functions unavailable." } };
    }
    let parsed;
    try {
      parsed = parseDocument(document);
    } catch (parseError) {
      return { statusCode: 400, body: { error: "Failed to parse document", details: parseError instanceof Error ? parseError.message : "Unknown error" } };
    }
    const validationWarnings = [];
    if (Array.isArray(parsed.metadata?.warnings) && parsed.metadata.warnings.length > 0) {
      validationWarnings.push(...parsed.metadata.warnings);
    }
    if (Array.isArray(parsed.metadata?.missingRequired) && parsed.metadata.missingRequired.length > 0) {
      validationWarnings.push(...parsed.metadata.missingRequired.map((s) => `Missing required section: ${s}`));
    }
    if (parsed.images.length > 0 && (!options.imageUrls || Object.keys(options.imageUrls).length === 0)) {
      return { statusCode: 202, body: { success: false, requiresImageUpload: true, images: parsed.images.map((img) => ({ keyword: img.keyword, sectionId: img.sectionId })), message: "Document contains images. Please upload images to Shopify first." } };
    }
    let html;
    try {
      html = format === "document" ? generateHTMLDocument(parsed, options) : generateHTML(parsed, options);
      if (!html || html.trim().length === 0) {
        return { statusCode: 500, body: { error: "HTML generation failed", details: "Generated HTML is empty.", metadata: parsed.metadata } };
      }
    } catch (generateError) {
      return { statusCode: 500, body: { error: "Failed to generate HTML", details: generateError instanceof Error ? generateError.message : "Unknown error" } };
    }
    return {
      statusCode: 200,
      body: {
        success: true,
        html,
        metadata: parsed.metadata,
        images: parsed.images,
        sections: parsed.sections.map((s) => ({ id: s.id, name: s.name, wordCount: s.wordCount, valid: s.valid, warnings: s.warnings, images: s.images })),
        hasValidationWarnings: validationWarnings.length > 0,
        validationWarnings
      }
    };
  } catch (error) {
    console.error("Unexpected error in handleGenerateHTML:", error);
    return { statusCode: 500, body: { error: "Unexpected server error", details: error instanceof Error ? error.message : String(error) } };
  }
}
const handleGenerateHTML = (req, res) => {
  generateHTMLAction(req.body).then((r) => res.status(r.statusCode).json(r.body));
};
class ShopifyClient {
  shopName;
  accessToken;
  apiVersion;
  baseUrl;
  constructor() {
    this.shopName = process.env.SHOPIFY_SHOP || "";
    this.accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || "";
    this.apiVersion = process.env.SHOPIFY_API_VERSION || "2025-01";
    this.baseUrl = `https://${this.shopName}/admin/api/${this.apiVersion}`;
  }
  /**
   * Validate that Shopify credentials are configured
   */
  validateCredentials() {
    if (!this.shopName || !this.accessToken) {
      throw new Error(
        "Shopify credentials not configured. Please set SHOPIFY_SHOP and SHOPIFY_ADMIN_ACCESS_TOKEN environment variables."
      );
    }
    if (!this.shopName.includes(".")) {
      throw new Error(
        `Invalid SHOPIFY_SHOP format: "${this.shopName}". Please ensure SHOPIFY_SHOP is in the format "myshop.myshopify.com"`
      );
    }
  }
  /**
   * Make a GraphQL request to Shopify
   */
  async graphql(query, variables) {
    this.validateCredentials();
    const response = await fetch(`${this.baseUrl}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": this.accessToken
      },
      body: JSON.stringify({
        query,
        variables
      })
    });
    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }
    return response.json();
  }
  /**
   * Publish a blog article to Shopify
   */
  async publishArticle(blogId, article) {
    this.validateCredentials();
    const restUrl = `${this.baseUrl}/blogs/${blogId}/articles.json`;
    const articleData = {
      title: article.title,
      body_html: article.bodyHtml,
      author: article.author || "Blog Generator",
      published_at: article.publishedAt || (/* @__PURE__ */ new Date()).toISOString(),
      tags: article.tags?.join(",") || ""
    };
    if (article.image?.src) {
      const imageUrl = article.image.src;
      if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
        console.error("Invalid featured image URL format:", imageUrl);
        throw new Error(
          `Featured image URL must be an absolute HTTP/HTTPS URL. Received: ${imageUrl}. Please ensure the image was successfully uploaded to Shopify.`
        );
      }
      try {
        new URL(imageUrl);
      } catch (urlError) {
        console.error("Featured image URL parse error:", urlError);
        throw new Error(
          `Featured image URL is malformed: ${imageUrl}. Please ensure you're using a valid Shopify image URL.`
        );
      }
      articleData.image = {
        src: imageUrl
      };
      if (article.image.alt) {
        articleData.image.alt = article.image.alt;
      }
      console.log(`Publishing article with featured image URL: ${imageUrl}`);
    } else {
      console.warn("No featured image provided for article");
    }
    const response = await fetch(restUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": this.accessToken
      },
      body: JSON.stringify({ article: articleData })
    });
    const responseData = await response.json();
    if (!response.ok) {
      const error = JSON.stringify(responseData, null, 2);
      console.error("Article creation failed:", error);
      throw new Error(`Failed to publish article: ${error}`);
    }
    if (responseData.errors) {
      console.error("Shopify API returned errors:", responseData.errors);
      throw new Error(`Shopify API error: ${JSON.stringify(responseData.errors)}`);
    }
    const articleId = responseData.article?.id;
    if (!articleId) {
      console.error("No article ID in response:", responseData);
      throw new Error("Failed to get article ID from response");
    }
    const publishedArticle = responseData.article;
    console.log(`Article created successfully. Article ID: ${articleId}`);
    console.log(`Article image field set: ${!!publishedArticle.image}`);
    if (publishedArticle.image) {
      console.log(`  Image src: ${publishedArticle.image.src}`);
      console.log(`  Image alt: ${publishedArticle.image.alt || "N/A"}`);
    }
    return articleId;
  }
  /**
   * Update an existing article
   */
  async updateArticle(blogId, articleId, article) {
    const restUrl = `${this.baseUrl}/blogs/${blogId}/articles/${articleId}.json`;
    const updateData = {};
    if (article.title) updateData.title = article.title;
    if (article.bodyHtml) updateData.body_html = article.bodyHtml;
    if (article.author) updateData.author = article.author;
    if (article.tags) updateData.tags = article.tags.join(",");
    const response = await fetch(restUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": this.accessToken
      },
      body: JSON.stringify({ article: updateData })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update article: ${error}`);
    }
    const data = await response.json();
    return data.article.id;
  }
  /**
   * Get blog ID from shop
   */
  async getBlogId() {
    this.validateCredentials();
    const blogIdEnv = process.env.BLOG_ID;
    if (blogIdEnv) {
      return blogIdEnv;
    }
    const restUrl = `${this.baseUrl}/blogs.json`;
    const response = await fetch(restUrl, {
      headers: {
        "X-Shopify-Access-Token": this.accessToken
      }
    });
    if (!response.ok) {
      throw new Error("Failed to fetch blogs from Shopify");
    }
    const data = await response.json();
    if (data.blogs.length === 0) {
      throw new Error("No blogs found in this Shopify store");
    }
    return data.blogs[0].id;
  }
  /**
   * Upload an image to Shopify's File Storage
   * Uses stagedUploads -> fileCreate flow to properly register files
   */
  async uploadImage(fileBuffer, filename, altText) {
    try {
      const mimeType = this.getMimeType(filename);
      const stagedUploadQuery = `
        mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
          stagedUploadsCreate(input: $input) {
            stagedTargets {
              url
              resourceUrl
              parameters {
                name
                value
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      const stagedVariables = {
        input: [
          {
            resource: "FILE",
            filename,
            mimeType,
            httpMethod: "POST"
          }
        ]
      };
      const stagedResponse = await this.graphql(stagedUploadQuery, stagedVariables);
      if (stagedResponse.errors || !stagedResponse.data?.stagedUploadsCreate?.stagedTargets?.length) {
        throw new Error(
          `Failed to get upload URL: ${stagedResponse.errors?.[0]?.message || "Unknown error"}`
        );
      }
      const stagedTarget = stagedResponse.data.stagedUploadsCreate.stagedTargets[0];
      const uploadUrl = stagedTarget.url;
      const parameters = stagedTarget.parameters || [];
      const resourceUrl = stagedTarget.resourceUrl;
      const formData = new FormData();
      for (const param of parameters) {
        formData.append(param.name, param.value);
      }
      const uint8Array = new Uint8Array(fileBuffer);
      formData.append("file", new Blob([uint8Array], { type: mimeType }), filename);
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: formData
      });
      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
      }
      console.log("File uploaded successfully to staging URL:", resourceUrl);
      const fileCreateQuery = `
        mutation fileCreate($files: [FileCreateInput!]!) {
          fileCreate(files: $files) {
            files {
              id
              fileStatus
              alt
              preview { image { url } status }
            }
            userErrors { message }
          }
        }
      `;
      const fileCreateVariables = {
        files: [
          {
            alt: altText || filename,
            contentType: "IMAGE",
            originalSource: resourceUrl
          }
        ]
      };
      console.log("Creating file record in Shopify for:", resourceUrl);
      const fileCreateResponse = await this.graphql(fileCreateQuery, fileCreateVariables);
      console.log("FileCreate response:", JSON.stringify(fileCreateResponse, null, 2));
      if (fileCreateResponse.errors) {
        console.error("FileCreate errors:", fileCreateResponse.errors);
        throw new Error(
          `FileCreate failed: ${fileCreateResponse.errors.map((e) => e.message).join("; ")}`
        );
      }
      const fileData = fileCreateResponse.data?.fileCreate;
      if (!fileData?.files?.length) {
        throw new Error("FileCreate returned no files");
      }
      const createdFile = fileData.files[0];
      let imageUrl = createdFile.preview?.image?.url || null;
      if (!imageUrl && createdFile.fileStatus === "UPLOADED") {
        const fileId = createdFile.id;
        console.log("File uploaded but not yet processed, polling for image URL. File ID:", fileId);
        for (let i = 0; i < 30; i++) {
          await new Promise((resolve) => setTimeout(resolve, 2e3));
          const pollQuery = `
            query getFile($id: ID!) {
              node(id: $id) {
                ... on MediaImage {
                  id
                  fileStatus
                  preview { image { url } status }
                  image {
                    url
                  }
                }
                ... on GenericFile {
                  id
                  fileStatus
                  preview { image { url } status }
                  url
                }
              }
            }
          `;
          const pollResponse = await this.graphql(pollQuery, { id: fileId });
          if (pollResponse.errors) {
            console.error("Poll error:", pollResponse.errors);
            continue;
          }
          const node = pollResponse.data?.node;
          if (!node) {
            console.log(`Poll attempt ${i + 1}: Node not found, retrying...`);
            continue;
          }
          const status = node.fileStatus || node.preview?.status;
          const previewUrl = node.preview?.image?.url;
          const imageUrlDirect = node.image?.url;
          const genericUrl = node.url;
          const url = previewUrl || imageUrlDirect || genericUrl;
          console.log(`Poll attempt ${i + 1}: Status ${status}, previewUrl: ${!!previewUrl}, imageUrl: ${!!imageUrlDirect}, genericUrl: ${!!genericUrl}`);
          if (url) {
            imageUrl = url;
            console.log("Poll successful, obtained image URL:", imageUrl);
            break;
          }
          if (status === "READY") {
            console.log(`File status is READY but no URL found yet, continuing to poll...`);
            continue;
          }
          console.log(`Poll attempt ${i + 1}: File status is ${status}, waiting...`);
        }
      }
      if (!imageUrl) {
        throw new Error(
          "Image processing timeout: Shopify took too long to process the image. Please try uploading again. If the problem persists, check that your image file is valid."
        );
      }
      console.log("Successfully uploaded image. Final URL:", imageUrl);
      return imageUrl;
    } catch (error) {
      throw new Error(
        `Image upload failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Determine MIME type from filename
   */
  getMimeType(filename) {
    const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
    const mimeTypes = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp"
    };
    return mimeTypes[ext] || "image/jpeg";
  }
  /**
   * Fetch products from Shopify with timeout
   */
  async getProducts(limit = 250) {
    this.validateCredentials();
    const restUrl = `${this.baseUrl}/products.json?limit=${Math.min(limit, 250)}&fields=id,title,handle,image`;
    try {
      console.log(`Fetching products from Shopify: ${restUrl}`);
      console.log(`Shop: ${this.shopName}, API Version: ${this.apiVersion}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3e4);
      try {
        const response = await fetch(restUrl, {
          headers: {
            "X-Shopify-Access-Token": this.accessToken
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        console.log(`Shopify response status: ${response.status} ${response.statusText}`);
        console.log(`Response headers content-type: ${response.headers.get("content-type")}`);
        if (response.status === 304) {
          console.warn("Shopify returned 304 Not Modified - returning empty products array");
          return [];
        }
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Shopify API error (${response.status}):`, errorText.substring(0, 500));
          if (response.status === 401) {
            throw new Error("Shopify authentication failed. Please check your access token.");
          } else if (response.status === 404) {
            throw new Error("Shopify store not found. Please verify your shop name.");
          } else {
            throw new Error(`Failed to fetch products from Shopify: ${response.status} ${response.statusText}`);
          }
        }
        const contentType = response.headers.get("content-type");
        let data;
        try {
          if (!contentType?.includes("application/json")) {
            const errorText = await response.text();
            console.error("⚠️  Invalid content type. Expected JSON but got:", contentType);
            console.error("Response body (first 500 chars):", errorText.substring(0, 500));
            try {
              console.log("Attempting to parse response as JSON despite content-type mismatch...");
              data = JSON.parse(errorText);
              console.log("✓ Successfully parsed as JSON");
            } catch (jsonError) {
              throw new Error(`Shopify returned invalid response format. Expected JSON but got ${contentType || "unknown"}. Response: ${errorText.substring(0, 200)}`);
            }
          } else {
            data = await response.json();
          }
        } catch (parseError) {
          console.error("❌ Failed to parse Shopify response:", parseError);
          throw new Error(`Failed to parse Shopify response: ${parseError instanceof Error ? parseError.message : "Unknown error"}`);
        }
        console.log("Full Shopify response:", JSON.stringify(data, null, 2).substring(0, 1e3));
        if (!data.products || !Array.isArray(data.products)) {
          console.warn("No products array in Shopify response. Response keys:", Object.keys(data).join(", "));
          console.warn("Response data:", JSON.stringify(data).substring(0, 500));
          return [];
        }
        console.log(`Successfully fetched ${data.products.length} products from Shopify`);
        if (data.products.length > 0) {
          console.log("First product raw data:", JSON.stringify(data.products[0]));
        }
        const mappedProducts = data.products.map((product) => ({
          id: product.id,
          title: product.title,
          handle: product.handle,
          image: product.image?.src
        }));
        console.log("Mapped products sample:", mappedProducts.slice(0, 2));
        return mappedProducts;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          console.error("Shopify API request timeout - took longer than 30 seconds");
          throw new Error("Shopify API request timed out. The service may be temporarily unavailable.");
        }
        throw fetchError;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Error in getProducts:", errorMsg);
      throw error;
    }
  }
  /**
   * Update article metafield
   */
  async updateArticleMetafield(blogId, articleId, namespace, key, value, valueType = "json") {
    this.validateCredentials();
    const numericArticleId = String(articleId).includes("/") ? String(articleId).split("/").pop() : articleId;
    console.log("=== Updating Article Metafield via REST API ===");
    console.log(`Blog ID: ${blogId}`);
    console.log(`Article ID: ${numericArticleId}`);
    console.log(`Namespace: ${namespace}, Key: ${key}`);
    console.log(`Value Type: ${valueType}`);
    console.log(`Value (first 200 chars): ${value.substring(0, 200)}`);
    const restUrl = `${this.baseUrl}/blogs/${blogId}/articles/${numericArticleId}/metafields.json`;
    console.log(`REST URL: ${restUrl}`);
    const payload = {
      metafield: {
        namespace,
        key,
        value,
        type: valueType
      }
    };
    console.log("Metafield payload:", JSON.stringify(payload, null, 2));
    try {
      const response = await fetch(restUrl, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": this.accessToken,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      console.log(`Metafield update response status: ${response.status}`);
      const responseData = await response.json();
      console.log("Metafield response:", JSON.stringify(responseData, null, 2));
      if (!response.ok) {
        const errorMsg = responseData?.errors || responseData?.error || response.statusText;
        console.error(`Metafield update failed (${response.status}):`, errorMsg);
        throw new Error(`Failed to update metafield: ${JSON.stringify(errorMsg)}`);
      }
      console.log("✅ Metafield updated successfully via REST API");
      if (responseData.metafield) {
        const metafield = responseData.metafield;
        console.log(`  ✓ ID: ${metafield.id}`);
        console.log(`  ✓ Namespace: ${metafield.namespace}`);
        console.log(`  ✓ Key: ${metafield.key}`);
        console.log(`  ✓ Type: ${metafield.type}`);
      }
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Error updating metafield:", errorMsg);
      throw error;
    }
  }
  /**
   * Validate Shopify connection
   */
  async validateConnection() {
    try {
      this.validateCredentials();
      const restUrl = `${this.baseUrl}/shop.json`;
      console.log(`Validating Shopify connection. URL: ${restUrl}`);
      console.log(`Shop name: ${this.shopName}`);
      console.log(`API version: ${this.apiVersion}`);
      const response = await fetch(restUrl, {
        headers: {
          "X-Shopify-Access-Token": this.accessToken
        }
      });
      console.log(`Shopify shop.json response status: ${response.status}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Shopify API error (${response.status}): ${errorText}`);
        if (response.status === 401) {
          throw new Error("Authentication failed - Invalid or expired access token. Please regenerate your Shopify API access token.");
        } else if (response.status === 404) {
          throw new Error("Shop not found - Please check that SHOPIFY_SHOP is correctly formatted (e.g., myshop.myshopify.com).");
        } else if (response.status >= 400 && response.status < 500) {
          throw new Error(`Client error: ${response.statusText}. Please verify your Shopify credentials.`);
        } else {
          throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
        }
      }
      const data = await response.json();
      console.log(`Successfully connected to Shopify shop: ${data.shop?.name}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Shopify connection validation error:", errorMessage);
      throw new Error(errorMessage);
    }
  }
}
function getShopifyClient() {
  const shopName = process.env.SHOPIFY_SHOP;
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!shopName || !accessToken) {
    throw new Error(
      "Shopify credentials not configured. Please set SHOPIFY_SHOP and SHOPIFY_ADMIN_ACCESS_TOKEN environment variables."
    );
  }
  return new ShopifyClient();
}
const handlePublishShopify = async (req, res) => {
  try {
    console.log("=== POST /api/publish-shopify request received ===");
    const body = req.body;
    if (!body || typeof body !== "object") {
      return res.status(400).json({
        error: "Invalid request body",
        details: "Request body must be a JSON object with 'document' and 'title'."
      });
    }
    console.log("Request body keys:", Object.keys(body).join(", "));
    const { document, title, author, tags, publicationDate, imageUrls, featuredImageUrl, relatedProducts } = body;
    console.log("Publish parameters:");
    console.log("  - Title:", title);
    console.log("  - Document length:", document?.length);
    console.log("  - Author:", author || "Not provided");
    console.log("  - Tags:", tags?.length || 0);
    console.log("  - Featured image URL:", featuredImageUrl ? "Present" : "Not provided");
    console.log("  - Image URLs count:", Object.keys(imageUrls || {}).length);
    console.log("  - Related products:", relatedProducts?.length || 0);
    if (!document || !title) {
      console.error("Missing required fields");
      return res.status(400).json({
        error: "Missing required fields: 'document' and 'title'"
      });
    }
    if (featuredImageUrl) {
      console.log(`Received featuredImageUrl: ${featuredImageUrl}`);
      if (!featuredImageUrl.startsWith("http://") && !featuredImageUrl.startsWith("https://")) {
        console.error(`Invalid featured image URL format: ${featuredImageUrl}`);
        return res.status(400).json({
          error: "Invalid featured image URL",
          details: "Featured image URL must be a full HTTP/HTTPS URL. Ensure the image was successfully uploaded to Shopify before publishing.",
          suggestion: "Please re-upload the featured image and try again."
        });
      }
      try {
        new URL(featuredImageUrl);
      } catch {
        console.error(`Malformed featured image URL: ${featuredImageUrl}`);
        return res.status(400).json({
          error: "Invalid featured image URL format",
          details: "The featured image URL is malformed. Please re-upload the image."
        });
      }
    } else {
      console.warn("No featured image URL provided for publication");
    }
    const parsed = parseDocument(document);
    const validationWarnings = [];
    if (Array.isArray(parsed.metadata?.warnings) && parsed.metadata.warnings.length > 0) {
      validationWarnings.push(...parsed.metadata.warnings);
    }
    if (Array.isArray(parsed.metadata?.missingRequired) && parsed.metadata.missingRequired.length > 0) {
      validationWarnings.push(...parsed.metadata.missingRequired.map((s) => `Missing required section: ${s}`));
    }
    if (validationWarnings.length > 0) {
      console.warn("Publishing with validation warnings:", validationWarnings);
    }
    if (parsed.images.length > 0 && !imageUrls) {
      return res.status(202).json({
        success: false,
        requiresImageUpload: true,
        images: parsed.images.map((img) => ({
          keyword: img.keyword,
          sectionId: img.sectionId
        })),
        message: "Document contains images. Please upload images to Shopify first."
      });
    }
    let bodyHtml;
    let description = "";
    try {
      console.log("Generating styled HTML...");
      bodyHtml = generateStyledHTML(parsed, {
        includeSchema: true,
        includeImages: true,
        blogTitle: title,
        authorName: author,
        imageUrls: imageUrls || {},
        // CRITICAL: Don't pass featuredImageUrl here - we set it separately as article.image
        featuredImageUrl: void 0
      });
      if (!bodyHtml || bodyHtml.trim().length === 0) {
        console.error("CRITICAL: Generated HTML is empty");
        return res.status(500).json({
          error: "HTML generation failed",
          details: "The generated HTML is empty. Please check your document content."
        });
      }
      const section2 = parsed.sections.find((s) => s.id === "section2");
      if (section2) {
        description = section2.rawContent.replace(/\{img\}\s*([^\n\r{}]+)/gi, "").trim().substring(0, 500);
        console.log("Extracted description from section2:", description.substring(0, 100) + "...");
      }
      console.log("HTML generated successfully. Size:", bodyHtml.length, "characters");
    } catch (htmlError) {
      const htmlErrorMsg = htmlError instanceof Error ? htmlError.message : String(htmlError);
      console.error("Error generating HTML:", htmlErrorMsg);
      return res.status(500).json({
        error: "Failed to generate HTML from document",
        details: htmlErrorMsg
      });
    }
    console.log("Publishing with featured image URL:", featuredImageUrl);
    console.log("Body HTML length:", bodyHtml.length);
    const shopifyClient = getShopifyClient();
    console.log("Validating Shopify connection before publishing...");
    let isConnected = false;
    let connectionError = null;
    try {
      isConnected = await shopifyClient.validateConnection();
    } catch (err) {
      connectionError = err instanceof Error ? err : new Error(String(err));
      console.error("Connection validation error:", connectionError.message);
    }
    if (!isConnected) {
      const errorMessage = connectionError?.message || "Unable to connect to Shopify. Please check your credentials.";
      console.error("Publishing failed due to connection error:", errorMessage);
      return res.status(503).json({
        error: errorMessage,
        suggestion: "Please verify your Shopify credentials and try again."
      });
    }
    console.log("Retrieving blog ID...");
    let blogId;
    try {
      blogId = await shopifyClient.getBlogId();
      console.log(`Retrieved blog ID: ${blogId}`);
    } catch (err) {
      const blogError = err instanceof Error ? err.message : String(err);
      console.error("Failed to get blog ID:", blogError);
      return res.status(400).json({
        error: "Failed to retrieve blog information from Shopify",
        details: blogError,
        suggestion: "Please ensure your Shopify store has at least one blog and your access token has the necessary permissions."
      });
    }
    console.log("Publishing article to Shopify...");
    console.log("Featured image URL for publication:", featuredImageUrl ? "present" : "missing");
    console.log("Blog ID:", blogId);
    console.log("Article title:", title);
    console.log("Article tags:", tags?.length || 0);
    console.log("Article author:", author || "Blog Generator (default)");
    console.log("Body HTML size:", bodyHtml.length, "bytes");
    console.log("Description for content field:", description.substring(0, 50) + "...");
    let articleId;
    try {
      console.log("Sending article to Shopify REST API...");
      articleId = await shopifyClient.publishArticle(blogId, {
        title,
        bodyHtml: "",
        // Keep article body empty - content goes only to metafield
        author: author || "Blog Generator",
        publishedAt: publicationDate || (/* @__PURE__ */ new Date()).toISOString(),
        tags: tags || [],
        image: featuredImageUrl ? { src: featuredImageUrl } : void 0
      });
      console.log("✓ Article published successfully. Article ID:", articleId);
    } catch (publishError) {
      const publishErrorMsg = publishError instanceof Error ? publishError.message : String(publishError);
      console.error("✗ Article publication failed:", publishErrorMsg);
      console.error("Error details:", publishError);
      throw publishError;
    }
    let contentHtmlMetafieldSuccess = false;
    try {
      console.log("✓ Saving full HTML to metafield custom.content_html");
      await shopifyClient.updateArticleMetafield(
        blogId,
        articleId,
        "custom",
        "content_html",
        bodyHtml,
        // Save the full generated HTML
        "multi_line_text_field"
        // Use multi_line_text_field type instead of string
      );
      contentHtmlMetafieldSuccess = true;
      console.log("✓ Full HTML metafield saved successfully");
    } catch (error) {
      const metafieldErrorMsg = error instanceof Error ? error.message : String(error);
      console.error("✗ Error saving HTML to content_html metafield:", metafieldErrorMsg);
      console.log("Note: Article is already published. Metafield update is optional.");
    }
    let contentMetafieldSuccess = false;
    if (description) {
      try {
        console.log("✓ Saving description to metafield custom.content");
        await shopifyClient.updateArticleMetafield(
          blogId,
          articleId,
          "custom",
          "content",
          description,
          "string"
        );
        contentMetafieldSuccess = true;
        console.log("✓ Content metafield saved successfully");
      } catch (error) {
        const metafieldErrorMsg = error instanceof Error ? error.message : String(error);
        console.error("✗ Error saving description to content metafield:", metafieldErrorMsg);
      }
    }
    let relatedProductsMetafieldSuccess = false;
    if (relatedProducts && relatedProducts.length > 0) {
      try {
        console.log(`✓ Saving ${relatedProducts.length} related products to metafield (type: list.product_reference)`);
        const productGids = relatedProducts.map((p) => {
          let numericId = String(p.id);
          if (numericId.includes("/")) {
            numericId = numericId.split("/").pop() || numericId;
          }
          numericId = numericId.replace(/[^0-9]/g, "");
          return `gid://shopify/Product/${numericId}`;
        });
        const relatedProductsValue = JSON.stringify(productGids);
        console.log(`Metafield payload: ${productGids.length} product references, ${relatedProductsValue.length} bytes`);
        console.log("Product GIDs:", productGids.join(", "));
        await shopifyClient.updateArticleMetafield(
          blogId,
          articleId,
          "custom",
          "related_products",
          relatedProductsValue,
          "list.product_reference"
        );
        relatedProductsMetafieldSuccess = true;
        console.log("✓ Related products metafield updated successfully");
        console.log(`  - Namespace: custom`);
        console.log(`  - Key: related_products`);
        console.log(`  - Type: list.product_reference`);
        console.log(`  - Products: ${productGids.length}`);
      } catch (error) {
        const metafieldErrorMsg = error instanceof Error ? error.message : String(error);
        console.error("✗ Error saving related products to metafield:", metafieldErrorMsg);
        console.error("Full error object:", error);
        console.error("Note: Article is already published. Metafield update is optional.");
        console.error("This error does not affect the article publication.");
      }
    } else {
      console.log("No related products provided - skipping metafield update");
    }
    console.log("=== Publication complete ===");
    res.json({
      success: true,
      message: "Article published to Shopify successfully",
      articleId,
      metadata: parsed.metadata,
      featuredImageIncluded: !!featuredImageUrl,
      contentHtmlMetafieldSuccess,
      contentMetafieldSuccess,
      relatedProductsCount: relatedProducts?.length || 0,
      relatedProductsMetafieldSuccess,
      hasValidationWarnings: validationWarnings.length > 0,
      validationWarnings
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("=== Publication failed ===");
    console.error("Error message:", errorMessage);
    console.error("Full error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "N/A");
    const isFeaturedImageError = errorMessage.toLowerCase().includes("image") || errorMessage.toLowerCase().includes("url");
    const isAuthError = errorMessage.includes("Authentication failed") || errorMessage.includes("401") || errorMessage.includes("Access token");
    const isConnectionError = errorMessage.includes("Cannot connect") || errorMessage.includes("Failed to connect") || errorMessage.includes("ENOTFOUND");
    if (isAuthError) {
      console.error("✗ Authentication error detected");
      return res.status(401).json({
        error: "Shopify authentication failed",
        details: "Your Shopify API access token may be invalid or expired.",
        suggestion: "Please regenerate your Shopify API access token and update the SHOPIFY_ADMIN_ACCESS_TOKEN environment variable."
      });
    }
    if (isConnectionError) {
      console.error("✗ Connection error detected");
      return res.status(503).json({
        error: "Unable to connect to Shopify",
        details: errorMessage,
        suggestion: "Please verify your Shopify shop name is correct and check your network connectivity."
      });
    }
    if (isFeaturedImageError) {
      console.error("✗ Featured image error detected");
      return res.status(400).json({
        error: "Failed to set featured image on article",
        details: errorMessage,
        suggestion: "Ensure the featured image URL is valid, publicly accessible, and properly formatted"
      });
    }
    res.status(500).json({
      error: "Failed to publish to Shopify",
      details: errorMessage,
      suggestion: "Please check the server logs for more details. This could be a Shopify API issue, authentication issue, or document content issue."
    });
  }
};
const handleUploadImage = async (req, res) => {
  try {
    console.log("=== POST /api/upload-image request received ===");
    if (!req.file) {
      console.error("No file provided in request");
      return res.status(400).json({
        success: false,
        error: "No file provided. Please upload an image file."
      });
    }
    const keyword = (req.body?.keyword || "image").trim();
    console.log("File upload details:");
    console.log("  - Keyword:", keyword);
    console.log("  - Original filename:", req.file.originalname);
    console.log("  - MIME type:", req.file.mimetype);
    console.log("  - File size:", req.file.size, "bytes");
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimes.includes(req.file.mimetype)) {
      console.error("Invalid MIME type:", req.file.mimetype);
      return res.status(400).json({
        success: false,
        error: "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed."
      });
    }
    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      console.error("File too large:", req.file.size, "bytes");
      return res.status(400).json({
        success: false,
        error: `File too large (${Math.round(req.file.size / 1024 / 1024)}MB). Maximum size is 5MB.`
      });
    }
    const ext = req.file.originalname.split(".").pop() || "jpg";
    const filename = `${keyword.replace(/\s+/g, "-")}-${Date.now()}.${ext}`;
    console.log("Generated filename:", filename);
    try {
      const shopifyClient = getShopifyClient();
      console.log(`Starting Shopify image upload...`);
      const imageUrl = await shopifyClient.uploadImage(req.file.buffer, filename, keyword);
      console.log(`Successfully uploaded image. URL: ${imageUrl}`);
      res.json({
        success: true,
        imageUrl,
        keyword
      });
    } catch (shopifyError) {
      const shopifyErrorMsg = shopifyError instanceof Error ? shopifyError.message : String(shopifyError);
      console.error("Shopify upload error:", shopifyErrorMsg);
      console.error("Shopify error details:", shopifyError);
      return res.status(500).json({
        success: false,
        error: `Failed to upload image to Shopify: ${shopifyErrorMsg}`
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Image upload error:", errorMsg);
    console.error("Error stack:", error instanceof Error ? error.stack : "N/A");
    return res.status(500).json({
      success: false,
      error: `Unexpected server error: ${errorMsg}`
    });
  }
};
async function verifyPasswordAction(body) {
  if (!body || typeof body !== "object") {
    return { statusCode: 400, body: { error: "Invalid request body" } };
  }
  const { password } = body;
  if (!password) {
    return { statusCode: 400, body: { error: "Password is required" } };
  }
  const correctPassword = process.env.APP_PASSWORD || "AmiySEO";
  if (password === correctPassword) {
    return { statusCode: 200, body: { success: true } };
  }
  return { statusCode: 401, body: { error: "Invalid password" } };
}
const handleVerifyPassword = (req, res) => {
  verifyPasswordAction(req.body).then((r) => res.status(r.statusCode).json(r.body));
};
async function getProductsAction(query) {
  try {
    const limit = parseInt(query?.limit) || 250;
    console.log(`Fetching products with limit: ${limit}`);
    let shopifyClient;
    try {
      shopifyClient = getShopifyClient();
    } catch {
      return { statusCode: 503, body: { success: false, error: "Shopify not configured", details: "SHOPIFY_SHOP and SHOPIFY_ADMIN_ACCESS_TOKEN environment variables are required.", code: "SHOPIFY_NOT_CONFIGURED" } };
    }
    let isConnected = false;
    try {
      isConnected = await shopifyClient.validateConnection();
    } catch {
    }
    let products = await shopifyClient.getProducts(limit);
    if (!Array.isArray(products)) products = [];
    const validProducts = products.filter((p) => p && typeof p === "object" && p.id && p.title && p.handle);
    return { statusCode: 200, body: { success: true, products: validProducts } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    let code = "PRODUCTS_FETCH_ERROR";
    let userMessage = "Failed to fetch products from Shopify";
    if (/401|Unauthorized|authentication|credentials/i.test(errorMessage)) {
      code = "SHOPIFY_AUTH_ERROR";
      userMessage = "Shopify authentication failed. Invalid or expired access token.";
    } else if (/not configured|SHOPIFY_SHOP|environment variables/i.test(errorMessage)) {
      code = "SHOPIFY_NOT_CONFIGURED";
      userMessage = "Shopify credentials are not configured.";
    } else if (/timeout|AbortError|ECONNREFUSED|temporarily unavailable/i.test(errorMessage)) {
      code = "SHOPIFY_TIMEOUT";
      userMessage = "Shopify server is temporarily unavailable. Please try again later.";
    } else if (/not found|404/i.test(errorMessage)) {
      code = "SHOPIFY_STORE_NOT_FOUND";
      userMessage = "Shopify store could not be found. Check your shop name.";
    }
    return { statusCode: 200, body: { success: false, products: [], error: userMessage, details: errorMessage, code } };
  }
}
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
const getProductsHandler = async (req, res) => {
  res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  const q = req.query || {};
  getProductsAction(q).then((r) => res.status(r.statusCode).json(r.body));
};
const handleGetProducts = asyncHandler(getProductsHandler);
async function validateShopifyAction() {
  try {
    const shopifyClient = getShopifyClient();
    let isConnected = false;
    let connectionError = null;
    try {
      isConnected = await shopifyClient.validateConnection();
    } catch (err) {
      connectionError = err instanceof Error ? err : new Error(String(err));
    }
    if (!isConnected) {
      const errorDetails = connectionError?.message || "Shopify credentials are not properly configured.";
      return { statusCode: 503, body: { success: false, isConnected: false, error: "Cannot connect to Shopify", details: errorDetails, suggestion: "Please verify that SHOPIFY_SHOP and SHOPIFY_ADMIN_ACCESS_TOKEN are correctly set and that your Shopify API access token is still valid." } };
    }
    try {
      const blogId = await shopifyClient.getBlogId();
      return { statusCode: 200, body: { success: true, isConnected: true, message: "Shopify is properly configured", blogId } };
    } catch (blogError) {
      const blogErrorMessage = blogError instanceof Error ? blogError.message : "Cannot retrieve blog information";
      const blogIdFromEnv = process.env.BLOG_ID;
      if (blogIdFromEnv) {
        return { statusCode: 200, body: { success: true, isConnected: true, message: "Shopify is properly configured (using BLOG_ID from environment)", blogId: blogIdFromEnv } };
      }
      return { statusCode: 400, body: { success: false, isConnected: true, error: "Shopify is connected but no blog found", details: blogErrorMessage, suggestion: "Please ensure your Shopify store has at least one blog and that your access token has blog permissions. Alternatively, you can set the BLOG_ID environment variable directly." } };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("not configured")) {
      return { statusCode: 503, body: { success: false, isConnected: false, error: "Shopify is not configured", details: "Missing Shopify credentials", suggestion: "Please set SHOPIFY_SHOP and SHOPIFY_ADMIN_ACCESS_TOKEN environment variables." } };
    }
    return { statusCode: 500, body: { success: false, isConnected: false, error: "Failed to validate Shopify connection", details: errorMessage } };
  }
}
const handleValidateShopify = async (_req, res) => {
  validateShopifyAction().then((r) => res.status(r.statusCode).json(r.body));
};
async function diagnoseShopifyAction() {
  try {
    const diagnostics = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      status: "ok",
      issues: [],
      environment: {},
      connection: null
    };
    const shopName = process.env.SHOPIFY_SHOP;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    const apiVersion = process.env.SHOPIFY_API_VERSION || "2025-01";
    const blogId = process.env.BLOG_ID;
    diagnostics.environment = {
      SHOPIFY_SHOP: shopName ? `✓ Set (${shopName})` : "✗ NOT SET",
      SHOPIFY_ADMIN_ACCESS_TOKEN: accessToken ? `✓ Set (length: ${accessToken.length})` : "✗ NOT SET",
      SHOPIFY_API_VERSION: apiVersion,
      BLOG_ID: blogId ? `✓ Set (${blogId})` : "Not set (will be fetched)"
    };
    if (!shopName) {
      diagnostics.issues.push("SHOPIFY_SHOP environment variable is not set");
    } else if (!shopName.includes("myshopify.com")) {
      diagnostics.issues.push(`SHOPIFY_SHOP format may be incorrect: "${shopName}". Expected format: "myshop.myshopify.com"`);
    }
    if (!accessToken) {
      diagnostics.issues.push("SHOPIFY_ADMIN_ACCESS_TOKEN environment variable is not set");
    } else if (accessToken.length < 20) {
      diagnostics.issues.push(`SHOPIFY_ADMIN_ACCESS_TOKEN seems too short (${accessToken.length} chars). Access tokens are typically longer.`);
    }
    if (shopName && accessToken) {
      try {
        console.log(`[Diagnose] Attempting connection to ${shopName}`);
        const baseUrl = `https://${shopName}/admin/api/${apiVersion}`;
        console.log(`[Diagnose] Full URL: ${baseUrl}/shop.json`);
        const response = await fetch(`${baseUrl}/shop.json`, {
          headers: {
            "X-Shopify-Access-Token": accessToken
          }
        });
        console.log(`[Diagnose] Response status: ${response.status}`);
        if (response.ok) {
          const data = await response.json();
          diagnostics.connection = {
            status: "✓ Connected",
            shopName: data.shop?.name,
            url: `${baseUrl}/shop.json`,
            responseStatus: response.status
          };
          console.log(`[Diagnose] Successfully connected to shop: ${data.shop?.name}`);
        } else {
          const responseBody = await response.text();
          console.error(`[Diagnose] Connection failed. Status: ${response.status}, Body: ${responseBody}`);
          diagnostics.connection = {
            status: "✗ Connection Failed",
            url: `${baseUrl}/shop.json`,
            responseStatus: response.status,
            responseStatusText: response.statusText
          };
          if (response.status === 401) {
            diagnostics.issues.push("HTTP 401: Access token is invalid or expired. Please regenerate your Shopify API token.");
          } else if (response.status === 404) {
            diagnostics.issues.push(`HTTP 404: Shop not found. Please verify that SHOPIFY_SHOP="${shopName}" is correct.`);
          } else if (response.status === 429) {
            diagnostics.issues.push("HTTP 429: Rate limited by Shopify. Please try again later.");
          } else if (response.status >= 500) {
            diagnostics.issues.push(`HTTP ${response.status}: Shopify server error. Please try again later.`);
          } else {
            diagnostics.issues.push(`HTTP ${response.status}: ${response.statusText}`);
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[Diagnose] Network/fetch error: ${errorMsg}`);
        diagnostics.connection = {
          status: "✗ Connection Error",
          error: errorMsg
        };
        diagnostics.issues.push(`Network error: ${errorMsg}`);
      }
    }
    if (diagnostics.issues.length > 0) {
      diagnostics.status = "error";
    } else if (diagnostics.connection?.status?.includes("Connected")) {
      diagnostics.status = "ok";
    } else if (!shopName || !accessToken) {
      diagnostics.status = "error";
    }
    return { statusCode: 200, body: diagnostics };
  } catch (error) {
    return { statusCode: 500, body: { status: "error", error: error instanceof Error ? error.message : String(error), timestamp: (/* @__PURE__ */ new Date()).toISOString() } };
  }
}
const handleDiagnoseShopify = async (_req, res) => {
  diagnoseShopifyAction().then((r) => res.status(r.statusCode).json(r.body));
};
let envPath;
const envResult = (() => {
  try {
    const __dirname2 = path.dirname(fileURLToPath(import.meta.url));
    envPath = path.resolve(__dirname2, "../.env");
    return dotenv.config({ path: envPath });
  } catch {
    envPath = path.resolve(process.cwd(), ".env");
    return dotenv.config();
  }
})();
console.log("Dotenv loading:", {
  path: envPath,
  parsed: envResult.parsed ? Object.keys(envResult.parsed) : [],
  error: envResult.error?.message
});
if (envResult.parsed) {
  for (const [key, value] of Object.entries(envResult.parsed)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
console.log("Environment variables available:", {
  SHOPIFY_SHOP: process.env.SHOPIFY_SHOP || "NOT SET",
  SHOPIFY_ADMIN_ACCESS_TOKEN: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ? "***set***" : "NOT SET",
  SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION || "NOT SET",
  BLOG_ID: process.env.BLOG_ID || "NOT SET",
  APP_PASSWORD: process.env.APP_PASSWORD ? "***set***" : "NOT SET"
});
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed."));
    }
  }
});
function createServer() {
  const app2 = express__default();
  app2.use(cors());
  app2.use((req, _res, next) => {
    if (req.socket && !req.socket.readable && req.body && Buffer.isBuffer(req.body)) {
      req.socket.readable = true;
    }
    next();
  });
  app2.use(express__default.json());
  app2.use(express__default.urlencoded({ extended: true }));
  app2.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app2.post("/api/verify-password", handleVerifyPassword);
  app2.get("/api/demo", handleDemo);
  app2.post("/api/parse-document", handleParseDocument);
  app2.post("/api/generate-html", handleGenerateHTML);
  app2.post("/api/publish-shopify", handlePublishShopify);
  app2.get("/api/products", handleGetProducts);
  app2.get("/api/validate-shopify", handleValidateShopify);
  app2.get("/api/diagnose-shopify", handleDiagnoseShopify);
  app2.post("/api/upload-image", upload.single("file"), handleUploadImage);
  app2.get("/api/env-check", (_req, res) => {
    res.json({
      SHOPIFY_SHOP: process.env.SHOPIFY_SHOP || "NOT SET",
      SHOPIFY_ADMIN_ACCESS_TOKEN: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ? "***SET***" : "NOT SET",
      SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION || "NOT SET",
      BLOG_ID: process.env.BLOG_ID || "NOT SET",
      APP_PASSWORD: process.env.APP_PASSWORD ? "***SET***" : "NOT SET"
    });
  });
  app2.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal server error";
    res.status(status).json({
      success: false,
      error: message,
      details: void 0,
      code: "INTERNAL_SERVER_ERROR"
    });
  });
  return app2;
}
const app = createServer();
const port = process.env.PORT || 3e3;
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
//# sourceMappingURL=node-build.mjs.map
