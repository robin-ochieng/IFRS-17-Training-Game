# IFRS 17 Chatbot Test Questions

This document contains sample questions to test all the chatbot enhancements implemented. Use these questions to verify each feature is working correctly.

---

## 1. Conversation Memory Tests

These questions test if the chatbot remembers previous context.

### Test Sequence 1: Follow-up Questions
1. **First Question**: "What is the Contractual Service Margin?"
2. **Follow-up**: "How is it calculated?"
3. **Follow-up**: "Can you give me an example?"

**Expected**: The chatbot should understand "it" refers to CSM without needing to re-specify.

### Test Sequence 2: Pronoun Resolution
1. **First**: "Explain the General Measurement Model"
2. **Follow-up**: "What are its main components?"
3. **Follow-up**: "How does this differ from PAA?"

**Expected**: "its" and "this" should resolve to GMM context.

### Test Sequence 3: Topic Continuation
1. **First**: "What is the Risk Adjustment?"
2. **Follow-up**: "What methods can be used to calculate it?"
3. **Follow-up**: "Which method is most common?"

---

## 2. Quick Action Button Tests

Click the suggested quick action buttons and verify appropriate responses.

### Category: Getting Started
- "What is IFRS 17?"
- "Key changes from IFRS 4"
- "When did IFRS 17 become effective?"

### Category: Core Concepts
- "Explain the measurement models"
- "What is the CSM?"
- "Define insurance contract"

### Category: Calculations
- "How to calculate CSM?"
- "Risk Adjustment methods"
- "Discount rate determination"

### Category: Practical Application
- "Transition approaches"
- "Disclosure requirements"
- "Reinsurance accounting"

---

## 3. Structured Response Template Tests

These questions should trigger specific response formats.

### 3.1 Definition Questions (Should show Definition → Context → Key Characteristics → Example)
- "What is the Contractual Service Margin?"
- "Define fulfilment cash flows"
- "What does BEL stand for in IFRS 17?"
- "Explain the liability for remaining coverage"

### 3.2 Calculation Questions (Should show Formula → Steps → Worked Example)
- "How do you calculate the CSM?"
- "What is the formula for Risk Adjustment?"
- "How are coverage units determined?"
- "Calculate the present value of future cash flows"

### 3.3 Comparison Questions (Should show Overview → Side-by-Side Table → Key Differences)
- "What's the difference between GMM and PAA?"
- "Compare VFA and GMM approaches"
- "How does IFRS 17 differ from IFRS 4?"
- "Reinsurance held vs direct insurance differences"

### 3.4 Process Questions (Should show Overview → Step-by-Step → Tips)
- "How do I apply the Premium Allocation Approach?"
- "What are the steps for initial recognition?"
- "How to transition to IFRS 17?"
- "Process for unlocking the CSM"

### 3.5 List Questions (Should show organized bullet points or numbered list)
- "What are the components of fulfilment cash flows?"
- "List the disclosure requirements"
- "What are the measurement models under IFRS 17?"
- "Name the eligibility criteria for PAA"

### 3.6 Eligibility Questions (Should show Criteria Checklist → Decision Tree → Examples)
- "When can I use the PAA approach?"
- "What contracts qualify for VFA?"
- "Eligibility criteria for simplified approach"
- "Which contracts are exempt from IFRS 17?"

---

## 4. Visual Hierarchy Tests

Verify these formatting elements render correctly.

### 4.1 Headers Test
Ask: "Give me a comprehensive overview of IFRS 17"

