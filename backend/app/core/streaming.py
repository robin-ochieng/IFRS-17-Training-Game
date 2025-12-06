"""
Streaming Response Handler for IFRS 17 RAG Chatbot
"""
import json
import logging
import re
import uuid
from typing import AsyncGenerator, Tuple
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableConfig
from langsmith import traceable

from app.config import settings
from app.rag.vectorstore import similarity_search, get_document_count

logger = logging.getLogger(__name__)

# Question type constants
QUESTION_TYPE_DEFINITION = "definition"
QUESTION_TYPE_CALCULATION = "calculation"
QUESTION_TYPE_COMPARISON = "comparison"
QUESTION_TYPE_PROCESS = "process"
QUESTION_TYPE_LIST = "list"
QUESTION_TYPE_ELIGIBILITY = "eligibility"
QUESTION_TYPE_GENERAL = "general"

# Off-topic response message (same as in nodes.py)
OFF_TOPIC_RESPONSE = """I appreciate your question, but I'm specifically designed to assist only with **IFRS 17 (Insurance Contracts)** related topics.

I can help you with questions about:
- **Measurement models** (GMM, PAA, VFA)
- **Contract boundaries and grouping**
- **Liability for Remaining Coverage (LRC)**
- **Liability for Incurred Claims (LIC)**
- **Contractual Service Margin (CSM)**
- **Risk adjustment calculations**
- **Insurance revenue recognition**
- **Reinsurance contracts**
- **Transition requirements**
- **Disclosure requirements**

Please ask me something related to IFRS 17, and I'll be happy to help!"""

# ============================================================================
# STRUCTURED RESPONSE TEMPLATES
# ============================================================================

# ============================================================================
# VISUAL HIERARCHY FORMATTING GUIDELINES (applied to all templates)
# ============================================================================
VISUAL_HIERARCHY_GUIDELINES = """
**CRITICAL FORMATTING RULES - Follow these exactly:**

1. **Headers**: Use #### for main sections (creates bold headers)
2. **Key Terms**: Always bold important terms using **term**
3. **Lists**: 
   - Use numbered lists (1. 2. 3.) for sequential steps or ranked items
   - Use bullet points (- ) for non-sequential items
   - Indent sub-items with 2 spaces
4. **Spacing**: Add a blank line before each new section header
5. **Highlighting**:
   - Bold (**text**) for key terms, important concepts, and emphasis
   - Use `code format` for specific values, formulas, or technical references
6. **Structure**: Keep paragraphs short (2-3 sentences max)
7. **Clarity**: Start each section with the most important information
"""

