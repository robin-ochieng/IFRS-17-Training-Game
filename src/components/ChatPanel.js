/**
 * ChatPanel Component - IFRS 17 RAG Chatbot Interface
 * 
 * A slide-out chat panel for interacting with the IFRS 17 AI assistant.
 */
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  Loader2, 
  AlertCircle,
  BookOpen,
  Calculator,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  Sparkles,
  FileText,
  TrendingUp,
  RefreshCw,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// API configuration - adjust based on your backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Formula Renderer Component
 * Renders formulas and calculations with special styling
 * Supports: LaTeX notation, equations, operators, variables, numbers, and multi-line formulas
 */
const FormulaRenderer = ({ content, className = '' }) => {
  
  // Parse LaTeX-style content and convert to readable format
  const parseLatex = (text) => {
    if (!text) return '';
    let parsed = text;
    
    // Remove \[ \] delimiters (display math)
    parsed = parsed.replace(/\\\[|\\\]/g, '');
    
    // First, convert all \text{...} to just the text (handle nested cases)
    let prevParsed = '';
    while (prevParsed !== parsed) {
      prevParsed = parsed;
      parsed = parsed.replace(/\\text\{([^{}]*)\}/g, '$1');
    }
    
    // Convert \left( and \right) to regular parentheses BEFORE handling fractions
    parsed = parsed.replace(/\\left\s*\(/g, '(');
    parsed = parsed.replace(/\\right\s*\)/g, ')');
    parsed = parsed.replace(/\\left\s*\[/g, '[');
    parsed = parsed.replace(/\\right\s*\]/g, ']');
    parsed = parsed.replace(/\\left\s*\\{/g, '{');
    parsed = parsed.replace(/\\right\s*\\}/g, '}');
    
    // Convert \times to ×
    parsed = parsed.replace(/\\times/g, ' × ');
    
    // Convert \div to ÷
    parsed = parsed.replace(/\\div/g, ' ÷ ');
    
    // Convert \pm to ±
    parsed = parsed.replace(/\\pm/g, '±');
    
    // Convert \sum to Σ
    parsed = parsed.replace(/\\sum/g, 'Σ');
    
    // Convert \cdot to ·
    parsed = parsed.replace(/\\cdot/g, '·');
    
    // Convert \geq \leq \neq
    parsed = parsed.replace(/\\geq/g, '≥');
    parsed = parsed.replace(/\\leq/g, '≤');
    parsed = parsed.replace(/\\neq/g, '≠');
    
    // Remove remaining backslashes before known commands
    parsed = parsed.replace(/\\[a-zA-Z]+/g, '');
    
    // Clean up extra whitespace but preserve structure
    parsed = parsed.replace(/\s+/g, ' ').trim();
    
    return parsed;
  };

  // Check if content contains LaTeX
  const hasLatex = (text) => {
    return /\\(text|frac|left|right|times|div|sum|cdot|\[|\])/.test(text);
  };

  // Extract content from nested braces, handling nested braces properly
  const extractBraceContent = (text, startIndex) => {
    let depth = 0;
    let start = -1;
    let end = -1;
    
    for (let i = startIndex; i < text.length; i++) {
      if (text[i] === '{') {
        if (depth === 0) start = i + 1;
        depth++;
      } else if (text[i] === '}') {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    
    if (start !== -1 && end !== -1) {
      return { content: text.slice(start, end), endIndex: end };
    }
    return null;
  };

  // Parse and render fraction specially
  const parseFraction = (text) => {
    const fracIndex = text.indexOf('\\frac');
    if (fracIndex === -1) return null;
    
    // Extract numerator
    const numResult = extractBraceContent(text, fracIndex + 5);
    if (!numResult) return null;
    
    // Extract denominator
    const denResult = extractBraceContent(text, numResult.endIndex + 1);
    if (!denResult) return null;
    
    return {
      before: text.slice(0, fracIndex),
      numerator: numResult.content,
      denominator: denResult.content,
      after: text.slice(denResult.endIndex + 1),
      fullMatch: text.slice(fracIndex, denResult.endIndex + 1)
    };
  };

  // Render a LaTeX formula with proper structure
  const renderLatexFormula = (text) => {
    // Check for fraction pattern
    const fracData = parseFraction(text);
    
    if (fracData) {
      const parsedBefore = parseLatex(fracData.before);
      const parsedNumerator = parseLatex(fracData.numerator);
      const parsedDenominator = parseLatex(fracData.denominator);
      const parsedAfter = parseLatex(fracData.after);
      
      return (
        <div className="flex flex-wrap items-center justify-start gap-1 py-2">
          {parsedBefore && <span className="mr-1">{renderFormulaPart(parsedBefore)}</span>}
          <div className="inline-flex flex-col items-center mx-2 bg-white rounded-lg px-3 py-1 shadow-sm border border-slate-200">
            <div className="px-2 py-1 text-sm font-medium text-center whitespace-nowrap">
              {renderFormulaPart(parsedNumerator)}
            </div>
            <div className="w-full h-0.5 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 rounded-full"></div>
            <div className="px-2 py-1 text-sm font-medium text-center whitespace-nowrap">
              {renderFormulaPart(parsedDenominator)}
            </div>
          </div>
          {parsedAfter && <span className="ml-1">{renderFormulaPart(parsedAfter)}</span>}
        </div>
      );
    }
    
    // No fraction, just parse and render
    return <div className="py-1">{renderFormulaPart(parseLatex(text))}</div>;
  };

  // Render a formula part with syntax highlighting
  const renderFormulaPart = (text) => {
    if (!text) return null;
    
    // Split by operators and special characters while keeping them
    const parts = text.split(/(\s*[=+\-×÷·±()[\]{}]\s*)/);
    
    return (
      <span className="inline-flex flex-wrap items-center gap-0.5">
        {parts.map((part, index) => {
          const trimmed = part.trim();
          if (!trimmed) return null;
          
          // Operators - blue and bold
          if (['=', '+', '-', '×', '÷', '·', '±'].includes(trimmed)) {
            return (
              <span key={index} className="text-blue-600 font-bold mx-1.5 text-lg">
                {trimmed}
              </span>
            );
          }
          
          // Parentheses/brackets - subtle
          if (['(', ')', '[', ']', '{', '}'].includes(trimmed)) {
            return (
              <span key={index} className="text-slate-400 font-light text-lg">
                {trimmed}
              </span>
            );
          }
          
          // Numbers - emerald
          if (/^[\d,.\s]+%?$/.test(trimmed) || /^\$?[\d,]+(\.\d+)?$/.test(trimmed)) {
            return (
              <span key={index} className="text-emerald-600 font-semibold">
                {trimmed}
              </span>
            );
          }
          
          // Known IFRS 17 terms - indigo with background
          const ifrs17Terms = [
            'CSM', 'RA', 'FCF', 'BEL', 'LIC', 'LRC', 'GMM', 'PAA', 'VFA', 'PV', 'NPV', 'DAC',
            'CSM Release', 'CSM Balance', 'Coverage Units Provided', 'Total Expected Coverage Units',
            'Risk Adjustment', 'Present Value', 'Fulfilment Cash Flows', 'Insurance Revenue',
            'Coverage Units', 'Expected Coverage Units'
          ];
          
          const matchedTerm = ifrs17Terms.find(term => 
            trimmed.toLowerCase() === term.toLowerCase() ||
            trimmed.toLowerCase().includes(term.toLowerCase())
          );
          
          if (matchedTerm) {
            return (
              <span key={index} className="text-indigo-700 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                {trimmed}
              </span>
            );
          }
          
          // Default text
          return (
            <span key={index} className="text-slate-700 font-medium">
              {trimmed}
            </span>
          );
        })}
      </span>
    );
  };

  // Parse regular formula content (non-LaTeX)
  const renderFormulaLine = (line, lineIndex) => {
    const trimmedLine = line.trim();
    const indentLevel = line.search(/\S|$/) / 2;
    
    // Skip empty lines
    if (!trimmedLine) return null;
    
    // Check for LaTeX content
    if (hasLatex(trimmedLine)) {
      return (
        <div key={lineIndex} className="my-1">
          {renderLatexFormula(trimmedLine)}
        </div>
      );
    }
    
    // Check if it's an equation line (contains =)
    const isEquation = trimmedLine.includes('=');
    
    if (isEquation) {
      return (
        <div 
          key={lineIndex} 
          className={`flex flex-wrap items-baseline gap-0.5 my-1 ${indentLevel > 0 ? 'ml-4' : ''}`}
        >
          {renderFormulaPart(trimmedLine)}
        </div>
      );
    }
    
    // Continuation lines (indented, often part of multi-line formula)
    if (indentLevel > 0 && (trimmedLine.startsWith('-') || trimmedLine.startsWith('+') || trimmedLine.startsWith('×'))) {
      return (
        <div key={lineIndex} className="flex flex-wrap items-baseline gap-0.5 ml-6 text-gray-700 my-0.5">
          {renderFormulaPart(trimmedLine)}
        </div>
      );
    }
    
    // Comment lines (// or #)
    if (trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) {
      return (
        <div key={lineIndex} className="text-slate-500 italic text-xs mt-2 flex items-center gap-1">
          <span className="text-amber-500">💡</span>
          <span>{trimmedLine.replace(/^\/\/\s*|^#\s*/, '')}</span>
        </div>
      );
    }
    
    // Where clause header
    if (trimmedLine.toLowerCase() === 'where:' || trimmedLine.toLowerCase() === 'where') {
      return (
        <div key={lineIndex} className="text-purple-700 font-semibold text-xs uppercase tracking-wider mt-3 mb-2 border-t border-slate-200 pt-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
          Where
        </div>
      );
    }
    
    // Variable definition (contains : for defining terms)
    if (trimmedLine.includes(':') && !trimmedLine.startsWith('http')) {
      const colonIndex = trimmedLine.indexOf(':');
      const label = trimmedLine.slice(0, colonIndex).trim();
      const value = trimmedLine.slice(colonIndex + 1).trim();
      return (
        <div key={lineIndex} className="flex items-start gap-3 text-sm ml-3 my-1.5 py-1 px-2 bg-slate-50 rounded">
          <span className="text-indigo-600 font-semibold min-w-fit whitespace-nowrap">{label}</span>
          <span className="text-slate-400">=</span>
          <span className="text-slate-700">{value}</span>
        </div>
      );
    }
    
    // Regular line
    return (
      <div key={lineIndex} className="text-gray-800 my-0.5">
        {renderFormulaPart(trimmedLine)}
      </div>
    );
  };

  const lines = content.split('\n');
  
  return (
    <div className={`formula-block my-4 ${className}`}>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {/* Formula Header */}
        <div className="bg-gradient-to-r from-slate-100 via-blue-100 to-indigo-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
          <div className="p-1 bg-blue-500 rounded-md">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Formula</span>
        </div>
        {/* Formula Content */}
        <div className="px-5 py-4 font-mono text-sm">
          {lines.map((line, idx) => renderFormulaLine(line, idx))}
        </div>
      </div>
    </div>
  );
};

/**
 * Simple Markdown Renderer Component
 * Renders markdown-style text with proper formatting including tables, code blocks, and formulas
 */
const MarkdownRenderer = ({ content, className = '' }) => {
  const renderMarkdown = (text) => {
    if (!text) return null;
    
    // First, extract and process code blocks AND LaTeX display math
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    const latexDisplayRegex = /\\\[([\s\S]*?)\\\]/g;
    
    const segments = [];
    let lastIndex = 0;
    let remaining = text;
    
    // Process the text to find code blocks and LaTeX
    while (remaining.length > 0) {
      const codeMatch = codeBlockRegex.exec(text.slice(lastIndex));
      const latexMatch = latexDisplayRegex.exec(text.slice(lastIndex));
      
      // Reset regex lastIndex
      codeBlockRegex.lastIndex = 0;
      latexDisplayRegex.lastIndex = 0;
      
      let nextMatch = null;
      let matchType = null;
      
      // Find which comes first
      if (codeMatch && latexMatch) {
        if (codeMatch.index <= latexMatch.index) {
          nextMatch = codeMatch;
          matchType = 'code';
        } else {
          nextMatch = latexMatch;
          matchType = 'latex';
        }
      } else if (codeMatch) {
        nextMatch = codeMatch;
        matchType = 'code';
      } else if (latexMatch) {
        nextMatch = latexMatch;
        matchType = 'latex';
      }
      
      if (nextMatch) {
        const absoluteIndex = lastIndex + nextMatch.index;
        
        // Add text before the match
        if (absoluteIndex > lastIndex) {
          segments.push({ type: 'text', content: text.slice(lastIndex, absoluteIndex) });
        }
        
        if (matchType === 'code') {
          const language = nextMatch[1].toLowerCase() || 'formula';
          segments.push({ type: 'code', language, content: nextMatch[2].trim() });
        } else {
          // LaTeX display math
          segments.push({ type: 'latex', content: nextMatch[1].trim() });
        }
        
        lastIndex = absoluteIndex + nextMatch[0].length;
        remaining = text.slice(lastIndex);
      } else {
        // No more matches
        if (lastIndex < text.length) {
          segments.push({ type: 'text', content: text.slice(lastIndex) });
        }
        break;
      }
    }
    
    // If no segments were added, add the whole text
    if (segments.length === 0) {
      segments.push({ type: 'text', content: text });
    }
    
    // Render each segment
    return segments.map((segment, segmentIndex) => {
      if (segment.type === 'code') {
        // Render code blocks with special formula styling
        const isFormula = ['formula', 'math', 'equation', ''].includes(segment.language);
        if (isFormula) {
          return <FormulaRenderer key={`code-${segmentIndex}`} content={segment.content} />;
        }
        // Regular code block
        return (
          <div key={`code-${segmentIndex}`} className="my-3">
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              {segment.language && (
                <div className="bg-gray-800 px-3 py-1 text-xs text-gray-400 border-b border-gray-700">
                  {segment.language}
                </div>
              )}
              <pre className="p-3 text-sm text-gray-100 overflow-x-auto">
                <code>{segment.content}</code>
              </pre>
            </div>
          </div>
        );
      }
      
      if (segment.type === 'latex') {
        // Render LaTeX display math as formula
        return <FormulaRenderer key={`latex-${segmentIndex}`} content={segment.content} />;
      }
      
      // Process regular text
      return <div key={`text-${segmentIndex}`}>{renderTextContent(segment.content)}</div>;
    });
  };
  
  // Process regular text content (non-code blocks)
  const renderTextContent = (text) => {
    // Split by lines to process headers, lists, and tables
    const lines = text.split('\n');
    const elements = [];
    let listItems = [];
    let inList = false;
    let listType = 'bullet'; // 'bullet' or 'numbered'
    let tableRows = [];
    let inTable = false;
    let tableHeaders = [];
    
    const flushList = () => {
      if (listItems.length > 0) {
        if (listType === 'numbered') {
          elements.push(
            <ol key={`list-${elements.length}`} className="list-decimal list-outside space-y-2 my-3 ml-5 text-gray-700">
              {listItems}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`list-${elements.length}`} className="list-disc list-outside space-y-1.5 my-2 ml-5 text-gray-700">
              {listItems}
            </ul>
          );
        }
        listItems = [];
      }
      inList = false;
      listType = 'bullet';
    };
    
    const flushTable = () => {
      if (tableRows.length > 0 || tableHeaders.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto my-3">
            <table className="min-w-full text-xs border-collapse border border-gray-200 rounded-lg overflow-hidden">
              {tableHeaders.length > 0 && (
                <thead className="bg-gray-100">
                  <tr>
                    {tableHeaders.map((header, i) => (
                      <th key={i} className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-800">
                        {renderInlineMarkdown(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {tableRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="border border-gray-200 px-3 py-2 text-gray-700">
                        {renderInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        tableHeaders = [];
      }
      inTable = false;
    };
    
    // Helper to check if a line is a table separator (|---|---|)
    const isTableSeparator = (line) => /^\|[\s\-:|]+\|$/.test(line.trim());
    
    // Helper to parse table row cells
    const parseTableCells = (line) => {
      return line.trim().slice(1, -1).split('|').map(cell => cell.trim());
    };
    
    // Helper to check if a line is a table row
    const isTableRow = (line) => {
      const trimmed = line.trim();
      return trimmed.startsWith('|') && trimmed.endsWith('|') && !isTableSeparator(line);
    };
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check for table rows
      if (isTableRow(line)) {
        flushList();
        const cells = parseTableCells(line);
        
        if (!inTable) {
          // This might be a header row
          inTable = true;
          tableHeaders = cells;
        } else {
          tableRows.push(cells);
        }
        return;
      }
      
      // Check for table separator (skip it, just marks transition from header to body)
      if (isTableSeparator(line)) {
        return;
      }
      
      // If we were in a table but hit a non-table line, flush the table
      if (inTable && !isTableRow(line) && !isTableSeparator(line)) {
        flushTable();
      }
      
      // Check for headers (#### first, then ###, ##, #)
      if (trimmedLine.startsWith('#### ')) {
        flushList();
        elements.push(
          <h5 key={index} className="font-bold text-gray-800 mt-4 mb-2 text-sm flex items-center gap-2 border-b border-gray-100 pb-1">
            <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
            {renderInlineMarkdown(trimmedLine.slice(5))}
          </h5>
        );
      } else if (trimmedLine.startsWith('### ')) {
        flushList();
        elements.push(
          <h4 key={index} className="font-bold text-gray-900 mt-4 mb-2 text-sm border-b border-gray-200 pb-1">
            {renderInlineMarkdown(trimmedLine.slice(4))}
          </h4>
        );
      } else if (trimmedLine.startsWith('## ')) {
        flushList();
        elements.push(
          <h3 key={index} className="font-bold text-gray-900 mt-4 mb-2 text-base border-b border-gray-200 pb-1">
            {renderInlineMarkdown(trimmedLine.slice(3))}
          </h3>
        );
      } else if (trimmedLine.startsWith('# ')) {
        flushList();
        elements.push(
          <h2 key={index} className="font-bold text-gray-900 mt-4 mb-2 text-lg border-b border-gray-300 pb-2">
            {renderInlineMarkdown(trimmedLine.slice(2))}
          </h2>
        );
      } 
      // Check for numbered lists (1. 2. etc)
      else if (/^\d+\.\s/.test(trimmedLine)) {
        if (!inList || listType !== 'numbered') {
          flushList();
          inList = true;
          listType = 'numbered';
        }
        const content = trimmedLine.replace(/^\d+\.\s/, '');
        const numberMatch = trimmedLine.match(/^(\d+)\./);
        const number = numberMatch ? numberMatch[1] : '1';
        listItems.push(
          <li key={index} className="text-gray-700 pl-1" value={parseInt(number)}>
            <span className="ml-1">{renderInlineMarkdown(content)}</span>
          </li>
        );
      }
      // Check for indented sub-items (starts with spaces then - or *)
      else if (/^\s{2,}[-*]\s/.test(line)) {
        const subContent = line.trim().slice(2);
        if (listItems.length > 0) {
          // Add as nested content to previous list item
          const lastItem = listItems[listItems.length - 1];
          listItems[listItems.length - 1] = (
            <li key={lastItem.key} className={lastItem.props.className} value={lastItem.props.value}>
              {lastItem.props.children}
              <div className="ml-4 mt-1 text-gray-600 text-sm flex items-start gap-1.5">
                <span className="text-gray-400">•</span>
                <span>{renderInlineMarkdown(subContent)}</span>
              </div>
            </li>
          );
        }
      }
      // Check for bullet lists (- or * but not table separator)
      else if ((trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) && !trimmedLine.startsWith('- |')) {
        if (!inList || listType !== 'bullet') {
          flushList();
          inList = true;
          listType = 'bullet';
        }
        listItems.push(
          <li key={index} className="text-gray-700 pl-1">
            {renderInlineMarkdown(trimmedLine.slice(2))}
          </li>
        );
      }
      // Check for checkmark items (✓)
      else if (trimmedLine.startsWith('- ✓') || trimmedLine.startsWith('✓')) {
        flushList();
        const checkContent = trimmedLine.replace(/^-?\s*✓\s*/, '');
        elements.push(
          <div key={index} className="flex items-start gap-2.5 my-1.5 py-1 px-2 bg-green-50 rounded-md border-l-2 border-green-400">
            <span className="text-green-600 font-bold text-sm">✓</span>
            <span className="text-gray-700 text-sm">{renderInlineMarkdown(checkContent)}</span>
          </div>
        );
      }
      // Check for warning items (⚠️)
      else if (trimmedLine.startsWith('⚠️') || trimmedLine.includes('⚠️')) {
        flushList();
        const warningContent = trimmedLine.replace(/^⚠️\s*/, '').replace('⚠️', '');
        elements.push(
          <div key={index} className="flex items-start gap-2.5 my-1.5 py-1.5 px-2 bg-amber-50 rounded-md border-l-2 border-amber-400">
            <span className="text-amber-500 text-sm">⚠️</span>
            <span className="text-gray-700 text-sm">{renderInlineMarkdown(warningContent)}</span>
          </div>
        );
      }
      // Check for checkbox items (☐)
      else if (trimmedLine.includes('☐')) {
        flushList();
        const checkboxContent = trimmedLine.replace(/☐\s*/, '');
        elements.push(
          <div key={index} className="flex items-center gap-2 my-1 text-gray-700 text-sm">
            <span className="w-4 h-4 border border-gray-300 rounded flex-shrink-0"></span>
            <span>{renderInlineMarkdown(checkboxContent)}</span>
          </div>
        );
      }
      // Check for horizontal rule
      else if (trimmedLine === '---' || trimmedLine === '***') {
        flushList();
        elements.push(<hr key={index} className="my-2 border-gray-200" />);
      }
      // Regular paragraph
      else if (trimmedLine) {
        flushList();
        elements.push(
          <p key={index} className="text-gray-700 my-1">
            {renderInlineMarkdown(trimmedLine)}
          </p>
        );
      }
      // Empty line
      else {
        flushList();
        if (elements.length > 0 && index < lines.length - 1) {
          elements.push(<div key={index} className="h-2" />);
        }
      }
    });
    
    flushList();
    flushTable();
    return elements;
  };
  
  // Render inline markdown (bold, italic, code, special symbols)
  const renderInlineMarkdown = (text) => {
    if (!text) return null;
    
    const parts = [];
    let remaining = text;
    let keyIndex = 0;
    
    while (remaining.length > 0) {
      // Bold: **text** or __text__
      const boldMatch = remaining.match(/\*\*(.+?)\*\*|__(.+?)__/);
      // Italic: *text* or _text_ (but not ** or __)
      const italicMatch = remaining.match(/(?<!\*)\*([^*]+?)\*(?!\*)|(?<!_)_([^_]+?)_(?!_)/);
      // Inline code: `code`
      const codeMatch = remaining.match(/`(.+?)`/);
      
      // Find the earliest match
      let earliestMatch = null;
      let earliestIndex = remaining.length;
      let matchType = null;
      
      if (boldMatch && boldMatch.index < earliestIndex) {
        earliestMatch = boldMatch;
        earliestIndex = boldMatch.index;
        matchType = 'bold';
      }
      if (italicMatch && italicMatch.index < earliestIndex) {
        earliestMatch = italicMatch;
        earliestIndex = italicMatch.index;
        matchType = 'italic';
      }
      if (codeMatch && codeMatch.index < earliestIndex) {
        earliestMatch = codeMatch;
        earliestIndex = codeMatch.index;
        matchType = 'code';
      }
      
      if (earliestMatch) {
        // Add text before the match
        if (earliestIndex > 0) {
          parts.push(remaining.slice(0, earliestIndex));
        }
        
        // Add the formatted element
        const content = earliestMatch[1] || earliestMatch[2];
        if (matchType === 'bold') {
          parts.push(<strong key={keyIndex++} className="font-semibold text-gray-900">{content}</strong>);
        } else if (matchType === 'italic') {
          parts.push(<em key={keyIndex++} className="italic text-gray-700">{content}</em>);
        } else if (matchType === 'code') {
          // Check if content looks like a formula or equation
          const isFormula = /[=+\-*/×÷]/.test(content) || 
            /^[A-Z]{2,}$/.test(content) || // Acronyms like CSM, RA
            ['CSM', 'RA', 'FCF', 'BEL', 'LIC', 'LRC', 'GMM', 'PAA', 'VFA'].some(term => content.toUpperCase().includes(term));
          
          if (isFormula) {
            // Formula-style inline code with enhanced styling
            parts.push(
              <code 
                key={keyIndex++} 
                className="bg-gradient-to-r from-blue-50 to-indigo-50 px-2 py-0.5 rounded text-xs font-mono text-indigo-700 border border-indigo-200 shadow-sm"
              >
                {content}
              </code>
            );
          } else {
            // Regular inline code
            parts.push(
              <code 
                key={keyIndex++} 
                className="bg-blue-50 px-1.5 py-0.5 rounded text-xs font-mono text-blue-700 border border-blue-100"
              >
                {content}
              </code>
            );
          }
        }
        
        remaining = remaining.slice(earliestIndex + earliestMatch[0].length);
      } else {
        parts.push(remaining);
        remaining = '';
      }
    }
    
    return parts.length > 0 ? parts : text;
  };
  
  return (
    <div className={`markdown-content text-sm ${className}`}>
      {renderMarkdown(content)}
    </div>
  );
};

/**
 * SummaryCard Component - TL;DR Summary for long responses
 * 
 * Displays a collapsible card with key points extracted from long responses.
 */
const SummaryCard = ({ summary, isMaximized }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Summary is an object with key_points array and word_count
  if (!summary || !summary.key_points || summary.key_points.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-2 mb-3 ml-7">
      <div 
        className={`
          bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 
          border border-blue-200 rounded-lg overflow-hidden
          shadow-sm
        `}
      >
        {/* Header - clickable to expand/collapse */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 
            bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500
            text-white hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600
            transition-all duration-200"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">TL;DR Summary</span>
            <span className="text-xs opacity-80">
              ({summary.word_count || '~'} words → {summary.key_points.length} key points)
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        
        {/* Content - expandable */}
        {isExpanded && (
          <div className="px-3 py-2">
            <ul className="space-y-1.5">
              {summary.key_points.map((point, idx) => (
                <li 
                  key={idx}
                  className={`
                    flex items-start gap-2 
                    ${isMaximized ? 'text-sm' : 'text-xs'} 
                    text-gray-700
                  `}
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full 
                    bg-gradient-to-r from-blue-500 to-indigo-500 
                    text-white text-xs font-bold 
                    flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const ChatPanel = ({ isOpen, onClose, userName, gameContext, pendingMessage, onPendingMessageConsumed }) => {
  // Create personalized welcome message with game context
  const getWelcomeMessage = () => {
    const displayName = userName ? userName.split(' ')[0] : '';
    const moduleName = gameContext?.currentModuleTitle;
    
    if (displayName && moduleName) {
      return `Hello ${displayName}! I see you're studying **${moduleName}**. I can help you understand concepts from this module or any other IFRS 17 topic. What would you like to know?`;
    } else if (displayName) {
      return `Hello ${displayName}! How can I assist you with IFRS 17 today?`;
    } else if (moduleName) {
      return `Hello! I see you're studying **${moduleName}**. How can I help you understand this topic?`;
    }
    return "Hello! How can I assist you with IFRS 17 today?";
  };

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: getWelcomeMessage(),
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Update welcome message when userName changes
  useEffect(() => {
    setMessages(prev => {
      const updated = [...prev];
      if (updated[0]?.id === 'welcome') {
        updated[0] = {
          ...updated[0],
          content: getWelcomeMessage()
        };
      }
      return updated;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName, gameContext?.currentModuleTitle]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Auto-send a message queued by the game (e.g. the Hint power-up).
  // isLoading is a dependency so a message that arrives mid-stream is sent
  // as soon as the current response finishes instead of being dropped.
  useEffect(() => {
    if (isOpen && pendingMessage?.text && !isLoading) {
      sendMessageWithContent(pendingMessage.text);
      onPendingMessageConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pendingMessage?.id, isLoading]);

  const sendMessageWithContent = async (content) => {
    const trimmed = (content || '').trim();
    if (!trimmed || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date()
    };

    const assistantMessageId = `assistant-${Date.now()}`;
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    // Add placeholder for streaming response
    setMessages(prev => [...prev, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      sources: [],
      timestamp: new Date(),
      isStreaming: true
    }]);

    try {
      // Build chat history from previous messages (exclude welcome message and current placeholder)
      const chatHistory = messages
        .filter(msg => msg.id !== 'welcome' && msg.role !== undefined && msg.content)
        .map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp?.toISOString?.() || new Date().toISOString()
        }));
      
      // Add the current user message to history
      chatHistory.push({
        role: 'user',
        content: userMessage.content,
        timestamp: userMessage.timestamp.toISOString()
      });

      // Build game context for API request
      const gameContextPayload = gameContext ? {
        current_module_index: gameContext.currentModuleIndex,
        current_module_title: gameContext.currentModuleTitle,
        current_module_icon: gameContext.currentModuleIcon,
        current_question_index: gameContext.currentQuestionIndex,
        current_question_text: gameContext.currentQuestionText,
        current_question_options: gameContext.currentQuestionOptions,
        current_question_explanation: gameContext.currentQuestionExplanation,
        is_module_completed: gameContext.isModuleCompleted,
        completed_modules: gameContext.completedModules,
        user_level: gameContext.userLevel,
        total_score: gameContext.totalScore
      } : null;

      const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_id: conversationId,
          include_sources: true,
          chat_history: chatHistory,
          game_context: gameContextPayload
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get conversation ID from headers
      const newConversationId = response.headers.get('X-Conversation-ID');
      if (newConversationId) {
        setConversationId(newConversationId);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Process streaming response
      const processStream = async () => {
        const streamState = { content: '', sources: [], suggestedTopics: [], summary: [] };
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'sources') {
                  streamState.sources = data.sources || [];
                  const currentSources = streamState.sources;
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, sources: currentSources } 
                      : msg
                  ));
                } else if (data.type === 'token') {
                  streamState.content += data.content;
                  const currentContent = streamState.content;
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: currentContent } 
                      : msg
                  ));
                } else if (data.type === 'summary') {
                  // Handle TL;DR summary for long responses
                  streamState.summary = data.summary || [];
                  const currentSummary = streamState.summary;
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, summary: currentSummary } 
                      : msg
                  ));
                } else if (data.type === 'suggested_topics') {
                  streamState.suggestedTopics = data.topics || [];
                  const currentTopics = streamState.suggestedTopics;
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, suggestedTopics: currentTopics } 
                      : msg
                  ));
                } else if (data.type === 'done') {
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, isStreaming: false } 
                      : msg
                  ));
                } else if (data.type === 'error') {
                  throw new Error(data.message);
                }
              } catch (parseError) {
                // Skip invalid JSON lines
                if (line.slice(6).trim() && !line.includes('{')) {
                  console.warn('Failed to parse SSE data:', line);
                }
              }
            }
          }
        }
      };

      await processStream();

    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to get response. Please check if the backend is running.');
      
      // Update the streaming message to show error
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { 
              ...msg, 
              role: 'error',
              content: 'Sorry, I couldn\'t connect to the server. Please make sure the backend is running and try again.',
              isStreaming: false
            } 
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = () => sendMessageWithContent(inputValue);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Quick Action Configuration
  const quickActionCategories = useMemo(() => ([
    {
      title: 'Getting Started',
      icon: BookOpen,
      iconColor: 'text-blue-500',
      hoverBorder: 'hover:border-blue-300',
      hoverBg: 'hover:bg-blue-50',
      hoverText: 'hover:text-blue-700',
      hoverIcon: 'group-hover:text-blue-500',
      actions: [
        { text: 'What is IFRS 17?', icon: HelpCircle },
        { text: 'Key concepts overview', icon: Lightbulb },
        { text: 'Why was IFRS 17 introduced?', icon: FileText }
      ]
    },
    {
      title: 'Measurement Models',
      icon: Calculator,
      iconColor: 'text-emerald-500',
      hoverBorder: 'hover:border-emerald-300',
      hoverBg: 'hover:bg-emerald-50',
      hoverText: 'hover:text-emerald-700',
      hoverIcon: 'group-hover:text-emerald-500',
      actions: [
        { text: 'Explain the GMM (Building Block Approach)', icon: ArrowRight },
        { text: 'What is PAA and when to use it?', icon: ArrowRight },
        { text: 'Explain the Variable Fee Approach', icon: ArrowRight }
      ]
    },
    {
      title: 'Key Components',
      icon: Sparkles,
      iconColor: 'text-purple-500',
      hoverBorder: 'hover:border-purple-300',
      hoverBg: 'hover:bg-purple-50',
      hoverText: 'hover:text-purple-700',
      hoverIcon: 'group-hover:text-purple-500',
      actions: [
        { text: 'How is CSM calculated?', icon: Calculator },
        { text: 'What is Risk Adjustment?', icon: TrendingUp },
        { text: 'Explain contract boundaries', icon: FileText }
      ]
    }
  ]), []);

  // Context-aware follow-up suggestions based on last assistant response
  const getFollowUpSuggestions = useMemo(() => {
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant' && m.id !== 'welcome');
    if (!lastAssistantMessage || !lastAssistantMessage.content) return [];
    
    const content = lastAssistantMessage.content.toLowerCase();
    const suggestions = [];
    
    // Topic-specific follow-ups
    if (content.includes('csm') || content.includes('contractual service margin')) {
      suggestions.push(
        { text: 'How is CSM amortized?', icon: TrendingUp },
        { text: 'CSM for reinsurance contracts?', icon: RefreshCw }
      );
    }
    if (content.includes('gmm') || content.includes('building block') || content.includes('general measurement')) {
      suggestions.push(
        { text: 'Components of fulfilment cash flows', icon: Calculator },
        { text: 'When to use GMM vs PAA?', icon: HelpCircle }
      );
    }
    if (content.includes('paa') || content.includes('premium allocation')) {
      suggestions.push(
        { text: 'PAA eligibility criteria', icon: FileText },
        { text: 'PAA vs GMM comparison', icon: TrendingUp }
      );
    }
    if (content.includes('vfa') || content.includes('variable fee')) {
      suggestions.push(
        { text: 'VFA eligibility requirements', icon: FileText },
        { text: 'How VFA handles investment returns', icon: TrendingUp }
      );
    }
    if (content.includes('risk adjustment')) {
      suggestions.push(
        { text: 'Risk adjustment calculation methods', icon: Calculator },
        { text: 'Confidence level disclosure', icon: FileText }
      );
    }
    if (content.includes('transition') || content.includes('ifrs 4')) {
      suggestions.push(
        { text: 'Full retrospective approach', icon: ArrowRight },
        { text: 'Modified retrospective approach', icon: ArrowRight }
      );
    }
    if (content.includes('reinsurance')) {
      suggestions.push(
        { text: 'Reinsurance held vs issued', icon: RefreshCw },
        { text: 'Loss recovery component', icon: TrendingUp }
      );
    }
    
    // Generic follow-ups if no specific topic detected
    if (suggestions.length === 0) {
      suggestions.push(
        { text: 'Can you give an example?', icon: Lightbulb },
        { text: 'Tell me more about this', icon: ArrowRight }
      );
    }
    
    // Always add these generic options
    suggestions.push(
      { text: 'How does this affect disclosures?', icon: FileText }
    );
    
    return suggestions.slice(0, 4); // Limit to 4 suggestions
  }, [messages]);

  if (!isOpen) return null;

  // Toggle maximize state
  const toggleMaximize = () => {
    setIsMaximized(prev => !prev);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-end p-0 sm:p-4 md:p-6">
      {/* Backdrop with blur effect */}
      <div 
        className={`fixed inset-0 transition-all duration-300 ${
          isMaximized 
            ? 'bg-black/40 backdrop-blur-sm' 
            : 'bg-black/20'
        }`}
        onClick={isMaximized ? undefined : onClose}
      />
      
      {/* Chat Panel - Responsive and animatable */}
      <div 
        className={`
          fixed bg-white shadow-2xl flex flex-col z-[61]
          transition-all duration-500 ease-out
          ${isMaximized 
            ? 'inset-2 sm:inset-4 md:inset-6 lg:inset-8 rounded-2xl animate-maximize' 
            : 'bottom-20 right-4 sm:right-6 w-[calc(100%-2rem)] sm:w-full max-w-md h-[500px] sm:h-[600px] max-h-[70vh] rounded-2xl animate-slide-up'
          }
        `}
        style={{
          // Smooth transform for maximize animation
          transform: isMaximized ? 'scale(1)' : 'scale(1)',
        }}
      >
        {/* Header */}
        <div className={`
          flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl
          transition-all duration-300
          ${isMaximized ? 'p-4 md:p-5' : 'p-4'}
        `}>
          <div className="flex items-center space-x-3">
            <div className={`
              bg-white/20 rounded-full flex items-center justify-center
              transition-all duration-300
              ${isMaximized ? 'w-12 h-12' : 'w-10 h-10'}
            `}>
              <Bot className={`text-white transition-all duration-300 ${isMaximized ? 'w-7 h-7' : 'w-6 h-6'}`} />
            </div>
            <div>
              <h2 className={`text-white font-semibold transition-all duration-300 ${isMaximized ? 'text-lg md:text-xl' : ''}`}>
                IFRS 17 Assistant
              </h2>
              {/* Show current module context or default tagline */}
              {gameContext?.currentModuleTitle ? (
                <p className={`text-blue-100 transition-all duration-300 ${isMaximized ? 'text-sm' : 'text-xs'} flex items-center gap-1`}>
                  <span className="opacity-80">📚</span>
                  <span className="truncate max-w-[150px]">{gameContext.currentModuleTitle}</span>
                </p>
              ) : (
                <p className={`text-blue-100 transition-all duration-300 ${isMaximized ? 'text-sm' : 'text-xs'}`}>
                  Powered by Kenbright AI
                </p>
              )}
            </div>
          </div>
          
          {/* Header Action Buttons */}
          <div className="flex items-center space-x-1">
            {/* Maximize/Minimize Button */}
            <button
              onClick={toggleMaximize}
              className="group relative p-2 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
              title={isMaximized ? 'Minimize' : 'Maximize'}
            >
              {isMaximized ? (
                <Minimize2 className="w-5 h-5 text-white transition-transform duration-200 group-hover:scale-110" />
              ) : (
                <Maximize2 className="w-5 h-5 text-white transition-transform duration-200 group-hover:scale-110" />
              )}
              {/* Tooltip */}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                {isMaximized ? 'Minimize' : 'Expand view'}
              </span>
            </button>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="group relative p-2 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
              title="Close"
            >
              <X className="w-5 h-5 text-white transition-transform duration-200 group-hover:rotate-90" />
              {/* Tooltip */}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                Close
              </span>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className={`
          flex-1 overflow-y-auto bg-gray-50 transition-all duration-300
          ${isMaximized ? 'p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6' : 'p-4 space-y-4'}
        `}>
          {/* Maximized mode: Center content for better readability */}
          <div className={isMaximized ? 'max-w-4xl mx-auto w-full' : ''}>
            {messages.map((message, msgIndex) => (
              <div key={message.id} className={isMaximized ? 'mb-4 md:mb-6' : 'mb-4'}>
                <div
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      rounded-2xl transition-all duration-300
                      ${isMaximized 
                        ? 'max-w-[80%] lg:max-w-[70%] p-4 md:p-5' 
                        : 'max-w-[85%] p-3'
                      }
                      ${message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : message.role === 'error'
                        ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-md'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                      }
                    `}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === 'assistant' && (
                        <Bot className={`text-blue-600 mt-0.5 flex-shrink-0 transition-all duration-300 ${isMaximized ? 'w-6 h-6' : 'w-5 h-5'}`} />
                      )}
                      {message.role === 'error' && (
                        <AlertCircle className={`text-red-500 mt-0.5 flex-shrink-0 transition-all duration-300 ${isMaximized ? 'w-6 h-6' : 'w-5 h-5'}`} />
                      )}
                      <div className="flex-1">
                        {message.role === 'assistant' ? (
                          <MarkdownRenderer content={message.content} className={isMaximized ? 'text-base' : ''} />
                        ) : (
                          <p className={`whitespace-pre-wrap transition-all duration-300 ${isMaximized ? 'text-base' : 'text-sm'}`}>{message.content}</p>
                        )}
                      </div>
                    </div>
                  <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              {/* TL;DR Summary Card - shown for long assistant responses */}
              {message.role === 'assistant' && 
               message.summary && 
               !message.isStreaming && (
                <SummaryCard summary={message.summary} isMaximized={isMaximized} />
              )}
              
              {/* Suggested Topics - shown after assistant messages with topics */}
              {message.role === 'assistant' && 
               message.suggestedTopics && 
               message.suggestedTopics.length > 0 && 
               !message.isStreaming && (
                <div className="mt-3 ml-7">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Lightbulb className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                      You might also want to know about
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {message.suggestedTopics.map((topic, topicIdx) => (
                      <button
                        key={topicIdx}
                        onClick={() => {
                          setInputValue(topic.question);
                          setTimeout(() => inputRef.current?.focus(), 100);
                        }}
                        className="group flex items-center gap-1.5 text-xs px-2.5 py-1.5 
                          bg-gradient-to-r from-blue-50 to-indigo-50 
                          border border-blue-200 text-blue-700 rounded-full
                          hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300
                          hover:shadow-sm transition-all duration-200"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:bg-blue-500"></span>
                        <span className="font-medium">{topic.topic}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 shadow-sm border border-gray-100 rounded-2xl rounded-bl-md p-3">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
          </div> {/* Close max-w-4xl wrapper */}
        </div>

        {/* Quick Actions - Initial Suggestions (shown when starting conversation) */}
        {messages.length <= 2 && !isLoading && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <p className="text-xs font-medium text-gray-600">Quick Actions</p>
            </div>
            
            {/* Category-based Quick Actions */}
            <div className="space-y-3 max-h-[180px] overflow-y-auto scrollbar-thin">
              {quickActionCategories.map((category, catIdx) => (
                <div key={catIdx}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <category.icon className={`w-3 h-3 ${category.iconColor}`} />
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                      {category.title}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {category.actions.map((action, actionIdx) => (
                      <button
                        key={actionIdx}
                        onClick={() => {
                          setInputValue(action.text);
                          setTimeout(() => inputRef.current?.focus(), 100);
                        }}
                        className={`group flex items-center gap-1.5 text-xs px-2.5 py-1.5 
                          bg-white border border-gray-200 text-gray-700 rounded-lg
                          ${category.hoverBorder} ${category.hoverBg} 
                          ${category.hoverText} transition-all duration-200
                          shadow-sm hover:shadow`}
                      >
                        <action.icon className={`w-3 h-3 text-gray-400 ${category.hoverIcon} transition-colors`} />
                        <span className="truncate max-w-[140px]">{action.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Context-Aware Follow-up Suggestions (shown after responses) */}
        {messages.length > 2 && !isLoading && getFollowUpSuggestions.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Follow-up Questions</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {getFollowUpSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputValue(suggestion.text);
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }}
                  className="group flex items-center gap-1.5 text-xs px-2.5 py-1.5 
                    bg-amber-50 border border-amber-200 text-amber-800 rounded-lg
                    hover:bg-amber-100 hover:border-amber-300 
                    transition-all duration-200 shadow-sm hover:shadow"
                >
                  <suggestion.icon className="w-3 h-3 text-amber-500 group-hover:text-amber-600 transition-colors" />
                  <span className="truncate max-w-[160px]">{suggestion.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className={`
          border-t border-gray-200 bg-white rounded-b-2xl transition-all duration-300
          ${isMaximized ? 'p-4 md:p-5 lg:p-6' : 'p-4'}
        `}>
          {/* Maximized mode: Center the input */}
          <div className={isMaximized ? 'max-w-4xl mx-auto' : ''}>
            {error && (
              <div className="mb-2 p-2 bg-red-50 text-red-600 text-xs rounded-lg flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </div>
            )}
            <div className="flex items-center space-x-2 md:space-x-3">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about IFRS 17..."
                className={`
                  flex-1 bg-gray-100 rounded-xl border-0 
                  focus:ring-2 focus:ring-blue-500 focus:bg-white 
                  transition-all duration-300
                  ${isMaximized ? 'p-3 md:p-4 text-sm md:text-base' : 'p-3 text-sm'}
                `}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={`
                  rounded-xl transition-all duration-200 
                  hover:scale-105 active:scale-95
                  ${isMaximized ? 'p-3 md:p-4' : 'p-3'}
                  ${inputValue.trim() && !isLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isLoading ? (
                  <Loader2 className={`animate-spin ${isMaximized ? 'w-5 h-5 md:w-6 md:h-6' : 'w-5 h-5'}`} />
                ) : (
                  <Send className={`${isMaximized ? 'w-5 h-5 md:w-6 md:h-6' : 'w-5 h-5'}`} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes maximize {
          from {
            opacity: 0.8;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-maximize {
          animation: maximize 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default ChatPanel;