**Expected**: Multiple header levels (##, ###, ####) with accent bars and proper styling.

### 4.2 Bullet & Numbered Lists Test
Ask: "What are the 5 key steps in applying IFRS 17?"

**Expected**: Numbered list with proper indentation and sub-bullets.

### 4.3 Checkmarks & Warnings Test
Ask: "What should I verify before using the PAA approach?"

**Expected**: ✓ checkmarks for criteria met, ⚠️ warnings for considerations.

### 4.4 Table Test
Ask: "Compare the three measurement approaches in IFRS 17"

**Expected**: Properly formatted comparison table with headers and alternating row colors.

---

## 5. Code/Formula Formatting Tests

These questions should trigger formula blocks with syntax highlighting.

### 5.1 Basic Formula Test
Ask: "What is the CSM formula?"

**Expected**: Formula block with:
- Calculator icon header
- Blue operators (=, -, +)
- Indigo IFRS terms (CSM, FCF, RA)
- Gradient background

### 5.2 Multi-line Formula Test
Ask: "Show me the complete calculation for fulfilment cash flows"

**Expected**:
```
FCF = Present Value of Future Cash Inflows
      - Present Value of Future Cash Outflows
      + Risk Adjustment
```

### 5.3 Formula with Variables Test
Ask: "Explain the insurance revenue calculation with all variables"

**Expected**: Formula plus "Where:" section with variable definitions:
- Variable names in indigo
- Definitions properly aligned

### 5.4 Worked Example Test
Ask: "Calculate the CSM for a contract with premium of $100,000 and expected claims of $70,000"

**Expected**:
- Formula block
- Step-by-step calculation with highlighted numbers (emerald)
- Final result emphasized

### 5.5 Inline Formula Test
Ask: "What does CSM = PV(Premiums) - PV(Claims) - RA mean?"

**Expected**: Inline code with gradient styling for `CSM`, `PV(Premiums)`, etc.

---

## 6. Proactive Assistance / Suggested Topics Tests

After receiving a response, verify suggested follow-up topics appear.

### 6.1 Topic Suggestions Test
Ask: "What is the CSM?"

**Expected**: After response, see suggested topics like:
- "CSM amortization"
- "Loss component"
- "Insurance revenue recognition"

### 6.2 Related Topics Test
Ask: "Explain the General Measurement Model"

**Expected**: Suggested topics should include:
- "Building Block Approach"
- "Fulfilment Cash Flows"
- "Coverage units"

### 6.3 Deep Dive Suggestions
Ask: "What is Risk Adjustment?"

**Expected**: Follow-up suggestions like:
- "Confidence level approach"
- "Cost of capital method"
- "Risk Adjustment disclosure"

---

## 7. Combined Feature Tests

These complex questions test multiple features together.

### 7.1 Full Response Test
Ask: "I need to understand the CSM calculation for my implementation project. Can you explain the formula, give an example, and tell me what to watch out for?"

**Expected**:
- Structured headers (Visual Hierarchy)
- Formula block with highlighting (Code/Formula)
- Numbered calculation steps
- Warning items for pitfalls
- Suggested follow-up topics

### 7.2 Conversation + Formula Test
1. Ask: "What is the insurance revenue formula?"
2. Follow-up: "Can you show me a worked example?"
3. Follow-up: "What if the CSM becomes negative?"

**Expected**:
- Memory of previous context
- Progressive formula explanations
- Related topic about loss component

### 7.3 Comparison + Tables + Formulas
Ask: "Compare how CSM is calculated under GMM vs VFA, with formulas for each"

**Expected**:
- Comparison table
- Two formula blocks (one for GMM, one for VFA)
- Key differences highlighted

---

## 8. Edge Case Tests

### 8.1 Ambiguous Question
Ask: "Tell me about the margin"

**Expected**: Should clarify or assume CSM, potentially ask for clarification.

### 8.2 Very Broad Question
Ask: "Explain everything about IFRS 17"

**Expected**: Organized response with multiple sections, not overwhelming.

### 8.3 Technical Jargon
Ask: "What's the PAA LRC calculation when onerous?"

**Expected**: Properly handle abbreviations and technical terms.

### 8.4 Non-IFRS 17 Question
Ask: "What is the capital of France?"

**Expected**: Politely redirect to IFRS 17 topics or indicate out of scope.

---

## 9. Quick Reference Card

| Feature | Test Question | What to Look For |
|---------|---------------|------------------|
| Memory | "How is it calculated?" (after CSM question) | Understands context |
| Quick Actions | Click any button | Sends appropriate question |
| Definition Template | "What is [term]?" | 4-section structured response |
| Calculation Template | "How to calculate [X]?" | Formula + steps + example |
| Comparison Template | "Difference between X and Y?" | Table comparison |
| Formula Block | "Show me the formula for..." | Highlighted code block |
| Inline Formula | Mention `CSM = X - Y` | Gradient inline code |
| Checkmarks | Criteria questions | ✓ styled items |
| Warnings | Risk questions | ⚠️ styled items |
| Tables | Comparison questions | Formatted table |
| Suggested Topics | Any question | Topics below response |

---

## 10. Game Context Awareness Tests

These tests verify the chatbot understands and uses the current game state.

### 10.1 Module-Aware Welcome Message
1. Navigate to a specific module (e.g., "Contractual Service Margin")
2. Open the chatbot

**Expected**: Welcome message should mention the current module:
- "I see you're studying **Contractual Service Margin**"
- Module-specific initial suggestions

### 10.2 Module Context Header
1. Start playing any module
2. Open the chatbot

**Expected**: Header should show current module with 📚 icon:
- "📚 Studying: [Module Name]"

### 10.3 "Need Help?" Button from Question Panel
1. Start a question in any module
2. Click the "Need Help?" button on the question panel

**Expected**: 
- Chatbot should open automatically
- Context about the current question should be available

### 10.4 Module-Specific Suggestions
1. Open chatbot while studying "Insurance Revenue"
2. Check the initial suggested topics

**Expected**: Suggestions should be relevant to Insurance Revenue module:
- Topics about revenue recognition
- CSM amortization
- Coverage units

### 10.5 Question Context in Responses
1. While on a specific game question, ask: "Can you help me with this?"
2. Or: "I don't understand this question"

**Expected**: 
- Response should be aware of the current module
- May provide hints related to the game question topic

---

## 11. Summary Cards (TL;DR) Tests

These tests verify the TL;DR summary feature for long responses.

### 11.1 Long Response Summary
Ask: "Give me a comprehensive explanation of the Contractual Service Margin, including how it's calculated, when it's recognized, how it's amortized, and what happens when a contract becomes onerous."

**Expected**: 
- Long detailed response
- Summary card appears above response with:
  - Gradient header (blue → purple)
  - "TL;DR Summary" title with ✨ icon
  - Word count and key points count
  - 2-4 numbered bullet points
  - Expand/collapse toggle

### 11.2 Summary Card Collapse/Expand
1. Get a long response that shows a summary card
2. Click the card header

**Expected**:
- Card should collapse (hide key points)
- Click again to expand
- ChevronUp/ChevronDown icon should toggle

### 11.3 Short Response - No Summary
Ask: "What does CSM stand for?"

**Expected**:
- Brief response
- NO summary card (response too short)

### 11.4 Summary Key Points Quality
Ask: "Explain the three measurement approaches under IFRS 17 in detail with their eligibility criteria and when to use each one."

**Expected Summary Points**:
- Should capture the essence of GMM, PAA, VFA
- Each point should be concise (max 15 words)
- Points should be actionable/memorable

### 11.5 Summary with Technical Content
Ask: "Explain the complete process for calculating fulfilment cash flows, including all components, discount rates, and risk adjustment."

**Expected**:
- Summary should capture key components
- Technical terms should be preserved in summary
- Formulas mentioned should be referenced

---

## 12. Dynamic Follow-up Questions Tests

These tests verify follow-up questions are contextual and not static.

### 12.1 Context-Specific Follow-ups
Ask: "How is the CSM amortized over the coverage period?"

**Expected Follow-ups** (should be specific to amortization):
- Something about coverage units
- Something about recognition pattern
- NOT generic questions like "What is CSM?"

### 12.2 Varied Follow-ups
1. Ask the same question twice in different sessions
2. Compare the follow-up suggestions

**Expected**:
- Follow-ups should vary (not always identical)
- All should still be relevant to the topic

### 12.3 Calculation Question Follow-ups
Ask: "Show me how to calculate the risk adjustment using the confidence level approach."

**Expected Follow-ups**:
- Practical examples
- Alternative methods (cost of capital)
- Disclosure requirements
- NOT the exact same question rephrased

### 12.4 Comparison Question Follow-ups
Ask: "What's the difference between the General Measurement Model and the Premium Allocation Approach?"

**Expected Follow-ups**:
- When to use each
- Eligibility criteria deep dive
- Transition considerations
- VFA as a third option

### 12.5 Follow-up Progression
Ask three questions in sequence and check if follow-ups evolve:
1. "What is IFRS 17?"
2. Click a suggested follow-up
3. Click another suggested follow-up

**Expected**:
- Follow-ups should get progressively more specific/advanced
- Should build upon previous conversation

### 12.6 Module-Aware Follow-ups
1. Navigate to "Reinsurance" module
2. Ask: "How does IFRS 17 treat reinsurance contracts?"

**Expected Follow-ups** (module-specific):
- Reinsurance held vs issued
- Loss recovery component
- Cedant accounting
- Should prioritize reinsurance-related topics

---

## 13. LangSmith Observability Tests

These tests verify LangSmith tracing is working (for developers).

### 13.1 Trace Visibility
1. Ask any question in the chatbot
2. Open LangSmith dashboard (https://smith.langchain.com)
3. Navigate to the project "ifrs17-rag-chatbot"

**Expected**:
- New trace should appear
- Trace should show: check_ifrs17_relevance → stream_chat_response chain
- Metadata should include question type, doc count

### 13.2 Summary Generation Trace
1. Ask a long question that triggers summary
2. Check LangSmith

**Expected**:
- Separate trace for "generate_summary" 
- Shows input (response content) and output (key points)

### 13.3 Follow-up Generation Trace
1. Ask any question
2. Check LangSmith

**Expected**:
- Trace for "generate_dynamic_followups"
- Shows question, response, and generated suggestions

---

## 14. Combined New Features Tests

### 14.1 Full Feature Integration
1. Navigate to "Insurance Revenue" module
2. Open chatbot (should see module context)
3. Ask: "Explain how insurance revenue is calculated and recognized, with a worked example"
4. Wait for complete response

**Expected**:
- Welcome mentions Insurance Revenue module
- Long detailed response
- Summary card with key points
- Dynamic follow-ups specific to revenue calculation
- All tracked in LangSmith

### 14.2 Help Button → Context → Summary
1. Start a question about CSM in the game
2. Click "Need Help?" button
3. Ask: "Can you explain this concept in detail?"

**Expected**:
- Chat opens with module context
- Response is comprehensive
- Summary card appears
- Follow-ups are relevant to CSM

### 14.3 Progressive Conversation with Summaries
1. Ask: "What is IFRS 17?" (short response, no summary)
2. Ask: "Explain all the measurement approaches in detail" (long, with summary)
3. Click a follow-up suggestion

**Expected**:
- First response: no summary
- Second response: has summary card
- Third response: contextual to clicked follow-up

---

## 15. Regression Tests

Run these after any code changes to ensure nothing broke.

1. ✅ Basic question response works
2. ✅ Streaming displays progressively
3. ✅ Sources are shown
4. ✅ Error handling works (disconnect backend)
5. ✅ Panel opens/closes correctly
6. ✅ Input field accepts text
7. ✅ Send button works
8. ✅ Enter key sends message
9. ✅ Welcome message shows user name
10. ✅ Quick action buttons are clickable
11. ✅ Game context shows in header
12. ✅ Summary cards appear for long responses
13. ✅ Summary cards are collapsible
14. ✅ Follow-up questions are dynamic
15. ✅ "Need Help?" button opens chat
16. ✅ LangSmith traces are recorded

---

## Notes for Testers

1. **Clear conversation** between test sequences to ensure fresh context
2. **Check console** for any JavaScript errors during testing
3. **Verify backend** is running at http://localhost:8000
4. **Test on different screen sizes** for responsive layout
5. **Note any formatting issues** in the responses
6. **Check LangSmith** for trace completeness (developers only)
7. **Test module switching** to verify context updates

---

*Last Updated: December 7, 2025*
*Features Tested: Conversation Memory, Quick Actions, Structured Templates, Visual Hierarchy, Code/Formula Formatting, Suggested Topics, Game Context Awareness, Summary Cards, Dynamic Follow-ups, LangSmith Observability*