RESPONSE_TEMPLATES = {
    QUESTION_TYPE_DEFINITION: """You are an expert IFRS 17 assistant providing a DEFINITION or explanation.

**RESPONSE FORMAT (follow this exact structure):**

#### Definition
[One clear, authoritative sentence defining the term]

[One sentence explaining its significance in simple terms]

#### Context in IFRS 17
[2-3 sentences explaining where this fits in the IFRS 17 framework]

**Referenced in**: IFRS 17 paragraph [X] (if known from context)

#### Key Characteristics
- **[Characteristic 1]**: Brief explanation
- **[Characteristic 2]**: Brief explanation  
- **[Characteristic 3]**: Brief explanation
- **[Characteristic 4]**: Brief explanation (if applicable)

#### Practical Example
**Scenario**: [Brief real-world scenario]

**Application**: [How the concept applies]

**Result**: [What this means in practice]

---

**FORMATTING RULES:**
- Start Definition with a single, clear sentence
- Bold all key IFRS 17 terms when first mentioned
- Use exactly 3-5 bullet points for Key Characteristics
- Keep the example concrete and relatable
- Add paragraph reference when available""",

    QUESTION_TYPE_CALCULATION: """You are an expert IFRS 17 assistant explaining a CALCULATION or formula.

**RESPONSE FORMAT (follow this exact structure):**

#### Formula

```
[Present the formula clearly]
```

**Where:**
- `[Variable 1]` = [Definition]
- `[Variable 2]` = [Definition]
- `[Variable 3]` = [Definition]

#### Step-by-Step Calculation

**Step 1: [Action Title]**
[Clear instruction for this step]

**Step 2: [Action Title]**
[Clear instruction for this step]

**Step 3: [Action Title]**
[Clear instruction for this step]

**Step 4: [Action Title]** (continue as needed)
[Clear instruction for this step]

#### Worked Example

**Given:**
- [Input 1]: [value]
- [Input 2]: [value]
- [Input 3]: [value]

**Calculation:**
1. [First calculation step] = [result]
2. [Second calculation step] = [result]
3. [Final calculation] = **[final result]**

**Interpretation**: [What the result means]

#### Key Considerations
- **[Consideration 1]**: Brief note
- **[Consideration 2]**: Brief note

---

**FORMATTING RULES:**
- Use code blocks for formulas
- Bold the final result
- Number all calculation steps
- Keep each step on its own line
- Use bullet points for Given values""",

    QUESTION_TYPE_COMPARISON: """You are an expert IFRS 17 assistant providing a COMPARISON.

**RESPONSE FORMAT (follow this exact structure):**

#### Overview

**[Item 1]**: [One sentence description]

**[Item 2]**: [One sentence description]

#### Side-by-Side Comparison

| Aspect | [Item 1] | [Item 2] |
|--------|----------|----------|
| **Purpose** | [Description] | [Description] |
| **Complexity** | [Description] | [Description] |
| **Key Feature** | [Description] | [Description] |
| **When Used** | [Description] | [Description] |
| **Main Advantage** | [Description] | [Description] |

#### Key Differences

1. **[Difference Category 1]**
   - *[Item 1]*: [How it handles this]
   - *[Item 2]*: [How it handles this]

2. **[Difference Category 2]**
   - *[Item 1]*: [How it handles this]
   - *[Item 2]*: [How it handles this]

3. **[Difference Category 3]**
   - *[Item 1]*: [How it handles this]
   - *[Item 2]*: [How it handles this]

#### Decision Guide

**Choose [Item 1] when:**
- [Condition 1]
- [Condition 2]

**Choose [Item 2] when:**
- [Condition 1]
- [Condition 2]

---

**FORMATTING RULES:**
- Use markdown tables for visual comparison
- Bold category names in Key Differences
- Use italics for item names in sub-bullets
- Include at least 3 key differences
- End with clear decision criteria""",

    QUESTION_TYPE_PROCESS: """You are an expert IFRS 17 assistant explaining a PROCESS or procedure.

**RESPONSE FORMAT (follow this exact structure):**

#### Overview
[2-3 sentences describing the process and its purpose in IFRS 17]

#### Process Steps

**Step 1: [Clear Action Title]**
[What to do in this step - be specific and actionable]
- Key point or sub-action
- Key point or sub-action

**Step 2: [Clear Action Title]**
[What to do in this step - be specific and actionable]
- Key point or sub-action
- Key point or sub-action

**Step 3: [Clear Action Title]**
[What to do in this step - be specific and actionable]
- Key point or sub-action

**Step 4: [Clear Action Title]** (continue as needed)
[What to do in this step]

#### Important Considerations

⚠️ **Watch out for:**
- [Common pitfall 1]
- [Common pitfall 2]

✓ **Best practices:**
- [Best practice 1]
- [Best practice 2]

#### Quick Reference
| Step | Action | Key Output |
|------|--------|------------|
| 1 | [Brief action] | [Output] |
| 2 | [Brief action] | [Output] |
| 3 | [Brief action] | [Output] |

---

**FORMATTING RULES:**
- Bold step titles with numbers
- Use sub-bullets for details within steps
- Include warning symbols (⚠️) for pitfalls
- Include checkmarks (✓) for best practices
- Add summary table for quick reference""",

    QUESTION_TYPE_LIST: """You are an expert IFRS 17 assistant listing TYPES, COMPONENTS, or ITEMS.

**RESPONSE FORMAT (follow this exact structure):**

#### Overview
[1-2 sentences introducing what you're listing and why it matters]

#### [Category Name] ([Number] Types/Components)

**1. [Item Name]**
   - **Definition**: [What it is]
   - **Purpose**: [Why it exists/what it does]
   - **Key feature**: [Most important characteristic]

**2. [Item Name]**
   - **Definition**: [What it is]
   - **Purpose**: [Why it exists/what it does]
   - **Key feature**: [Most important characteristic]

**3. [Item Name]**
   - **Definition**: [What it is]
   - **Purpose**: [Why it exists/what it does]
   - **Key feature**: [Most important characteristic]

(Continue for all items...)

#### Summary Comparison
| Type/Component | Primary Use | Key Characteristic |
|---------------|-------------|-------------------|
| [Item 1] | [Use] | [Feature] |
| [Item 2] | [Use] | [Feature] |
| [Item 3] | [Use] | [Feature] |

#### Key Takeaway
[One sentence summarizing the relationship or main point]

---

**FORMATTING RULES:**
- Number items prominently with bold names
- Use consistent sub-bullet structure for each item
- Include Definition, Purpose, Key feature for each
- Add summary table for quick scanning
- End with a key takeaway""",

    QUESTION_TYPE_ELIGIBILITY: """You are an expert IFRS 17 assistant explaining ELIGIBILITY CRITERIA or requirements.

**RESPONSE FORMAT (follow this exact structure):**

#### Overview
[1-2 sentences stating what the eligibility is for]

**Applicable IFRS 17 Reference**: Paragraph [X] (if known)

#### Required Criteria (All Must Be Met)

✓ **Criterion 1: [Name]**
  [Clear explanation of this requirement]

✓ **Criterion 2: [Name]**
  [Clear explanation of this requirement]

✓ **Criterion 3: [Name]**
  [Clear explanation of this requirement]

#### Additional Conditions

These may also apply:
- **[Condition 1]**: [When/how it applies]
- **[Condition 2]**: [When/how it applies]

#### Exceptions & Special Cases

⚠️ **Exception 1**: [Description]
- When it applies: [Circumstances]

⚠️ **Exception 2**: [Description]
- When it applies: [Circumstances]

#### Eligibility Checklist

| Criterion | Requirement | Check |
|-----------|-------------|-------|
| [Criterion 1] | [Brief requirement] | ☐ |
| [Criterion 2] | [Brief requirement] | ☐ |
| [Criterion 3] | [Brief requirement] | ☐ |

#### Practical Assessment
**How to evaluate**: [2-3 sentences with actionable guidance]

---

**FORMATTING RULES:**
- Use ✓ checkmarks for required criteria
- Use ⚠️ for exceptions and warnings
- Bold criterion names
- Include a checklist table
- End with practical how-to guidance""",

    QUESTION_TYPE_GENERAL: """You are an expert IFRS 17 (Insurance Contracts) assistant.

**RESPONSE GUIDELINES:**

Structure your response with clear visual hierarchy:

1. **Start with the direct answer** - Address the question immediately
2. **Use headers** (####) to organize sections if the answer has multiple parts
3. **Bold key terms** - Highlight important IFRS 17 terminology using **bold**
4. **Use lists appropriately**:
   - Numbered lists for steps, sequences, or ranked items
   - Bullet points for features, characteristics, or non-sequential items
5. **Keep paragraphs short** - Maximum 2-3 sentences per paragraph
6. **Include specifics** - Reference IFRS 17 paragraphs when relevant

**Example structure for multi-part answers:**

#### [Main Topic]
[Direct answer to the question]

#### [Supporting Detail 1]
- Key point with **important term** highlighted
- Additional detail

#### [Supporting Detail 2]
[Explanation with specifics]

**Key Takeaway**: [Summary sentence]

---

Always base answers on the provided context and acknowledge if information is limited."""
}


def classify_question_type(question: str) -> str:
    """
    Classify the type of question to determine the appropriate response template.
    Uses keyword matching for efficiency.
    
    Returns one of: definition, calculation, comparison, process, list, eligibility, general
    """
    question_lower = question.lower().strip()
    
    # Definition patterns
    definition_patterns = [
        r'\bwhat is\b', r'\bwhat are\b', r'\bdefine\b', r'\bdefinition\b',
        r'\bmeaning of\b', r'\bexplain\b(?!.*how)', r'\bdescribe\b',
        r'\bwhat does\b.*\bmean\b', r'\bwhat\'s\b'
    ]
    
    # Calculation patterns
    calculation_patterns = [
        r'\bcalculat', r'\bformula\b', r'\bcompute\b', r'\bdetermine\b.*(?:value|amount)',
        r'\bhow (?:is|are).*(?:calculated|measured|determined)\b',
        r'\bwhat is the (?:formula|equation)\b', r'\bhow to (?:calculate|measure|compute)\b',
        r'\bmeasurement\b.*\bhow\b'
    ]
    
    # Comparison patterns
    comparison_patterns = [
        r'\bdifference\b', r'\bvs\.?\b', r'\bversus\b', r'\bcompare\b',
        r'\bdistinguish\b', r'\bcontrast\b', r'\bhow (?:does|do).*differ\b',
        r'\bwhat\'s the difference\b', r'\bcompared to\b'
    ]
    
    # Process patterns
    process_patterns = [
        r'\bhow to\b', r'\bsteps\b', r'\bprocess\b', r'\bprocedure\b',
        r'\bhow (?:do|does|should|can)\b.*(?:apply|implement|recognize|account)\b',
        r'\bwhat is the process\b', r'\bhow is.*(?:done|performed|applied)\b'
    ]
    
    # List patterns
    list_patterns = [
        r'\btypes of\b', r'\bcomponents of\b', r'\belements of\b',
        r'\bwhat are the\b.*(?:types|components|elements|categories|parts)\b',
        r'\blist\b', r'\bwhat (?:types|kinds|categories)\b',
        r'\bhow many\b.*\btypes\b'
    ]
    
    # Eligibility patterns
    eligibility_patterns = [
        r'\bwhen (?:to|should|can)\b.*(?:use|apply)\b', r'\bcriteria\b',
        r'\beligib', r'\brequirements?\b', r'\bqualif',
        r'\bconditions? for\b', r'\bwhen is\b.*\b(?:applicable|appropriate|required)\b',
        r'\bcan.*(?:use|apply)\b'
    ]
    
    # Check patterns in order of specificity
    for pattern in calculation_patterns:
        if re.search(pattern, question_lower):
            return QUESTION_TYPE_CALCULATION
    
    for pattern in comparison_patterns:
        if re.search(pattern, question_lower):
            return QUESTION_TYPE_COMPARISON
    
    for pattern in process_patterns:
        if re.search(pattern, question_lower):
            return QUESTION_TYPE_PROCESS
    
    for pattern in eligibility_patterns:
        if re.search(pattern, question_lower):
            return QUESTION_TYPE_ELIGIBILITY
    
    for pattern in list_patterns:
        if re.search(pattern, question_lower):
            return QUESTION_TYPE_LIST
    
    for pattern in definition_patterns:
        if re.search(pattern, question_lower):
            return QUESTION_TYPE_DEFINITION
    
    return QUESTION_TYPE_GENERAL


def get_system_prompt_for_question_type(question_type: str, context: str, game_context: dict = None) -> str:
    """
    Get the appropriate system prompt based on question type and game context.
    
    Args:
        question_type: Type of question (definition, calculation, etc.)
        context: Retrieved document context
        game_context: Optional game state information for contextual responses
    """
    template = RESPONSE_TEMPLATES.get(question_type, RESPONSE_TEMPLATES[QUESTION_TYPE_GENERAL])
    
    # Build game context section if available
    game_context_section = ""
    if game_context:
        module_title = game_context.get('current_module_title')
        question_text = game_context.get('current_question_text')
        question_explanation = game_context.get('current_question_explanation')
        is_completed = game_context.get('is_module_completed', False)
        user_level = game_context.get('user_level')
        
        if module_title or question_text:
            game_context_section = "\n\n**🎮 Current Game Context:**\n"
            
            if module_title:
                game_context_section += f"- **Current Module**: {module_title}\n"
            
            if question_text and not is_completed:
                game_context_section += f"- **Current Question**: {question_text}\n"
                if question_explanation:
                    game_context_section += f"- **Hint (for your reference)**: {question_explanation}\n"
            
            if user_level:
                # Adjust response complexity based on user level
                if user_level <= 3:
                    game_context_section += "\n*User is at beginner level - provide simpler explanations with more foundational context.*"
                elif user_level <= 7:
                    game_context_section += "\n*User is at intermediate level - provide balanced technical depth.*"
                else:
                    game_context_section += "\n*User is at advanced level - can include more technical details and edge cases.*"
            
            game_context_section += """

**Context-Aware Behavior:**
- If the user asks about the current question, provide helpful guidance WITHOUT directly revealing the answer
- If they seem stuck, offer hints that guide their thinking
- Relate explanations back to the current module topic when relevant
- Suggest related concepts from the current module for deeper learning"""
    
    return f"""{template}

**Context from IFRS 17 documentation:**
{context}
{game_context_section}

**Important:** 
- Always base your response on the provided context
- If the context doesn't contain enough information, acknowledge this
- Consider any conversation history when answering follow-up questions"""


# ============================================================================
# RELATED TOPICS SUGGESTION ENGINE
# ============================================================================

# Topic relationship map - defines related concepts for proactive suggestions
TOPIC_RELATIONSHIPS = {
    # Core Measurement Concepts
    'csm': {
        'keywords': ['csm', 'contractual service margin', 'service margin'],
        'related': [
            {'topic': 'Risk Adjustment', 'question': 'What is the risk adjustment for non-financial risk?'},
            {'topic': 'Coverage Units', 'question': 'How are coverage units determined for CSM amortization?'},
            {'topic': 'Onerous Contracts', 'question': 'What happens to CSM when a contract becomes onerous?'},
            {'topic': 'Insurance Revenue', 'question': 'How does CSM affect insurance revenue recognition?'},
        ]
    },
    'risk_adjustment': {
        'keywords': ['risk adjustment', 'non-financial risk', 'confidence level'],
        'related': [
            {'topic': 'CSM', 'question': 'How does risk adjustment interact with the CSM?'},
            {'topic': 'Disclosure Requirements', 'question': 'What disclosures are required for risk adjustment?'},
            {'topic': 'Calculation Methods', 'question': 'What methods can be used to calculate risk adjustment?'},
            {'topic': 'Reinsurance', 'question': 'How is risk adjustment determined for reinsurance contracts?'},
        ]
    },
    'gmm': {
        'keywords': ['gmm', 'general measurement model', 'building block', 'bba'],
        'related': [
            {'topic': 'PAA Comparison', 'question': 'What is the difference between GMM and PAA?'},
            {'topic': 'Fulfilment Cash Flows', 'question': 'What are the components of fulfilment cash flows?'},
            {'topic': 'VFA', 'question': 'When should VFA be used instead of GMM?'},
            {'topic': 'Initial Recognition', 'question': 'How is a contract measured at initial recognition under GMM?'},
        ]
    },
    'paa': {
        'keywords': ['paa', 'premium allocation approach', 'simplified'],
        'related': [
            {'topic': 'Eligibility Criteria', 'question': 'What are the eligibility criteria for using PAA?'},
            {'topic': 'GMM Comparison', 'question': 'How does PAA differ from the General Measurement Model?'},
            {'topic': 'LIC Measurement', 'question': 'How is the liability for incurred claims measured under PAA?'},
            {'topic': 'Short-term Contracts', 'question': 'Why is PAA suitable for short-duration contracts?'},
        ]
    },
    'vfa': {
        'keywords': ['vfa', 'variable fee approach', 'direct participation', 'participating'],
        'related': [
            {'topic': 'Eligibility Criteria', 'question': 'What are the eligibility criteria for VFA?'},
            {'topic': 'Underlying Items', 'question': 'What are underlying items in VFA contracts?'},
            {'topic': 'CSM Adjustments', 'question': 'How is CSM adjusted under VFA?'},
            {'topic': 'Financial Risk', 'question': 'How does VFA handle changes in financial risk?'},
        ]
    },
    'reinsurance': {
        'keywords': ['reinsurance', 'ceding', 'reinsurer', 'cedant'],
        'related': [
            {'topic': 'Loss Recovery', 'question': 'What is the loss recovery component in reinsurance?'},
            {'topic': 'CSM for Reinsurance', 'question': 'How is CSM calculated for reinsurance contracts held?'},
            {'topic': 'Proportional vs Non-proportional', 'question': 'How does IFRS 17 treat different types of reinsurance?'},
            {'topic': 'Timing Differences', 'question': 'How are timing differences handled in reinsurance accounting?'},
        ]
    },
    'transition': {
        'keywords': ['transition', 'ifrs 4', 'first-time', 'retrospective', 'fair value'],
        'related': [
            {'topic': 'Full Retrospective', 'question': 'What is the full retrospective approach for IFRS 17 transition?'},
            {'topic': 'Modified Retrospective', 'question': 'When can the modified retrospective approach be used?'},
            {'topic': 'Fair Value Approach', 'question': 'How does the fair value approach work for transition?'},
            {'topic': 'Transition Date', 'question': 'What is the transition date and why does it matter?'},
        ]
    },
    'lrc': {
        'keywords': ['lrc', 'liability for remaining coverage', 'remaining coverage'],
        'related': [
            {'topic': 'LIC', 'question': 'What is the difference between LRC and LIC?'},
            {'topic': 'Premium Receipts', 'question': 'How do premium receipts affect the LRC?'},
            {'topic': 'Release Pattern', 'question': 'How is the LRC released over the coverage period?'},
            {'topic': 'Loss Component', 'question': 'What is the loss component within LRC?'},
        ]
    },
    'lic': {
        'keywords': ['lic', 'liability for incurred claims', 'incurred claims', 'claims liability'],
        'related': [
            {'topic': 'LRC', 'question': 'How does LIC relate to LRC?'},
            {'topic': 'Claims Settlement', 'question': 'How are claims settlements reflected in the LIC?'},
            {'topic': 'IBNR', 'question': 'How does IFRS 17 handle incurred but not reported claims?'},
            {'topic': 'Discounting', 'question': 'How is discounting applied to the LIC?'},
        ]
    },
    'contract_boundary': {
        'keywords': ['contract boundar', 'boundary', 'substantive rights', 'repricing'],
        'related': [
            {'topic': 'Cash Flow Projections', 'question': 'How do contract boundaries affect cash flow projections?'},
            {'topic': 'Renewals', 'question': 'How are renewal options treated for contract boundaries?'},
            {'topic': 'Repricing Rights', 'question': 'How do repricing rights affect the contract boundary?'},
            {'topic': 'Portfolio vs Contract', 'question': 'Are contract boundaries determined at portfolio or contract level?'},
        ]
    },
    'grouping': {
        'keywords': ['grouping', 'portfolio', 'cohort', 'annual cohort', 'profitability'],
        'related': [
            {'topic': 'Onerous Contracts', 'question': 'How are onerous contracts identified during grouping?'},
            {'topic': 'Annual Cohorts', 'question': 'What is the annual cohort requirement?'},
            {'topic': 'Portfolio Definition', 'question': 'How is a portfolio defined under IFRS 17?'},
            {'topic': 'Aggregation Level', 'question': 'At what level is profitability assessed for grouping?'},
        ]
    },
    'discount_rate': {
        'keywords': ['discount rate', 'discounting', 'time value', 'interest rate'],
        'related': [
            {'topic': 'Bottom-up vs Top-down', 'question': 'What are the bottom-up and top-down approaches for discount rates?'},
            {'topic': 'Locked-in Rates', 'question': 'When are discount rates locked in under IFRS 17?'},
            {'topic': 'Insurance Finance', 'question': 'How do discount rate changes affect insurance finance income/expense?'},
            {'topic': 'OCI Option', 'question': 'What is the OCI option for insurance finance income or expenses?'},
        ]
    },
    'disclosure': {
        'keywords': ['disclosure', 'presentation', 'financial statement', 'notes'],
        'related': [
            {'topic': 'Reconciliations', 'question': 'What reconciliations are required under IFRS 17?'},
            {'topic': 'Significant Judgments', 'question': 'What judgments must be disclosed under IFRS 17?'},
            {'topic': 'Risk Disclosures', 'question': 'What insurance risk disclosures are required?'},
            {'topic': 'Revenue Disaggregation', 'question': 'How should insurance revenue be disaggregated?'},
        ]
    },
    'onerous': {
        'keywords': ['onerous', 'loss component', 'loss-making', 'unprofitable'],
        'related': [
            {'topic': 'Loss Component', 'question': 'How is the loss component calculated and tracked?'},
            {'topic': 'Reversal', 'question': 'Can a contract become profitable after being onerous?'},
            {'topic': 'Grouping Impact', 'question': 'How do onerous contracts affect contract grouping?'},
            {'topic': 'CSM Impact', 'question': 'What happens to CSM when a group becomes onerous?'},
        ]
    },
    'acquisition_costs': {
        'keywords': ['acquisition cost', 'dac', 'deferred', 'insurance acquisition'],
        'related': [
            {'topic': 'Allocation', 'question': 'How are acquisition costs allocated to groups?'},
            {'topic': 'Asset Recognition', 'question': 'When is an acquisition cost asset recognized?'},
            {'topic': 'Amortization', 'question': 'How are deferred acquisition costs amortized?'},
            {'topic': 'Renewals', 'question': 'How are acquisition costs for renewals treated?'},
        ]
    }
}

# Module-specific suggested topics for game context awareness
MODULE_TOPIC_SUGGESTIONS = {
    "IFRS 17 Fundamentals": [
        {'topic': 'Scope & Objectives', 'question': 'What contracts are within the scope of IFRS 17?'},
        {'topic': 'Key Changes', 'question': 'What are the key changes from IFRS 4 to IFRS 17?'},
        {'topic': 'Effective Date', 'question': 'When did IFRS 17 become effective?'},
        {'topic': 'Insurance Risk', 'question': 'How does IFRS 17 define insurance risk?'},
    ],
    "Combination & Separation of Insurance Contracts": [
        {'topic': 'Contract Combination', 'question': 'When should insurance contracts be combined?'},
        {'topic': 'Component Separation', 'question': 'When must components be separated from insurance contracts?'},
        {'topic': 'Investment Components', 'question': 'What is an investment component under IFRS 17?'},
        {'topic': 'Embedded Derivatives', 'question': 'How are embedded derivatives treated in insurance contracts?'},
    ],
    "Measurement Models": [
        {'topic': 'GMM Overview', 'question': 'What is the General Measurement Model?'},
        {'topic': 'PAA Eligibility', 'question': 'When can the Premium Allocation Approach be used?'},
        {'topic': 'VFA Criteria', 'question': 'What are the eligibility criteria for the Variable Fee Approach?'},
        {'topic': 'Model Comparison', 'question': 'Compare GMM, PAA, and VFA approaches'},
    ],
    "Fulfilment Cash Flows": [
        {'topic': 'FCF Components', 'question': 'What are the components of fulfilment cash flows?'},
        {'topic': 'Risk Adjustment', 'question': 'How is the risk adjustment calculated?'},
        {'topic': 'Discount Rates', 'question': 'How are discount rates determined under IFRS 17?'},
        {'topic': 'Best Estimate', 'question': 'What is the best estimate liability?'},
    ],
    "Contractual Service Margin": [
        {'topic': 'CSM Calculation', 'question': 'How is the CSM calculated at initial recognition?'},
        {'topic': 'CSM Amortization', 'question': 'How is the CSM amortized over time?'},
        {'topic': 'Coverage Units', 'question': 'How are coverage units determined?'},
        {'topic': 'Onerous Contracts', 'question': 'What happens to CSM when a contract becomes onerous?'},
    ],
    "Insurance Revenue": [
        {'topic': 'Revenue Recognition', 'question': 'How is insurance revenue recognized under IFRS 17?'},
        {'topic': 'Revenue Formula', 'question': 'What is the insurance revenue formula?'},
        {'topic': 'Service Components', 'question': 'What components make up insurance revenue?'},
        {'topic': 'Claims Recognition', 'question': 'How are incurred claims recognized?'},
    ],
    "Reinsurance": [
        {'topic': 'Reinsurance Held', 'question': 'How are reinsurance contracts held accounted for?'},
        {'topic': 'Cedant Accounting', 'question': 'How does cedant accounting differ from direct insurance?'},
        {'topic': 'Loss Recovery', 'question': 'How is loss recovery from reinsurance recognized?'},
        {'topic': 'Reinsurance CSM', 'question': 'How is CSM calculated for reinsurance contracts?'},
    ],
    "Transition": [
        {'topic': 'Transition Approaches', 'question': 'What are the transition approaches under IFRS 17?'},
        {'topic': 'Full Retrospective', 'question': 'When is the full retrospective approach required?'},
        {'topic': 'Modified Retrospective', 'question': 'How does the modified retrospective approach work?'},
        {'topic': 'Fair Value Approach', 'question': 'When can the fair value approach be used?'},
    ],
    "Disclosure Requirements": [
        {'topic': 'Required Disclosures', 'question': 'What disclosures are required under IFRS 17?'},
        {'topic': 'Risk Disclosures', 'question': 'What risk disclosures are needed?'},
        {'topic': 'Judgments & Estimates', 'question': 'What judgments and estimates must be disclosed?'},
        {'topic': 'Reconciliations', 'question': 'What reconciliations are required in IFRS 17 disclosures?'},
    ],
}


# ============================================================================
# DYNAMIC FOLLOW-UP QUESTION GENERATION
# ============================================================================

@traceable(name="generate_dynamic_followups", run_type="chain")
async def generate_dynamic_followup_questions(question: str, response_content: str, game_context: dict = None) -> list:
    """
    Use LLM to generate dynamic, contextual follow-up questions based on the 
    conversation content and game context.
    
    Returns a list of 3-4 suggested follow-up questions.
    """
    try:
        llm = ChatOpenAI(
            model=settings.OPENAI_MODEL,
            temperature=0.7,  # Slightly creative for variety
            api_key=settings.OPENAI_API_KEY
        )
        
        # Build context about current module if available
        module_context = ""
        if game_context:
            module_title = game_context.get('current_module_title')
            current_question = game_context.get('current_question_text')
            if module_title:
                module_context = f"\nUser is currently studying: {module_title}"
            if current_question:
                module_context += f"\nGame question they're working on: {current_question}"
        
        followup_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an IFRS 17 expert assistant helping learners deepen their understanding.

Generate 3-4 natural follow-up questions that a learner would likely want to ask next based on the conversation.

Rules:
1. Questions should build upon or relate to the topic just discussed
2. Include a mix of:
   - Clarification questions (e.g., "Can you explain X in more detail?")
   - Practical application (e.g., "How would this apply to...?")
   - Related concepts (e.g., "How does this relate to Y?")
   - Examples/calculations (e.g., "Can you show a worked example?")
3. Keep questions concise (max 10 words each)
4. Make questions specific to the content discussed, not generic
5. Avoid repeating the original question
6. Questions should be progressively more advanced

{module_context}

Format: Return ONLY a JSON array of objects with 'topic' (2-4 word label) and 'question' (the follow-up question).
Example: [
  {{"topic": "CSM Amortization", "question": "How is CSM amortized over time?"}},
  {{"topic": "Worked Example", "question": "Can you show a calculation example?"}}
]"""),
            ("human", """Original question: {question}

Response given:
{response}

Generate 3-4 contextual follow-up questions as a JSON array:""")
        ])
        
        chain = followup_prompt | llm
        
        result = await chain.ainvoke({
            "question": question,
            "response": response_content[:2000],  # Limit to manage tokens
            "module_context": module_context
        })
        
        # Parse the JSON response
        suggestions_text = result.content.strip()
        # Clean up potential markdown formatting
        if suggestions_text.startswith("```"):
            suggestions_text = suggestions_text.split("```")[1]
            if suggestions_text.startswith("json"):
                suggestions_text = suggestions_text[4:]
        suggestions_text = suggestions_text.strip()
        
        import ast
        try:
            suggestions = json.loads(suggestions_text)
        except json.JSONDecodeError:
            # Try ast.literal_eval as fallback
            suggestions = ast.literal_eval(suggestions_text)
        
        if isinstance(suggestions, list) and len(suggestions) >= 2:
            # Validate structure
            valid_suggestions = []
            for s in suggestions[:4]:
                if isinstance(s, dict) and 'topic' in s and 'question' in s:
                    valid_suggestions.append({
                        'topic': s['topic'][:30],  # Limit topic length
                        'question': s['question'][:100]  # Limit question length
                    })
            if valid_suggestions:
                return valid_suggestions
        
        # Fallback if parsing fails
        return get_fallback_suggestions(question, response_content, game_context)
        
    except Exception as e:
        logger.error(f"Error generating dynamic follow-ups: {e}")
        return get_fallback_suggestions(question, response_content, game_context)


def get_fallback_suggestions(question: str, response_content: str = "", game_context: dict = None) -> list:
    """
    Fallback to keyword-based suggestions if LLM generation fails.
    """
    question_lower = question.lower()
    response_lower = response_content.lower() if response_content else ""
    combined_text = f"{question_lower} {response_lower}"
    
    suggestions = []
    matched_categories = set()
    
    # If game context is provided, prioritize module-specific suggestions
    if game_context:
        module_title = game_context.get('current_module_title')
        if module_title and module_title in MODULE_TOPIC_SUGGESTIONS:
            module_suggestions = MODULE_TOPIC_SUGGESTIONS[module_title]
            for suggestion in module_suggestions:
                if suggestion['question'].lower() not in question_lower and len(suggestions) < 2:
                    suggestions.append(suggestion)
    
    # Find matching topics based on keywords
    for category, data in TOPIC_RELATIONSHIPS.items():
        for keyword in data['keywords']:
            if keyword in combined_text and category not in matched_categories:
                matched_categories.add(category)
                for related in data['related']:
                    if len(suggestions) < 4:
                        if not any(s['question'] == related['question'] for s in suggestions):
                            suggestions.append(related)
                break
    
    # General fallback
    if not suggestions:
        suggestions = [
            {'topic': 'Practical Example', 'question': 'Can you show a worked example?'},
            {'topic': 'Key Components', 'question': 'What are the key components to remember?'},
            {'topic': 'Common Pitfalls', 'question': 'What are common mistakes to avoid?'},
        ]
    
    return suggestions[:4]


def generate_suggested_topics(question: str, response_content: str = "", game_context: dict = None) -> list:
    """
    Generate related topic suggestions based on the question, response content, and game context.
    Returns a list of suggested topics with questions.
    
    If game context is provided, prioritizes suggestions from the current module.
    """
    question_lower = question.lower()
    response_lower = response_content.lower() if response_content else ""
    combined_text = f"{question_lower} {response_lower}"
    
    suggestions = []
    matched_categories = set()
    
    # If game context is provided, prioritize module-specific suggestions
    if game_context:
        module_title = game_context.get('current_module_title')
        if module_title and module_title in MODULE_TOPIC_SUGGESTIONS:
            # Get module-specific suggestions
            module_suggestions = MODULE_TOPIC_SUGGESTIONS[module_title]
            # Filter out suggestions that are too similar to the current question
            for suggestion in module_suggestions:
                if suggestion['question'].lower() not in question_lower and len(suggestions) < 2:
                    suggestions.append(suggestion)
    
    # Find matching topics based on keywords (add to existing suggestions)
    for category, data in TOPIC_RELATIONSHIPS.items():
        for keyword in data['keywords']:
            if keyword in combined_text and category not in matched_categories:
                matched_categories.add(category)
                # Add related topics (not the same category)
                for related in data['related']:
                    if len(suggestions) < 4:  # Limit to 4 suggestions
                        # Avoid duplicate suggestions
                        if not any(s['question'] == related['question'] for s in suggestions):
                            suggestions.append(related)
                break
    
    # If no specific matches, provide general suggestions based on question type
    if not suggestions:
        general_suggestions = [
            {'topic': 'Measurement Models', 'question': 'What are the measurement models under IFRS 17?'},
            {'topic': 'CSM Overview', 'question': 'What is the Contractual Service Margin?'},
            {'topic': 'Key Concepts', 'question': 'What are the key concepts in IFRS 17?'},
        ]
        suggestions = general_suggestions[:3]
    
    return suggestions[:4]  # Return max 4 suggestions


# ============================================================================
# SUMMARY CARD GENERATION
# ============================================================================

# Minimum response length (in characters) to trigger summary generation
SUMMARY_THRESHOLD = 800

@traceable(name="generate_summary", run_type="chain")
async def generate_response_summary(response_content: str, question: str) -> dict:
    """
    Generate a TL;DR summary for long responses.
    
    Returns a dict with:
    - key_points: List of 2-4 key bullet points
    - word_count: Word count of the original response
    - should_show: Boolean indicating if summary should be displayed
    """
    # Only generate summary for responses above threshold
    if len(response_content) < SUMMARY_THRESHOLD:
        return {"key_points": [], "should_show": False}
    
    try:
        llm = ChatOpenAI(
            model=settings.OPENAI_MODEL,
            temperature=0,
            api_key=settings.OPENAI_API_KEY
        )
        
        summary_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert at creating concise TL;DR summaries for IFRS 17 content.

Your task: Extract 2-4 key takeaways from the response as brief bullet points.

Rules:
1. Each bullet point should be ONE sentence, max 15 words
2. Focus on the most important/actionable information
3. Use simple, clear language
4. Include any key formulas, numbers, or specific terms mentioned
5. Start each point with an action word or key concept

Format: Return ONLY a JSON array of strings, no markdown, no explanation.
Example: ["CSM represents unearned profit from insurance contracts", "Calculated as premiums minus claims minus risk adjustment", "Amortized over coverage period using coverage units"]"""),
            ("human", """Question asked: {question}

Response to summarize:
{response}

Return 2-4 key takeaways as a JSON array of strings:""")
        ])
        
        chain = summary_prompt | llm
        
        result = await chain.ainvoke({
            "question": question,
            "response": response_content[:3000]  # Limit input to manage tokens
        })
        
        # Parse the JSON response
        summary_text = result.content.strip()
        # Clean up potential markdown formatting
        if summary_text.startswith("```"):
            summary_text = summary_text.split("```")[1]
            if summary_text.startswith("json"):
                summary_text = summary_text[4:]
        summary_text = summary_text.strip()
        
        import ast
        try:
            summary_points = json.loads(summary_text)
        except json.JSONDecodeError:
            # Try ast.literal_eval as fallback
            summary_points = ast.literal_eval(summary_text)
        
        if isinstance(summary_points, list) and len(summary_points) >= 2:
            word_count = len(response_content.split())
            return {
                "key_points": summary_points[:4],  # Max 4 points
                "word_count": word_count,
                "should_show": True
            }
        
        return {"key_points": [], "should_show": False}
        
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        return {"key_points": [], "should_show": False}


@traceable(name="check_ifrs17_relevance", run_type="chain")
async def check_ifrs17_relevance(question: str, chat_history: list = None) -> bool:
    """
    Use LLM to check if a question is related to IFRS 17.
    Returns True if related, False otherwise.
    
    Takes into account conversation history for follow-up questions.
    """
    # Quick check: if the question contains "IFRS 17" or "IFRS17", it's always related
    if "ifrs 17" in question.lower() or "ifrs17" in question.lower():
        return True
    
    # Quick check: if there's conversation history about IFRS 17, follow-ups are likely related
    if chat_history and len(chat_history) > 0:
        # Check if any previous messages contain IFRS 17 related terms
        ifrs17_keywords = [
            'ifrs 17', 'ifrs17', 'csm', 'contractual service margin', 
            'risk adjustment', 'gmm', 'paa', 'vfa', 'insurance revenue',
            'fulfilment cash flow', 'lrc', 'lic', 'reinsurance', 
            'coverage unit', 'contract boundary', 'onerous', 'insurance contract',
            'measurement model', 'building block', 'premium allocation',
            'variable fee', 'discount rate', 'transition'
        ]
        
        history_text = ' '.join([msg.get('content', '').lower() for msg in chat_history])
        if any(keyword in history_text for keyword in ifrs17_keywords):
            # Previous conversation was about IFRS 17, so follow-up is likely related
            logger.info("Follow-up question detected in IFRS 17 context - allowing")
            return True
    
    # Check for common follow-up patterns that should be allowed if in context
    follow_up_patterns = [
        'example', 'show me', 'can you', 'what if', 'how about',
        'tell me more', 'explain', 'elaborate', 'continue', 'go on',
        'what happens', 'why', 'when', 'how does', 'more detail',
        'worked example', 'calculation', 'demonstrate', 'illustrate'
    ]
    
    question_lower = question.lower()
    is_follow_up = any(pattern in question_lower for pattern in follow_up_patterns)
    
    if is_follow_up and chat_history and len(chat_history) > 0:
        logger.info("Follow-up pattern detected with history - allowing")
        return True
    
    try:
        llm = ChatOpenAI(
            model=settings.OPENAI_MODEL,
            temperature=0,
            api_key=settings.OPENAI_API_KEY
        )
        
        # Include recent history context in the classification prompt
        history_context = ""
        if chat_history and len(chat_history) > 0:
            recent = chat_history[-4:]  # Last 2 exchanges
            history_context = "\n".join([f"{msg.get('role', 'user')}: {msg.get('content', '')}" for msg in recent])
        
        classification_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a topic classifier. Determine if the user's question is related to IFRS 17 or insurance accounting. Be INCLUSIVE.

IFRS 17 related: insurance contracts, measurement models (GMM, PAA, VFA), contract boundaries, grouping, portfolios, LRC, LIC, CSM, risk adjustment, insurance revenue, reinsurance, investment contracts with DPF, transition from IFRS 4, disclosure requirements, insurance finance, onerous contracts, SCOPE questions (what's covered/excluded), questions about leases/warranties/guarantees under IFRS 17.

NOT related: general programming, completely non-accounting topics, weather, sports, entertainment.

IMPORTANT RULES:
1. If the question mentions IFRS 17 at all, answer "true".
2. If there is conversation history about IFRS 17 and this is a follow-up question (asking for examples, more details, clarification, etc.), answer "true".
3. Only answer "false" if the question is clearly about something completely unrelated AND there's no relevant conversation history.

Respond with ONLY "true" or "false"."""),
            ("human", """Recent conversation (if any):
{history}

Current question: {question}

Is this related to IFRS 17?""")
        ])
        
        chain = classification_prompt | llm
        
        # Configure run metadata for LangSmith
        relevance_config = RunnableConfig(
            run_name="ifrs17_relevance_check",
            tags=["ifrs17", "relevance", "guardrail"],
            metadata={
                "question_preview": question[:100],
                "has_history": len(chat_history) > 0 if chat_history else False
            }
        )
        
        response = await chain.ainvoke(
            {"question": question, "history": history_context or "No previous conversation"},
            config=relevance_config
        )
        
        result = response.content.strip().lower()
        return result == "true"
        
    except Exception as e:
        logger.error(f"Error checking IFRS 17 relevance: {e}")
        # On error, be permissive
        return True


@traceable(name="stream_chat_response", run_type="chain")
async def stream_chat_response(
    question: str, 
    conversation_id: str,
    chat_history: list = None,
    game_context: dict = None
) -> AsyncGenerator[str, None]:
    """
    Stream chat response token by token.
    
    Yields Server-Sent Events (SSE) formatted strings.
    
    Args:
        question: The user's current question
        conversation_id: Unique conversation identifier
        chat_history: List of previous messages [{"role": "user/assistant", "content": "..."}]
        game_context: Optional game state for contextual responses
    """
    # Generate a unique run ID for this chat session
    run_id = str(uuid.uuid4())
    
    chat_history = chat_history or []
    
    # Log game context if provided
    if game_context:
        logger.info(f"Game context received - Module: {game_context.get('current_module_title')}, Question: {game_context.get('current_question_index')}")
    
    try:
        # Check if it's a simple greeting
        question_lower = question.strip().lower()
        simple_greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "thanks", "thank you", "bye", "goodbye"]
        is_only_greeting = any(
            question_lower.strip('!.,?') == greeting 
            for greeting in simple_greetings
        )
        
        # Handle greetings with game context awareness
        if is_only_greeting:
            if game_context and game_context.get('current_module_title'):
                module_title = game_context.get('current_module_title')
                greeting_response = f"Hello! I see you're working on **{module_title}**. I can help you understand concepts from this module or any other IFRS 17 topic. What would you like to know?"
            else:
                greeting_response = "Hello! I'm the IFRS 17 Assistant. I can help you understand the insurance accounting standard, including concepts like measurement models, contract boundaries, liability calculations, and more. What would you like to know about IFRS 17?"
            yield f"data: {json.dumps({'type': 'token', 'content': greeting_response})}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'sources': []})}\n\n"
            return
        
        # GUARDRAIL: Check if query is IFRS 17 related (pass chat_history for context)
        is_ifrs17_related = await check_ifrs17_relevance(question, chat_history)
        
        if not is_ifrs17_related:
            logger.info(f"Off-topic query rejected: {question[:50]}...")
            yield f"data: {json.dumps({'type': 'token', 'content': OFF_TOPIC_RESPONSE})}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'sources': []})}\n\n"
            return
        
        doc_count = get_document_count()
        
        # Retrieve relevant documents
        documents = similarity_search(
            query=question,
            k=settings.MAX_CONTEXT_DOCUMENTS,
            score_threshold=settings.SIMILARITY_THRESHOLD
        ) if doc_count > 0 else []
        
        # Build context
        context_parts = []
        sources = []
        for i, doc in enumerate(documents, 1):
            context_parts.append(f"[Document {i}]\n{doc.page_content}")
            sources.append({
                "content": doc.page_content[:200] + "...",
                "source": doc.metadata.get("source", "Unknown"),
                "page": doc.metadata.get("page"),
                "relevance_score": doc.metadata.get("score", 0.0)
            })
        
        context = "\n\n---\n\n".join(context_parts) if context_parts else "No specific documentation available for this query."
        
        # Send sources first
        yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"
        
        # Classify question type for structured response
        question_type = classify_question_type(question)
        logger.info(f"Question classified as: {question_type}")
        
        # Create streaming LLM with run metadata for LangSmith
        llm = ChatOpenAI(
            model=settings.OPENAI_MODEL,
            temperature=0.1,
            api_key=settings.OPENAI_API_KEY,
            streaming=True
        )
        
        # Build conversation history messages for the prompt
        history_messages = []
        # Limit history to last 10 exchanges (20 messages) to manage token usage
        recent_history = chat_history[-20:] if len(chat_history) > 20 else chat_history
        for msg in recent_history:
            if msg.get("role") == "user":
                history_messages.append(("human", msg.get("content", "")))
            elif msg.get("role") == "assistant":
                history_messages.append(("assistant", msg.get("content", "")))
        
        # Get structured system prompt based on question type and game context
        system_message = get_system_prompt_for_question_type(question_type, context, game_context)

        # Build message list: system -> history -> current question
        messages = [("system", system_message)]
        messages.extend(history_messages)
        messages.append(("human", "{question}"))
        
        prompt = ChatPromptTemplate.from_messages(messages)
        
        # Stream the response and collect content for suggestion generation
        chain = prompt | llm
        response_content = ""
        
        # Configure run metadata for LangSmith tracing
        run_config = RunnableConfig(
            run_name="ifrs17_rag_response",
            tags=["ifrs17", question_type, "streaming"],
            metadata={
                "conversation_id": conversation_id,
                "question_type": question_type,
                "doc_count": len(documents),
                "history_length": len(chat_history),
                "run_id": run_id
            }
        )
        
        async for chunk in chain.astream(
            {"context": context, "question": question},
            config=run_config
        ):
            if chunk.content:
                response_content += chunk.content
                yield f"data: {json.dumps({'type': 'token', 'content': chunk.content})}\n\n"
        
        # Generate TL;DR summary for long responses
        summary_result = await generate_response_summary(response_content, question)
        if summary_result.get("should_show") and summary_result.get("key_points"):
            yield f"data: {json.dumps({'type': 'summary', 'summary': {'key_points': summary_result['key_points'], 'word_count': summary_result.get('word_count', 0)}})}\n\n"
        
        # Generate dynamic follow-up questions using LLM (with game context)
        suggested_topics = await generate_dynamic_followup_questions(question, response_content, game_context)
        if suggested_topics:
            yield f"data: {json.dumps({'type': 'suggested_topics', 'topics': suggested_topics})}\n\n"
        
        # Send completion signal
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
        
    except Exception as e:
        logger.error(f"Error in streaming response: {e}")
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
