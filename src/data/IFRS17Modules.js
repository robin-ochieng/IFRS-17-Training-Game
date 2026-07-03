// src/data/IFRS17Modules.js
// GENERATED FILE — do not hand-edit.
// Source of truth: questions/ifrs17_questions_choices_explanations excel database.csv
// Regenerate with: npm run generate:questions
export const modules = [
  {
    title: "IFRS 17 Fundamentals",
    icon: "📚",
    color: "from-blue-500 to-blue-600",
    questions: [
      {
        question: "What is the primary objective of IFRS 17?",
        options: [
          "To standardize insurance accounting globally",
          "To replace IFRS 16",
          "To define financial instruments",
          "To measure investment property"
        ],
        correct: 0,
        explanation: "IFRS 17 aims to create a consistent accounting framework for insurance contracts to improve transparency and comparability.",
        difficulty: "beginner"
      },
      {
        question: "Who introduced IFRS 17?",
        options: [
          "Financial Accounting Standards Board (FASB)",
          "International Actuarial Association (IAA)",
          "International Monetary Fund (IMF)",
          "International Accounting Standards Board (IASB)"
        ],
        correct: 3,
        explanation: "IFRS 17 was introduced by the IASB, the body responsible for IFRS standards.",
        difficulty: "beginner"
      },
      {
        question: "What does IFRS 17 replace?",
        options: [
          "IAS 37",
          "IFRS 4",
          "IFRS 9",
          "IAS 40"
        ],
        correct: 1,
        explanation: "IFRS 17 replaced IFRS 4, which was an interim standard.",
        difficulty: "beginner"
      },
      {
        question: "Which of the following was a key limitation of IFRS 4 that IFRS 17 aimed to address?",
        options: [
          "Lack of disclosure requirements",
          "Absence of actuarial involvement",
          "Inconsistent measurement of insurance contracts across entities",
          "Over-reliance on fair value"
        ],
        correct: 2,
        explanation: "Under IFRS 4, insurers used different measurement bases depending on local practices. IFRS 17 introduced a consistent measurement framework.",
        difficulty: "beginner"
      },
      {
        question: "What was the official date of initial application for IFRS 17?",
        options: [
          "1st January 2022",
          "31st December 2022",
          "1st January 2023",
          "1st January 2021"
        ],
        correct: 2,
        explanation: "The initial application date for IFRS 17 was 1st January 2023.",
        difficulty: "beginner"
      },
      {
        question: "What does IFRS 17 apply to?",
        options: [
          "All insurance entities only",
          "Any entity issuing insurance contracts",
          "Reinsurers only",
          "Investment banks only"
        ],
        correct: 1,
        explanation: "This reflects IFRS 17's scope, which applies to any entity that issues insurance contracts.",
        difficulty: "beginner"
      },
      {
        question: "How does IFRS 17 define an insurance contract?",
        options: [
          "Contract transferring insurance risk",
          "Contract transferring investment risk",
          "Contract transferring liquidity risk",
          "Contract for investment advice"
        ],
        correct: 0,
        explanation: "This captures the essential element of IFRS 17: transferring insurance risk from policyholder to insurer.",
        difficulty: "standard"
      },
      {
        question: "How does IFRS 17 define 'insurance risk'?",
        options: [
          "The risk of policyholder default",
          "The risk of future investment losses",
          "The risk transferred from the policyholder to the insurer due to uncertain future events",
          "Exchange rate risk"
        ],
        correct: 2,
        explanation: "Insurance risk under IFRS 17 involves uncertainty about future events that may trigger insurer payment.",
        difficulty: "standard"
      },
      {
        question: "Which of the following contracts falls under the scope of IFRS 17?",
        options: [
          "Product warranty issued by a retailer",
          "Lease contract under IFRS 16",
          "Financial guarantee contract under IFRS 9",
          "Reinsurance contract held by an insurer"
        ],
        correct: 3,
        explanation: "Reinsurance contracts held are explicitly included under IFRS 17's scope.",
        difficulty: "standard"
      },
      {
        question: "Which contracts are only within IFRS 17 if the issuer also issues insurance contracts?",
        options: [
          "Leases",
          "Derivatives",
          "Term Deposits",
          "Investment contracts with discretionary participation features"
        ],
        correct: 3,
        explanation: "These contracts are only within the scope of IFRS 17 if issued by entities that also issue insurance contracts.",
        difficulty: "standard"
      },
      {
        question: "Are product warranties issued by a retailer within IFRS 17?",
        options: [
          "Yes, always",
          "No, they fall under IAS 37",
          "Only for 12-month terms",
          "Yes, if embedded in insurance"
        ],
        correct: 1,
        explanation: "Retail product warranties are covered by IAS 37, not IFRS 17.",
        difficulty: "standard"
      },
      {
        question: "What type of contract is explicitly excluded from IFRS 17 scope?",
        options: [
          "Group life insurance",
          "Reinsurance contracts",
          "Insurance-linked investments",
          "Financial guarantees (under IFRS 9)"
        ],
        correct: 3,
        explanation: "Financial guarantee contracts are usually treated under IFRS 9 unless specifically designated as insurance.",
        difficulty: "standard"
      },
      {
        question: "Fixed-fee service contracts may be accounted for under IFRS 15 instead of IFRS 17 when",
        options: [
          "Payments are made in cash",
          "The price reflects individual customer risk",
          "Compensation is provided through services and insurance risk arises mainly from service usage",
          "The contract includes discretionary bonuses"
        ],
        correct: 2,
        explanation: "IFRS 15 may be applied when the contract is service-oriented, fixed-fee, and insurance risk arises mainly from service usage rather than cost uncertainty.",
        difficulty: "standard"
      },
    ]
  },
  {
    title: "Combination & Separation of Insurance Contracts",
    icon: "🎯",
    color: "from-purple-500 to-purple-600",
    questions: [
      {
        question: "Which contracts are within the scope of IFRS 17?",
        options: [
          "Only life insurance contracts",
          "Only property and casualty insurance",
          "Insurance contracts, reinsurance contracts, and investment contracts with DPF",
          "Banking products only"
        ],
        correct: 2,
        explanation: "IFRS 17 covers insurance contracts issued, reinsurance held, and investment contracts with discretionary participation features.",
        difficulty: "standard"
      },
      {
        question: "When should an insurance contract be recognized?",
        options: [
          "When the contract is signed",
          "At the beginning of coverage period, when first payment is due, or when onerous",
          "Only when claims are made",
          "At the end of the coverage period"
        ],
        correct: 1,
        explanation: "Recognition occurs at the earliest of: coverage beginning, first payment due, or when a group becomes onerous.",
        difficulty: "standard"
      },
      {
        question: "What is a 'portfolio' under IFRS 17?",
        options: [
          "All contracts in the company",
          "Contracts subject to similar risks and managed together",
          "Only profitable contracts",
          "Contracts from the same year"
        ],
        correct: 1,
        explanation: "A portfolio comprises contracts with similar risks that are managed together.",
        difficulty: "standard"
      },
      {
        question: "An insurer enters into two separate contracts with the same policyholder at the same time. Contract A provides insurance coverage, while Contract B negates the financial exposure of Contract A entirely. According to IFRS 17, how should the insurer report these contracts?",
        options: [
          "Treat the contracts as a single arrangement because they achieve an overall commercial effect",
          "Report both contracts separately as independent arrangements",
          "Recognize only Contract A since it was issued first",
          "Disclose both contracts but report them under IFRS 9"
        ],
        correct: 0,
        explanation: "When contracts are designed to achieve an overall commercial effect (such as one negating the obligations of another), IFRS 17 requires treating them as a single arrangement to reflect the economic substance.",
        difficulty: "expert"
      },
      {
        question: "An insurer bundles multiple policies for a corporate client into a package with interdependent pricing. Some policies provide coverage, while others hedge specific risks associated with the insured entity. Under IFRS 17, how should these contracts be accounted for?",
        options: [
          "Each contract must be evaluated individually regardless of interdependencies",
          "The bundled contracts should be treated as a single unit if they collectively achieve an overall commercial effect",
          "Contracts should be separated since they have different durations",
          "Each contract should be reported based on legal form rather than economic substance"
        ],
        correct: 1,
        explanation: "IFRS 17 mandates that contracts designed to work together as a package with shared pricing or risk mitigation should be combined to reflect their true economic impact.",
        difficulty: "expert"
      },
      {
        question: "Which of the following scenarios would not require the combination of contracts under IFRS 17?",
        options: [
          "Two insurance contracts issued simultaneously to the same policyholder, with pricing designed to work together",
          "A reinsurance contract that fully offsets the risk of an insurance policy issued by the same insurer",
          "An insurance contract and an investment product sold separately with no dependency in pricing or risk",
          "A life insurance contract and a rider that cancels all coverage in the main policy"
        ],
        correct: 2,
        explanation: "If contracts have no interdependent pricing or risk structure, they do not need to be combined under IFRS 17. Separation is appropriate in such cases.",
        difficulty: "expert"
      },
      {
        question: "A life insurer offers a package where a main policy includes both insurance coverage and an investment component. The investment feature provides financial returns that could exist independently without the insurance portion. How should the insurer treat this arrangement under IFRS 17?",
        options: [
          "Recognize it as a single insurance contract",
          "Treat the entire contract under IFRS 9",
          "Combine the investment component only if it exceeds 50% of total premiums",
          "Separate the investment component if it can be sold independently"
        ],
        correct: 3,
        explanation: "IFRS 17 requires separating investment components if they can function independently, ensuring accurate financial reporting.",
        difficulty: "expert"
      },
      {
        question: "An insurer issues two separate policies to the same corporate client—one covering property damage and another covering business interruption losses linked to that property. The premiums are interdependent and structured as a bundle to provide a cohesive risk solution. What is the appropriate IFRS 17 treatment?",
        options: [
          "The contracts should always be separated",
          "The contracts should be combined if pricing is interdependent",
          "The contracts must be accounted for under IFRS 9",
          "The contracts should be combined only if policyholders request it"
        ],
        correct: 1,
        explanation: "IFRS 17 requires combining contracts that are designed to function together commercially, particularly if pricing reflects mutual risk dependencies.",
        difficulty: "expert"
      },
      {
        question: "When an insurance contract contains a distinct investment component, how should it be treated under IFRS 17?",
        options: [
          "Included in insurance revenue",
          "Separated and accounted for under IFRS 9",
          "Reported as part of the contractual service margin",
          "Disclosed only in the notes to financial statements"
        ],
        correct: 1,
        explanation: "IFRS 17 requires separating investment components if they can function independently, ensuring accurate financial reporting.",
        difficulty: "standard"
      },
      {
        question: "Which factor is most relevant in determining whether contracts should be combined under IFRS 17?",
        options: [
          "Identical premium amounts",
          "Same reporting period",
          "Negotiated together with the same counterparty",
          "Similar types of risk coverage"
        ],
        correct: 2,
        explanation: "IFRS 17 requires separating investment components if they can function independently, ensuring accurate financial reporting.",
        difficulty: "standard"
      },
      {
        question: "Which of the following is not a reason to separate components of an insurance contract under IFRS 17",
        options: [
          "Presence of a distinct service component",
          "Presence of a distinct investment component",
          "To comply with regulatory capital requirements",
          "Presence of a distinct performance obligation outside insurance coverage"
        ],
        correct: 2,
        explanation: "IFRS 17 requires separating investment components if they can function independently, ensuring accurate financial reporting.",
        difficulty: "standard"
      },
    ]
  },
  {
    title: "Level of Aggregation",
    icon: "📊",
    color: "from-green-500 to-green-600",
    questions: [
      {
        question: "What is the main purpose of aggregation under IFRS 17?",
        options: [
          "To reduce the number of contracts reported",
          "To ensure accurate timing of profit and loss recognition",
          "To make contract management easier",
          "To avoid having to assess individual contracts"
        ],
        correct: 1,
        explanation: "Aggregation helps ensure that profits and losses are recognized accurately and consistently in financial reporting.",
        difficulty: "beginner"
      },
      {
        question: "Which of the following best describes the “level of aggregation” under IFRS 17?",
        options: [
          "Grouping all insurance contracts into a single portfolio for simplicity",
          "Grouping contracts by portfolio, expected profitability, and issue date to measure them consistently",
          "Aggregating only contracts with similar premiums",
          "Aggregating contracts only for reporting purposes"
        ],
        correct: 1,
        explanation: "Level of aggregation ensures contracts with similar risk and profitability characteristics are grouped for consistent measurement.",
        difficulty: "beginner"
      },
      {
        question: "Under IFRS 17, contracts grouped into the same portfolio must share:",
        options: [
          "The same inception date",
          "The same profit margin",
          "The same policyholder",
          "Similar risk characteristics and management structure"
        ],
        correct: 3,
        explanation: "Portfolios are formed based on risk similarity and being managed together.",
        difficulty: "beginner"
      },
      {
        question: "How far apart can contract issuance dates be within the same group?",
        options: [
          "Any number of years",
          "Two years",
          "Not more than one year",
          "Three years if risk is similar"
        ],
        correct: 2,
        explanation: "IFRS 17 requires that all contracts in a group are issued no more than one year apart.",
        difficulty: "standard"
      },
      {
        question: "IFRS 17 allows contracts to be grouped together if they are issued within a short period. What is the main reason for this time restriction?",
        options: [
          "To simplify accounting for all contracts issued in a year",
          "To ensure that contracts written at different times but with similar risks are assessed for expected profitability consistently",
          "To allow the insurer to change discount rates mid-year",
          "To reduce the number of groups for regulatory reporting"
        ],
        correct: 1,
        explanation: "The short-period restriction ensures contracts issued close together are grouped so that expected profitability and risk assumptions are applied consistently within the group.",
        difficulty: "standard"
      },
      {
        question: "Under IFRS 17, how are contracts issued at different times but in the same portfolio treated?",
        options: [
          "They must always be grouped together regardless of issue date",
          "Each contract is always measured individually",
          "Grouping depends solely on profitability",
          "They can be grouped if issued within a 12-month period and otherwise meet portfolio criteria"
        ],
        correct: 3,
        explanation: "Contracts can be grouped if issued within a short period (typically 12 months) and belong to the same portfolio with similar risks.",
        difficulty: "standard"
      },
      {
        question: "What is the first step in the aggregation process under IFRS 17?",
        options: [
          "Grouping by issuance year",
          "Subdividing portfolios",
          "Grouping by portfolio",
          "Assessing profitability"
        ],
        correct: 2,
        explanation: "Aggregation begins by forming portfolios based on similar risks and management structures.",
        difficulty: "standard"
      },
      {
        question: "Under IFRS 17, why are insurers not allowed to reassess contract groups after initial recognition?",
        options: [
          "To maintain consistency and transparency in reporting",
          "To reduce workload",
          "To allow for more flexibility later",
          "Because contracts cannot change after issuance"
        ],
        correct: 0,
        explanation: "Fixing the groupings at initial recognition supports consistent, unbiased financial reporting over time.",
        difficulty: "standard"
      },
      {
        question: "How does IFRS 17 recommend handling groups of contracts under the Premium Allocation Approach (PAA)?",
        options: [
          "Assume they are always profitable",
          "Assume all contracts are onerous",
          "Group them based on product type only",
          "Assume none are onerous at initial recognition unless facts suggest otherwise"
        ],
        correct: 3,
        explanation: "IFRS 17 allows insurers applying the PAA to assume contracts are not onerous at initial recognition, unless evidence indicates otherwise.",
        difficulty: "standard"
      },
      {
        question: "Which of the following is true regarding contracts measured under the Premium Allocation Approach (PAA)?",
        options: [
          "PAA contracts are grouped by portfolio and expected profitability, but timing of cash flows is simplified",
          "They are always grouped with General Measurement Model (GMM) contracts",
          "PAA contracts are measured individually without any aggregation",
          "Onerous assessment is not required for PAA contracts"
        ],
        correct: 0,
        explanation: "PAA simplifies measurement but aggregation rules still apply, contracts are grouped by portfolio, expected profitability, and issue date, with simplified cash flow assumptions.",
        difficulty: "expert"
      },
      {
        question: "What additional check must be done for policies eligible for the General Measurement Model (GMM)?",
        options: [
          "Verification of market premium rates",
          "Sensitivity testing and internal report reviews",
          "Reinsurance matching",
          "Underwriter interviews"
        ],
        correct: 1,
        explanation: "Sensitivity testing and internal reporting are used to confirm profitability assumptions for GMM-eligible contracts.",
        difficulty: "expert"
      },
      {
        question: "Which of the following best describes a 'portfolio' under IFRS 17?",
        options: [
          "A collection of policies sold by one agent",
          "Contracts grouped based on risk and management similarity",
          "Contracts grouped by coverage period",
          "All insurance contracts issued in one year"
        ],
        correct: 1,
        explanation: "A portfolio consists of contracts that have similar risk characteristics and are managed together.",
        difficulty: "beginner"
      },
      {
        question: "What should an entity use to assess whether a contract might become onerous later?",
        options: [
          "Market interest rates",
          "Past claims history only",
          "Likelihood of changes in applicable facts and circumstances",
          "Broker recommendations"
        ],
        correct: 2,
        explanation: "Entities must consider whether new or changing circumstances might render a contract onerous in the future.",
        difficulty: "expert"
      },
      {
        question: "What happens if a contract becomes onerous after initial recognition?",
        options: [
          "The group composition remains unchanged",
          "It is moved to the 'onerous' group retroactively",
          "The contract is cancelled",
          "A new group is created"
        ],
        correct: 0,
        explanation: "Group compositions are fixed at initial recognition, even if a contract’s status changes later.",
        difficulty: "expert"
      },
      {
        question: "For contracts in the same portfolio, IFRS 17 allows groups to be re-evaluated in specific circumstances. Which scenario permits such a reassessment?",
        options: [
          "If new contracts are issued in the same portfolio after the initial recognition period",
          "If the insurer changes its discount rate assumptions",
          "IFRS 17 does not allow reassessment of groups after initial recognition",
          "If management wants to offset new losses against existing profits"
        ],
        correct: 2,
        explanation: "Once a group is formed at initial recognition, it cannot be reassessed, ensuring that expected profits and losses are not manipulated post-recognition.",
        difficulty: "expert"
      },
      {
        question: "What is the maximum number of groups required per portfolio under IFRS 17?",
        options: [
          "2",
          "3",
          "4",
          "Unlimited"
        ],
        correct: 1,
        explanation: "Each portfolio must be split into at least three groups: onerous, no significant risk, and others.",
        difficulty: "beginner"
      },
      {
        question: "Why does IFRS 17 prohibit grouping profitable and onerous contracts together?",
        options: [
          "To simplify actuarial modeling",
          "To reduce disclosure requirements",
          "To align with tax reporting",
          "To ensure transparent loss recognition"
        ],
        correct: 3,
        explanation: "Mixing would obscure losses from onerous contracts.",
        difficulty: "beginner"
      },
      {
        question: "How does the level of aggregation affect disclosure requirements?",
        options: [
          "It increases transparency in reporting",
          "It reduces disclosure requirements",
          "It eliminates disclosure requirements",
          "It allows insurers to choose disclosure freely"
        ],
        correct: 0,
        explanation: "Aggregation ensures clear disclosure of profitability and risk.",
        difficulty: "beginner"
      },
      {
        question: "What is the definition of a “group of insurance contracts” under IFRS 17?",
        options: [
          "Contracts grouped by distribution channel",
          "Contracts grouped by issuance date only",
          "Contracts grouped by profitability and risk characteristics within a portfolio",
          "Contracts grouped by policyholder demographics"
        ],
        correct: 2,
        explanation: "A group is the subdivision of a portfolio based on profitability and risk, ensuring consistent measurement",
        difficulty: "beginner"
      },
      {
        question: "What is the first distinction made when grouping contracts under IFRS 17?",
        options: [
          "By distribution channel",
          "By profitability (onerous vs. non?onerous)",
          "By policyholder age",
          "By issuance date"
        ],
        correct: 1,
        explanation: "The first subdivision of a portfolio is based on whether contracts are onerous, have no significant risk of becoming onerous, or are other profitable contracts",
        difficulty: "beginner"
      },
      {
        question: "When determining groups at initial recognition, how should expected profitability be assessed?",
        options: [
          "Using prior year averages",
          "Using actual results only",
          "Using unbiased, probability?weighted future cash flow estimates",
          "Using management’s best case scenario"
        ],
        correct: 2,
        explanation: "Grouping hinges on forward?looking, unbiased, probability?weighted estimates of future cash flows to identify onerous vs. profitable groups.",
        difficulty: "expert"
      },
      {
        question: "How does the level of aggregation influence the allocation and release of the risk adjustment?",
        options: [
          "It is measured and released at the group level reflecting uncertainty in fulfilment cash flows",
          "It is allocated at the entity level and released uniformly",
          "It is determined at the portfolio level and released by line of business",
          "It is only relevant for onerous groups"
        ],
        correct: 0,
        explanation: "The risk adjustment is measured at the group level and released over time to reflect non?financial risk inherent in each group’s fulfilment cash flows.",
        difficulty: "expert"
      },
      {
        question: "Under the General Measurement Model (GMM), how does aggregation affect the contractual service margin (CSM)?",
        options: [
          "CSM is measured per contract and aggregated later",
          "CSM is measured and tracked at the group level and released with coverage units",
          "CSM is optional for profitable groups",
          "CSM is released only at portfolio level"
        ],
        correct: 1,
        explanation: "CSM is a group?level measure; its release pattern follows coverage units for that group, directly tying profit recognition to service provided.",
        difficulty: "expert"
      },
      {
        question: "How should reinsurance contracts held be grouped relative to underlying direct insurance contracts?",
        options: [
          "Combined with the direct insurance groups",
          "Grouped by the cedant’s distribution channel",
          "Grouped separately under IFRS 17 with their own profitability assessment",
          "Grouped only by inception date across all lines"
        ],
        correct: 2,
        explanation: "Reinsurance contracts held are accounted for separately from direct insurance, with their own portfolios and groups based on expected profitability.",
        difficulty: "expert"
      },
      {
        question: "How does the one?year issuance rule interact with the recognition of the contractual service margin (CSM)?",
        options: [
          "It has no impact on CSM",
          "It allows CSM to be aggregated across multiple years",
          "It eliminates the need for CSM in short?term contracts",
          "It ensures CSM is tracked separately for groups issued in different annual cohorts"
        ],
        correct: 3,
        explanation: "Because contracts issued more than one year apart must be in separate groups, the CSM is recognized and released separately for each annual cohort, preventing cross?subsidization of profitability across different issuance periods.",
        difficulty: "expert"
      },
    ]
  },
  {
    title: "Recognition of Insurance Contracts",
    icon: "📏",
    color: "from-red-500 to-red-600",
    questions: [
      {
        question: "At what point does an insurance contract qualify for recognition under IFRS 17?",
        options: [
          "When the premium is fully paid",
          "When the contract creates enforceable rights and obligations",
          "When the contract us approved by management",
          "When the policy document is issued to the policyholder"
        ],
        correct: 1,
        explanation: "Under IFRS 17, an insurance contract exists once it creates enforceable rights and obligations between the insurer and the policyholder. Recognition is not dependent on premium payment, management approval, or physical issuance of policy documents. The key criterion is enforceability.",
        difficulty: "beginner"
      },
      {
        question: "When must a group of insurance contracts be recognized under IFRS 17?",
        options: [
          "At the end of the reporting period",
          "When the last payment is received",
          "When the policyholder signs the contract",
          "At the earliest of the coverage period start, first payment due, or when the group becomes onerous"
        ],
        correct: 3,
        explanation: "IFRS 17 requires recognition at the earliest of these three trigger events.",
        difficulty: "beginner"
      },
      {
        question: "If there is no contractual due date for the first payment, when is it considered due?",
        options: [
          "At the end of the month",
          "When it is received",
          "After coverage starts",
          "When billed"
        ],
        correct: 1,
        explanation: "IFRS 17 states that if no due date is set, the payment is considered due when received.",
        difficulty: "beginner"
      },
      {
        question: "When should an insurer assess if a contract is onerous?",
        options: [
          "After recognition",
          "Before the earlier of coverage start or payment due",
          "At the end of the financial year",
          "Only when a loss is reported"
        ],
        correct: 1,
        explanation: "The standard requires a pre-recognition assessment if there's an indication of onerousness.",
        difficulty: "standard"
      },
      {
        question: "Does IFRS 17 permit recognition of insurance contracts before they are issued?",
        options: [
          "No, recognition cannot occur before issuance",
          "Yes, if the premiums are measurable",
          "Yes, if the contract is expected to be profitable",
          "Only for reinsurance contracts"
        ],
        correct: 0,
        explanation: "IFRS 17 explicitly prohibits recognition of insurance contracts before the issue date. Even if future premiums and cash flows can be estimated, the contract cannot be recognised until it has been issued and enforceable rights and obligations exist.",
        difficulty: "standard"
      },
      {
        question: "What is the impact of recognition timing on insurance acquisition cash flows (IACFs)?",
        options: [
          "IACFs are always expensed immediately, regardless of timing",
          "Recognition timing determines whether IACFs are deferred or expensed",
          "Recognition timing only affects disclosure, not measurement",
          "IACFs are recognised only when claims are paid"
        ],
        correct: 1,
        explanation: "The timing of initial recognition determines whether insurance acquisition cash flows are capitalised as an asset and allocated to contract groups, or expensed immediately. Incorrect recognition timing can therefore lead to misstated profits and assets.",
        difficulty: "standard"
      },
      {
        question: "What is the treatment if IACFs are not immediately expensed?",
        options: [
          "They are recognized as an asset or liability",
          "They are deferred revenue",
          "They are added to the CSM",
          "They are amortized over the contract term"
        ],
        correct: 0,
        explanation: "IACFs are treated separately until the related group is recognized.",
        difficulty: "expert"
      },
      {
        question: "When is the acquisition asset or liability removed from the books?",
        options: [
          "When the last premium is received",
          "When the policyholder cancels",
          "When the related group of contracts is recognized",
          "At the year-end"
        ],
        correct: 2,
        explanation: "The asset or liability is derecognized at the point of group recognition.",
        difficulty: "standard"
      },
      {
        question: "What is the condition for including a contract in a group?",
        options: [
          "It must be active",
          "It must be issued by the end of the reporting period",
          "It must be profitable",
          "It must be short-term"
        ],
        correct: 1,
        explanation: "Only contracts issued by the end of the reporting period are included.",
        difficulty: "beginner"
      },
      {
        question: "What happens if new contracts added to a group affect the discount rate?",
        options: [
          "The rate must be updated and applied from the start of the reporting period",
          "Nothing changes",
          "It only applies to new contracts",
          "The group must be split"
        ],
        correct: 0,
        explanation: "The standard requires adjusting the initial discount rate retroactively to the start of the reporting period.",
        difficulty: "expert"
      },
      {
        question: "Which of the following is TRUE regarding onerous contracts?",
        options: [
          "They must be recognized immediately",
          "They are ignored under IFRS 17",
          "They are grouped with profitable contracts",
          "They are only assessed annually"
        ],
        correct: 0,
        explanation: "Onerous groups must be recognized as soon as they become onerous.",
        difficulty: "expert"
      },
      {
        question: "How often can the discount rate be changed for a group?",
        options: [
          "Monthly",
          "Only if new contracts are added that change it",
          "Once a year",
          "Never"
        ],
        correct: 1,
        explanation: "The rate is updated only if new contracts added after the reporting period affect it.",
        difficulty: "standard"
      },
      {
        question: "Why is the initial recognition timing important under IFRS 17?",
        options: [
          "It helps identify reinsurers",
          "It is used to calculate tax",
          "It helps with customer satisfaction",
          "It determines when revenue and expenses are recorded"
        ],
        correct: 3,
        explanation: "Proper timing ensures that revenue, risk, and costs are reported accurately.",
        difficulty: "beginner"
      },
      {
        question: "How can delayed initial recognition of a contract affect the identification of onerous groups?",
        options: [
          "It has no effect, as onerous assessment is only done annually",
          "It reduces the likelihood of contracts being onerous",
          "It only affects discount rates, not profitability",
          "It can delay or distort the identification of loss-making contracts"
        ],
        correct: 3,
        explanation: "Onerous assessments are performed at initial recognition. Delaying recognition may postpone or distort the assessment of expected profitability, potentially delaying loss recognition and undermining the objective of timely and transparent financial reporting under IFRS 17.",
        difficulty: "expert"
      },
      {
        question: "Some contracts in a portfolio are borderline profitable at initial recognition. How should IFRS 17 treat them?",
        options: [
          "Include in the profitable group automatically",
          "Include in the onerous group",
          "Group separately to assess for onerousness",
          "Exclude until actual cash flows are observed"
        ],
        correct: 2,
        explanation: "Borderline contracts must be grouped separately to assess if they are onerous, ensuring expected losses are recognised timely.",
        difficulty: "expert"
      },
      {
        question: "When does an insurer first apply IFRS 17 recognition rules to a contract?",
        options: [
          "At the signing of the policy application",
          "When the contract meets the definition of an insurance contract",
          "When the insurer receives regulatory approval",
          "At the end of the reporting period"
        ],
        correct: 1,
        explanation: "Recognition begins when a contract meets the definition of an insurance contract under IFRS 17, not merely at application or regulatory approval.",
        difficulty: "beginner"
      },
      {
        question: "What is the minimum unit of account for recognition under IFRS 17?",
        options: [
          "Individual policyholder",
          "Portfolio of contracts",
          "Group of contracts",
          "Entire insurance company"
        ],
        correct: 2,
        explanation: "IFRS 17 requires recognition at the group of contracts level, which is the minimum unit of account.",
        difficulty: "beginner"
      },
      {
        question: "Which of the following is considered at recognition?",
        options: [
          "Fulfilment cash flows and contractual service margin (CSM)",
          "Expected future cash flows only",
          "Discount rates only",
          "Premium allocation approach only"
        ],
        correct: 0,
        explanation: "At recognition, insurers measure fulfilment cash flows and establish the contractual service margin (CSM).",
        difficulty: "beginner"
      },
      {
        question: "What is the role of the portfolio definition in recognition?",
        options: [
          "It determines the reporting currency",
          "It defines contracts subject to similar risks and managed together",
          "It sets the discount rate",
          "It determines acquisition cash flows"
        ],
        correct: 1,
        explanation: "A portfolio groups contracts subject to similar risks and managed together, forming the basis for recognition.",
        difficulty: "beginner"
      },
      {
        question: "Which recognition principle applies to short-duration contracts under IFRS 17?",
        options: [
          "They are exempt from recognition",
          "They are recognized only at maturity",
          "They are recognized only if onerous",
          "They must be recognized using the premium allocation approach (PAA) if eligible"
        ],
        correct: 3,
        explanation: "Short-duration contracts may use the PAA if eligibility criteria are met, simplifying recognition.",
        difficulty: "beginner"
      },
      {
        question: "How does IFRS 17 treat contracts with coverage starting after the reporting date?",
        options: [
          "They are recognized immediately",
          "They are recognized only when coverage begins",
          "They are recognized when the first premium is due",
          "They are recognized when the insurer becomes party to the contract"
        ],
        correct: 3,
        explanation: "Recognition occurs when the insurer becomes party to the contract, even if coverage starts later.",
        difficulty: "expert"
      },
      {
        question: "What happens if recognition timing results in a negative contractual service margin (CSM)?",
        options: [
          "The CSM is deferred until profitability improves",
          "The contract is classified as onerous immediately",
          "The CSM is adjusted to zero",
          "The insurer can delay recognition"
        ],
        correct: 1,
        explanation: "A negative CSM means the contract is onerous and must be recognized as a loss immediately.",
        difficulty: "expert"
      },
      {
        question: "How does IFRS 17 handle recognition of reinsurance contracts held?",
        options: [
          "Same timing as direct insurance contracts",
          "Only when ceded premiums are paid",
          "When the reinsurance contract is signed",
          "At the end of the reporting period"
        ],
        correct: 0,
        explanation: "Reinsurance contracts held follow the same recognition timing rules as direct insurance contracts.",
        difficulty: "expert"
      },
      {
        question: "If a contract is recognized late, what is the impact on the contractual service margin (CSM)?",
        options: [
          "No impact",
          "It may distort the allocation of CSM across coverage periods",
          "It increases the CSM automatically",
          "It eliminates the need for CSM"
        ],
        correct: 1,
        explanation: "Late recognition can distort the allocation of CSM, affecting profit emergence across coverage periods.",
        difficulty: "expert"
      },
      {
        question: "Under IFRS 17, how should recognition timing interact with risk adjustment measurement?",
        options: [
          "Risk adjustment is ignored at recognition",
          "Risk adjustment is deferred until claims arise",
          "Risk adjustment is applied only to onerous contracts",
          "Risk adjustment is measured at recognition alongside fulfilment cash flows"
        ],
        correct: 3,
        explanation: "At recognition, insurers measure risk adjustment together with fulfilment cash flows to reflect uncertainty in cash flows.",
        difficulty: "expert"
      },
    ]
  },
  {
    title: "Measurement on Initial Recognition",
    icon: "🔒",
    color: "from-yellow-500 to-yellow-600",
    questions: [
      {
        question: "Which of the following is NOT a component of fulfilment cash flows?",
        options: [
          "Future cash flows",
          "Discount rate",
          "Risk adjustment",
          "Insurance acquisition commission bonus pool"
        ],
        correct: 3,
        explanation: "The bonus pool is not part of fulfilment cash flows. The correct components are expected cash flows, discounting, and risk adjustment.",
        difficulty: "beginner"
      },
      {
        question: "Which cash flows should be included in the measurement of the contract at initial recognition?",
        options: [
          "Past claims only",
          "Cash flows related to investment returns",
          "Future premiums and claim payments",
          "Marketing expenses"
        ],
        correct: 2,
        explanation: "Fulfilment cash flows include expected future premiums and claims.",
        difficulty: "beginner"
      },
      {
        question: "If the fulfilment cash flows are negative, what does IFRS 17 require?",
        options: [
          "Defer the difference",
          "Recognize a loss immediately",
          "Recognize a CSM",
          "Reduce the asset balance"
        ],
        correct: 1,
        explanation: "Negative fulfilment cash flows indicate an onerous contract and a loss is recognized in profit or loss.",
        difficulty: "standard"
      },
      {
        question: "What happens to a day 1 gain under IFRS 17?",
        options: [
          "Deferred in CSM",
          "Recognized as revenue",
          "Transferred to retained earnings",
          "Recorded as OCI"
        ],
        correct: 0,
        explanation: "CSM defers day 1 gains and recognizes them over the service period.",
        difficulty: "standard"
      },
      {
        question: "Why is discounting applied to future cash flows?",
        options: [
          "To increase liabilities",
          "To reflect time value of money",
          "To reduce reporting volatility",
          "To comply with IFRS 9"
        ],
        correct: 1,
        explanation: "Discounting reflects the time value of money.",
        difficulty: "beginner"
      },
      {
        question: "Which discount rate is used for initial measurement?",
        options: [
          "Zero coupon rate",
          "Locked in discount rate",
          "Market average rate",
          "Prime lending rate"
        ],
        correct: 1,
        explanation: "The locked in rate at initial recognition is used to discount fulfilment cash flows and accrete CSM.",
        difficulty: "standard"
      },
      {
        question: "Which cost is not included in initial measurement?",
        options: [
          "Direct acquisition costs",
          "Expected claims",
          "Indirect administrative costs",
          "Risk adjustment"
        ],
        correct: 2,
        explanation: "Indirect administrative costs are excluded from initial measurement.",
        difficulty: "beginner"
      },
      {
        question: "Which cost is typically excluded from fulfilment cash flows?",
        options: [
          "Advertising and marketing",
          "Future claims",
          "Premiums",
          "Claim handling costs"
        ],
        correct: 0,
        explanation: "Marketing expenses are excluded under IFRS 17.",
        difficulty: "beginner"
      },
      {
        question: "Under which model is no CSM typically recognized?",
        options: [
          "GMM",
          "PAA",
          "VFA",
          "Modified GMM"
        ],
        correct: 1,
        explanation: "PAA does not require a CSM unless the contract is onerous.",
        difficulty: "standard"
      },
      {
        question: "Which of the following is a valid reason to apply the Premium Allocation Approach at initial recognition?",
        options: [
          "It results in higher revenue",
          "The contract has a coverage period of more than one year",
          "The simplification does not significantly differ from GMM results",
          "It avoids recognition of acquisition costs"
        ],
        correct: 2,
        explanation: "PAA is permitted where results do not materially differ from GMM.",
        difficulty: "expert"
      },
      {
        question: "Which component reflects non financial risk?",
        options: [
          "Discount rate",
          "Risk adjustment",
          "CSM",
          "OCI"
        ],
        correct: 1,
        explanation: "Risk adjustment captures uncertainty in non financial risks.",
        difficulty: "beginner"
      },
      {
        question: "Which standard governs insurance contract accounting?",
        options: [
          "IFRS 9",
          "IFRS 15",
          "IFRS 17",
          "IAS 37"
        ],
        correct: 2,
        explanation: "IFRS 17 applies to insurance contracts.",
        difficulty: "beginner"
      },
      {
        question: "Which element prevents recognition of upfront profits?",
        options: [
          "Discount rate",
          "Fulfilment cash flows",
          "Risk adjustment",
          "CSM"
        ],
        correct: 3,
        explanation: "CSM defers unearned profit.",
        difficulty: "standard"
      },
      {
        question: "Which contracts are excluded from IFRS 17?",
        options: [
          "Short term insurance",
          "Significant risk contracts",
          "Manufacturer warranties",
          "Life insurance"
        ],
        correct: 2,
        explanation: "Manufacturer warranties are scoped out.",
        difficulty: "standard"
      },
      {
        question: "What assessment is required to apply PAA?",
        options: [
          "Premium adequacy",
          "Coverage less than one year",
          "Material difference from GMM",
          "Acquisition cost deferral"
        ],
        correct: 2,
        explanation: "PAA eligibility requires comparison to GMM.",
        difficulty: "expert"
      },
      {
        question: "What triggers initial recognition of an insurance contract under IFRS 17",
        options: [
          "Receipt of first premium",
          "When the entity becomes party to the contract",
          "When the first claim occurs",
          "When the policy document is issued"
        ],
        correct: 1,
        explanation: "Initial recognition occurs when the insurer has substantive rights and obligations under the contract",
        difficulty: "beginner"
      },
      {
        question: "Which of the following best describes fulfilment cash flows",
        options: [
          "Statutory reserves required by regulators",
          "Present value of expected future cash inflows and outflows",
          "Total premiums received",
          "Claims paid to date"
        ],
        correct: 1,
        explanation: "Fulfilment cash flows represent current estimates of future obligations",
        difficulty: "beginner"
      },
      {
        question: "What is the main role of the contractual service margin at initial recognition",
        options: [
          "To measure expected claims",
          "To represent unearned profit",
          "To calculate discount rates",
          "To measure investment income"
        ],
        correct: 1,
        explanation: "CSM represents profit that will be recognised as services are provided",
        difficulty: "beginner"
      },
      {
        question: "Which statement best describes the objective of initial measurement",
        options: [
          "To determine fair value of contracts",
          "To establish current estimates and defer profit",
          "To maximise reported equity",
          "To match premiums with cash flows"
        ],
        correct: 1,
        explanation: "Initial measurement reflects current assumptions and defers profit through CSM",
        difficulty: "beginner"
      },
      {
        question: "Which event occurs at initial recognition for a profitable group of contracts",
        options: [
          "Immediate profit recognition",
          "Creation of a contractual service margin",
          "Recognition of a loss component",
          "Transfer to OCI"
        ],
        correct: 1,
        explanation: "A CSM is established to defer profit for profitable groups",
        difficulty: "beginner"
      },
      {
        question: "Which condition must be satisfied for an insurance contract to be recognised under IFRS 17",
        options: [
          "The policyholder has paid the first premium",
          "The entity has substantive rights and obligations",
          "The contract is legally enforceable",
          "The contract transfers significant insurance risk"
        ],
        correct: 1,
        explanation: "Recognition is based on substantive rights and obligations, not cash flows",
        difficulty: "expert"
      },
      {
        question: "How are cash flows arising from embedded options within insurance contracts treated at initial recognition",
        options: [
          "Excluded from measurement",
          "Included within fulfilment cash flows",
          "Recognised separately under IFRS 9",
          "Recognised directly in equity"
        ],
        correct: 1,
        explanation: "Cash flows from embedded features within the contract boundary are included",
        difficulty: "expert"
      },
      {
        question: "Which statement best describes the treatment of future management actions at initial recognition",
        options: [
          "They are ignored",
          "They are included if the entity has the ability and intention to act",
          "They are recognised as separate assets",
          "They are deferred in OCI"
        ],
        correct: 1,
        explanation: "IFRS 17 includes realistic management actions in expected cash flows",
        difficulty: "expert"
      },
      {
        question: "What is the impact of changes in contract boundary assumptions at initial recognition",
        options: [
          "They adjust the contractual service margin",
          "They affect which cash flows are included",
          "They are recognised in profit or loss",
          "They are ignored for measurement"
        ],
        correct: 1,
        explanation: "Contract boundary determines the scope of included cash flows",
        difficulty: "expert"
      },
      {
        question: "Which principle ensures that insurance liabilities reflect unbiased current estimates",
        options: [
          "Conservatism principle",
          "Historical cost principle",
          "Best estimate principle",
          "Matching principle"
        ],
        correct: 2,
        explanation: "IFRS 17 requires unbiased probability weighted estimates",
        difficulty: "expert"
      },
    ]
  },
  {
    title: "Subsequent Measurement",
    icon: "🚀",
    color: "from-indigo-500 to-indigo-600",
    questions: [
      {
        question: "What does subsequent measurement refer to under IFRS 17?",
        options: [
          "Reassessment of reinsurance cash flows",
          "Update of contract liabilities after initial recognition",
          "Only incurred claims measurement",
          "Premium receipt testing"
        ],
        correct: 1,
        explanation: "Subsequent measurement updates insurance liabilities.",
        difficulty: "beginner"
      },
      {
        question: "A 4 year contract has CSM of 8000. How much is recognized per year?",
        options: [
          "2000 per year",
          "0 then 8000",
          "4000 then 1333",
          "8000 immediately"
        ],
        correct: 0,
        explanation: "CSM is recognized evenly over service.",
        difficulty: "standard"
      },
      {
        question: "How often are fulfilment cash flows updated?",
        options: [
          "Once a year",
          "Monthly",
          "At each reporting date",
          "Never"
        ],
        correct: 2,
        explanation: "Cash flows are updated each reporting period.",
        difficulty: "beginner"
      },
      {
        question: "How are claims incurred shown in financials?",
        options: [
          "In CSM",
          "In OCI",
          "In fulfilment cash flows",
          "In profit or loss"
        ],
        correct: 3,
        explanation: "Claims relating to past service are expensed.",
        difficulty: "beginner"
      },
      {
        question: "What causes a change in risk adjustment?",
        options: [
          "Interest rate changes",
          "Increase in past claims",
          "Change in uncertainty",
          "Capital movements"
        ],
        correct: 2,
        explanation: "Risk adjustment reflects uncertainty changes.",
        difficulty: "standard"
      },
      {
        question: "Which changes are excluded from adjusting CSM?",
        options: [
          "Future service estimates",
          "Time value updates",
          "Risk of lapses",
          "Policyholder behaviour"
        ],
        correct: 1,
        explanation: "Interest accretion is treated as finance income.",
        difficulty: "expert"
      },
      {
        question: "Which affects the Liability for Incurred Claims?",
        options: [
          "Future premiums",
          "Reinsurance commission",
          "Claims already incurred",
          "Profit emergence"
        ],
        correct: 2,
        explanation: "LIC relates to past claims.",
        difficulty: "beginner"
      },
      {
        question: "What does the Liability for Remaining Coverage include?",
        options: [
          "CSM plus premiums",
          "Fulfilment cash flows plus CSM",
          "Claims paid",
          "Gross income"
        ],
        correct: 1,
        explanation: "LRC relates to future coverage.",
        difficulty: "standard"
      },
      {
        question: "What does LIC capture?",
        options: [
          "Future claims",
          "Earned premiums",
          "Deferred acquisition costs",
          "Claims already incurred"
        ],
        correct: 3,
        explanation: "LIC reflects incurred obligations.",
        difficulty: "beginner"
      },
      {
        question: "What role does risk adjustment play?",
        options: [
          "Reduces cash flows",
          "Defers tax",
          "Adjusts for non financial risk uncertainty",
          "Ignores inflation"
        ],
        correct: 2,
        explanation: "Risk adjustment captures uncertainty.",
        difficulty: "standard"
      },
      {
        question: "Which component represents unearned profit?",
        options: [
          "LIC",
          "Risk adjustment",
          "CSM",
          "Premium receivable"
        ],
        correct: 2,
        explanation: "CSM represents unearned profit.",
        difficulty: "beginner"
      },
      {
        question: "Which changes adjust the CSM?",
        options: [
          "Past service claims",
          "Future service cash flow estimates",
          "Interest accretion",
          "Claims paid"
        ],
        correct: 1,
        explanation: "Future service changes adjust CSM.",
        difficulty: "standard"
      },
      {
        question: "Where is CSM release presented?",
        options: [
          "Finance income",
          "Insurance service result",
          "OCI",
          "Retained earnings"
        ],
        correct: 1,
        explanation: "CSM release is part of insurance service result.",
        difficulty: "standard"
      },
      {
        question: "Which change affects risk adjustment but not CSM?",
        options: [
          "Mortality improvement",
          "Expense inflation",
          "Change in uncertainty level",
          "Coverage units"
        ],
        correct: 2,
        explanation: "Uncertainty affects risk adjustment.",
        difficulty: "expert"
      },
      {
        question: "When is a loss component recognized?",
        options: [
          "Interest rate increase",
          "Risk adjustment increase",
          "Fulfilment cash flows exceed CSM",
          "Investment gains"
        ],
        correct: 2,
        explanation: "Onerous contracts create a loss component.",
        difficulty: "expert"
      },
      {
        question: "How is the risk adjustment updated under IFRS 17",
        options: [
          "It remains fixed at initial recognition",
          "It is remeasured to reflect current non financial risk",
          "It is transferred to CSM",
          "It is recognised in OCI"
        ],
        correct: 1,
        explanation: "Risk adjustment is updated only to reflect changes in uncertainty about non financial risk",
        difficulty: "beginner"
      },
      {
        question: "How are fulfilment cash flows treated after initial recognition",
        options: [
          "They remain fixed at inception",
          "They are remeasured using current assumptions",
          "They are transferred to CSM only",
          "They are recognised in OCI"
        ],
        correct: 1,
        explanation: "Fulfilment cash flows are updated at each reporting date",
        difficulty: "beginner"
      },
      {
        question: "What determines whether assumption changes affect profit or loss or CSM",
        options: [
          "The size of the contract",
          "Whether the change relates to past or future service",
          "The type of insurance product",
          "The premium payment pattern"
        ],
        correct: 1,
        explanation: "Past service affects profit or loss while future service adjusts CSM",
        difficulty: "beginner"
      },
      {
        question: "What is the purpose of coverage units under IFRS 17",
        options: [
          "To determine premiums",
          "To allocate the contractual service margin over the coverage period",
          "To measure risk adjustment",
          "To calculate discount rates"
        ],
        correct: 1,
        explanation: "Coverage units reflect the quantity of service provided",
        difficulty: "beginner"
      },
      {
        question: "How is the contractual service margin recognised over time",
        options: [
          "It is recognised immediately",
          "It is recognised when claims are paid",
          "It is recognised systematically as services are provided",
          "It is recognised in OCI"
        ],
        correct: 2,
        explanation: "CSM represents unearned profit and is released as insurance service is delivered",
        difficulty: "beginner"
      },
      {
        question: "Which changes bypass adjustment of the contractual service margin under the General Measurement Model",
        options: [
          "Changes in estimates of future service cash flows",
          "Experience adjustments relating to past service",
          "Changes in coverage units",
          "Changes in discount rates for future service"
        ],
        correct: 1,
        explanation: "Past service experience is recognised immediately in profit or loss",
        difficulty: "expert"
      },
      {
        question: "How is discount accretion on the contractual service margin treated under IFRS 17",
        options: [
          "Recognised in profit or loss as insurance revenue",
          "Added to the contractual service margin using the locked in discount rate",
          "Recognised in OCI",
          "Ignored for measurement purposes"
        ],
        correct: 1,
        explanation: "The CSM is accreted using the discount rate determined at initial recognition",
        difficulty: "expert"
      },
      {
        question: "Why are coverage units required under IFRS 17",
        options: [
          "To calculate premium income",
          "To allocate the contractual service margin over the coverage period",
          "To determine the risk adjustment",
          "To measure fulfilment cash flows"
        ],
        correct: 1,
        explanation: "Coverage units reflect the quantity of insurance service provided",
        difficulty: "expert"
      },
      {
        question: "Under what condition is an insurance contract group considered onerous after initial recognition",
        options: [
          "When risk adjustment increases",
          "When the contractual service margin is fully exhausted",
          "When discount rates decrease",
          "When claims volatility increases"
        ],
        correct: 1,
        explanation: "Once CSM is reduced to zero, further losses are recognised in profit or loss",
        difficulty: "expert"
      },
      {
        question: "What is the primary economic purpose of the contractual service margin in subsequent measurement",
        options: [
          "To reduce reported liabilities",
          "To eliminate volatility in profit",
          "To systematically recognise profit as services are provided",
          "To align accounting with solvency rules"
        ],
        correct: 2,
        explanation: "The CSM ensures profit is recognised in line with insurance service delivery",
        difficulty: "expert"
      },
    ]
  },
  {
    title: "Discounting CSM and Risk Adjustment",
    icon: "🔄",
    color: "from-pink-500 to-pink-600",
    questions: [
      {
        question: "Which of the following is NOT a required characteristic of the discount rate under IFRS 17?",
        options: [
          "Consistency with observable market prices for similar cash flows",
          "Inclusion of illiquidity premiums to reflect insurance contract liquidity",
          "Use of a single fixed discount rate across all types of contracts",
          "Alignment with other assumptions used in valuation to avoid double counting"
        ],
        correct: 2,
        explanation: "IFRS 17 does not require or recommend a single fixed discount rate for all contracts. Instead, the discount rate should reflect characteristics like liquidity, inflation, and dependency on underlying items.",
        difficulty: "standard"
      },
      {
        question: "Which of the following is a correct interpretation of IFRS 17's guidance on using market data to determine discount rates?",
        options: [
          "Discount rates must exclude the effect of market variables that do not impact the insurance contract's cash flows.",
          "Observable market prices should always be used, even if they include factors unrelated to insurance contract cash flows.",
          "Market observable discount rates can be used even if they reflect credit risk not relevant to the insurance liability.",
          "Discount rates should reflect all observable market factors regardless of contract characteristics."
        ],
        correct: 0,
        explanation: "IFRS 17 requires that discount rates exclude market variables that don’t affect the contract’s cash flows, even if these variables are in observable market prices.",
        difficulty: "standard"
      },
      {
        question: "What is the primary distinction between the bottom-up and top-down approaches for deriving discount rates under IFRS 17?",
        options: [
          "The bottom-up approach starts from asset returns and adjusts for insurance features",
          "The top-down approach uses a risk-free curve and adds risk premiums",
          "The top-down approach always requires matching the exact liquidity of insurance contracts.",
          "The bottom-up approach starts with a liquid risk-free yield curve and adjusts for illiquidity"
        ],
        correct: 3,
        explanation: "The bottom-up approach begins with a liquid risk-free yield curve and adjusts it to reflect the liquidity characteristics and other factors relevant to the insurance contracts.",
        difficulty: "beginner"
      },
      {
        question: "Which statement is TRUE regarding liquidity adjustments in the top-down approach under IFRS 17?",
        options: [
          "Liquidity differences between the reference assets and insurance contracts must always be adjusted",
          "No liquidity adjustments are allowed under the top-down approach",
          "Adjustments are made only if the reference portfolio’s liquidity differs significantly from that of the insurance contracts",
          "Liquidity risk is already captured in the nominal cash flows, so no adjustments are required"
        ],
        correct: 2,
        explanation: "IFRS 17 requires liquidity adjustments under the top-down approach only if the reference portfolio’s liquidity is not sufficiently consistent with that of the insurance contracts.",
        difficulty: "standard"
      },
      {
        question: "When a group of insurance contracts becomes onerous after initial recognition under IFRS 17, what happens to the Contractual Service Margin (CSM)?",
        options: [
          "It is increased to reflect the higher expected losses.",
          "It remains unchanged, as changes are only recognized at initial recognition.",
          "It is set to zero, and a loss component is established to reflect the excess of fulfilment cash flows over the expected inflows.",
          "It is transferred to the Liability for Incurred Claims (LIC)."
        ],
        correct: 2,
        explanation: "If a group becomes onerous after initial recognition, IFRS 17 requires setting the CSM to zero and recognizing a loss component.",
        difficulty: "standard"
      },
      {
        question: "Can a loss component (LC) established for an onerous group of contracts under IFRS 17 be reversed in subsequent periods?",
        options: [
          "No, once established, a loss component cannot be reversed.",
          "Yes, but only through adjustments to the Risk Adjustment for non-financial risk.",
          "Only if the contracts are derecognized.",
          "Yes, if future changes in fulfilment cash flows indicate that the group is no longer onerous."
        ],
        correct: 3,
        explanation: "Future favorable changes in fulfilment cash flows can indicate that the group is no longer onerous, allowing reversal of the loss component.",
        difficulty: "standard"
      },
      {
        question: "In the context of IFRS 17, what does the Liability for Remaining Coverage (LRC) represent when the Contractual Service Margin (CSM) is nil?",
        options: [
          "The sum of the fulfilment cash flows and the loss component.",
          "Only the present value of future cash flows without any adjustments.",
          "The Liability for Incurred Claims (LIC) only.",
          "The Risk Adjustment for non-financial risk only."
        ],
        correct: 0,
        explanation: "When the CSM is zero, the LRC consists of the fulfilment cash flows plus any loss component for onerous contracts.",
        difficulty: "standard"
      },
      {
        question: "Which discount rate is used to accrete interest on the CSM?",
        options: [
          "The risk-free rate at the reporting date",
          "The weighted average discount rate for incurred claims",
          "The current market interest rate for government bonds",
          "The discount rate at initial recognition of the group of contracts"
        ],
        correct: 3,
        explanation: "Interest on the CSM is accreted using the locked-in discount rate set at initial recognition of the group.",
        difficulty: "standard"
      },
      {
        question: "Which of the following characteristics would lead to a higher risk adjustment according to IFRS 17 principles?",
        options: [
          "High-frequency, low-severity risks",
          "Short-duration contracts with predictable claims",
          "Risks with narrow probability distributions",
          "Contracts where little is known about emerging experience"
        ],
        correct: 3,
        explanation: "Greater uncertainty in emerging experience heightens the need for a larger risk adjustment.",
        difficulty: "standard"
      },
      {
        question: "Which of the following risks is excluded from the IFRS 17 risk adjustment?",
        options: [
          "Lapse risk",
          "Expense risk",
          "Financial risk (e.g. interest rate risk)",
          "Morbidity risk"
        ],
        correct: 2,
        explanation: "The risk adjustment covers non-financial risks only. Financial risks are reflected in discount rates or cash flows, not the risk adjustment.",
        difficulty: "standard"
      },
      {
        question: "Under IFRS 17, what is the primary objective of discounting csm and risk adjustment?",
        options: [
          "Reduce volatility",
          "Reflect time value and uncertainty of cash flows",
          "Maximise profit",
          "Align with tax rules"
        ],
        correct: 1,
        explanation: "IFRS 17 focuses on current, market-consistent measurement of insurance obligations.",
        difficulty: "beginner"
      },
      {
        question: "Which assumption requires the highest level of judgement under Discounting CSM and Risk Adjustment?",
        options: [
          "Contract boundary",
          "Discount rate determination",
          "Policy count",
          "Premium frequency"
        ],
        correct: 1,
        explanation: "Discount rates require judgement to reflect characteristics of the insurance cash flows.",
        difficulty: "expert"
      },
      {
        question: "How does a change in estimates affect the CSM under Discounting CSM and Risk Adjustment?",
        options: [
          "Always recognised in profit or loss",
          "Always ignored",
          "Adjusted against CSM if it relates to future service",
          "Recognised as OCI only"
        ],
        correct: 2,
        explanation: "Changes related to future service adjust the CSM under IFRS 17.",
        difficulty: "standard"
      },
      {
        question: "When would Discounting CSM and Risk Adjustment result in immediate profit or loss recognition?",
        options: [
          "At initial recognition of profitable contracts",
          "When contracts become onerous",
          "When premiums are received",
          "Never"
        ],
        correct: 1,
        explanation: "Onerous contracts result in immediate loss recognition.",
        difficulty: "standard"
      },
      {
        question: "What is the key disclosure requirement related to Discounting CSM and Risk Adjustment?",
        options: [
          "Only total revenue",
          "Judgements and methods applied",
          "Tax reconciliation",
          "Dividend policy"
        ],
        correct: 1,
        explanation: "IFRS 17 requires disclosure of key judgements and assumptions.",
        difficulty: "expert"
      },
      {
        question: "What is the purpose of IFRS 17?",
        options: [
          "Increase profits",
          "Standardise insurance accounting",
          "Reduce taxes",
          "Eliminate judgement"
        ],
        correct: 1,
        explanation: "IFRS 17 provides a consistent framework for accounting for insurance contracts.",
        difficulty: "beginner"
      },
      {
        question: "Which contracts are within the scope of IFRS 17?",
        options: [
          "Investment contracts only",
          "Insurance contracts",
          "Service contracts",
          "Lease contracts"
        ],
        correct: 1,
        explanation: "IFRS 17 applies to insurance contracts issued.",
        difficulty: "beginner"
      },
      {
        question: "What does CSM represent?",
        options: [
          "Past losses",
          "Unearned profit",
          "Investment income",
          "Risk margin"
        ],
        correct: 1,
        explanation: "CSM represents unearned profit recognised over service period.",
        difficulty: "beginner"
      },
      {
        question: "What is an onerous contract?",
        options: [
          "Profitable contract",
          "Contract with expected losses",
          "Expired contract",
          "Reinsured contract"
        ],
        correct: 1,
        explanation: "Onerous contracts have fulfilment cash flows exceeding premiums.",
        difficulty: "beginner"
      },
      {
        question: "What is the contract boundary?",
        options: [
          "Policy term only",
          "Point where insurer can reprice risk",
          "Reinsurance limit",
          "Coverage period"
        ],
        correct: 1,
        explanation: "Contract boundary defines which cash flows are included.",
        difficulty: "beginner"
      },
      {
        question: "How should changes in estimates relating to future service be treated?",
        options: [
          "Profit or loss",
          "OCI",
          "Adjust CSM",
          "Ignore"
        ],
        correct: 2,
        explanation: "Changes relating to future service adjust the CSM.",
        difficulty: "expert"
      },
      {
        question: "When is a loss component established?",
        options: [
          "Initial recognition",
          "When contract becomes onerous",
          "At maturity",
          "Never"
        ],
        correct: 1,
        explanation: "Loss component is recognised for onerous groups.",
        difficulty: "expert"
      },
      {
        question: "Which discount rate approach reflects asset yields adjusted for credit risk?",
        options: [
          "Bottom-up",
          "Top-down",
          "Historical",
          "Locked-in"
        ],
        correct: 1,
        explanation: "Top-down approach starts with asset yields and adjusts.",
        difficulty: "expert"
      },
      {
        question: "How are reinsurance recoveries recognised for onerous contracts?",
        options: [
          "Deferred",
          "Ignored",
          "Immediately recognised",
          "OCI"
        ],
        correct: 2,
        explanation: "IFRS 17 allows immediate recognition of reinsurance recoveries.",
        difficulty: "expert"
      },
      {
        question: "What disclosure is required for significant judgements?",
        options: [
          "Optional",
          "Not required",
          "Mandatory",
          "Only quantitative"
        ],
        correct: 2,
        explanation: "IFRS 17 requires disclosure of significant judgements.",
        difficulty: "expert"
      },
    ]
  },
  {
    title: "Onerous Contracts",
    icon: "⚠️",
    color: "from-orange-500 to-orange-600",
    questions: [
      {
        question: "When is a contract classified as an onerous contract under IFRS 17?",
        options: [
          "When the contract is expected to lapse early",
          "When the contract has no Contractual Service Margin (CSM)",
          "When the contract is expected to incur a loss",
          "When the contract has no insurance risk"
        ],
        correct: 2,
        explanation: "An onerous contract is one where fulfilment cash flows exceed expected inflows (premiums), resulting in a loss.",
        difficulty: "beginner"
      },
      {
        question: "How is the CSM treated for onerous contracts?",
        options: [
          "Deferred",
          "Reversed",
          "Released to profit",
          "Set to zero"
        ],
        correct: 3,
        explanation: "The CSM is set to zero since no future profits are expected.",
        difficulty: "standard"
      },
      {
        question: "Which component is recognized when a group is onerous at initial recognition?",
        options: [
          "Contractual Service Margin",
          "Risk Adjustment",
          "Loss Component",
          "Investment Return"
        ],
        correct: 2,
        explanation: "The loss component is set up to represent losses on onerous contracts and is recognized immediately in profit or loss.",
        difficulty: "beginner"
      },
      {
        question: "How is the loss component recognized?",
        options: [
          "As an asset",
          "Through OCI",
          "As an adjustment to the CSM",
          "In profit or loss"
        ],
        correct: 3,
        explanation: "The loss component is recognized immediately in profit or loss.",
        difficulty: "beginner"
      },
      {
        question: "What happens if cash flow estimates improve?",
        options: [
          "Loss component is reversed first",
          "CSM increases",
          "Risk adjustment decreases",
          "Premiums are restated"
        ],
        correct: 0,
        explanation: "Improvements first reduce the loss component before adjusting the CSM.",
        difficulty: "standard"
      },
      {
        question: "When is a contract classified as onerous?",
        options: [
          "When risk adjustment is high",
          "When expected profit is low",
          "When fulfilment cash flows exceed premiums",
          "When lapse rate is high"
        ],
        correct: 2,
        explanation: "A contract is onerous when the fulfilment cash flows exceed the expected inflows, indicating a net loss.",
        difficulty: "beginner"
      },
      {
        question: "What happens to the CSM if a group of contracts becomes onerous after initial recognition?",
        options: [
          "It is increased",
          "It is set to zero and loss is recognized",
          "It is locked in",
          "It is recalculated using old assumptions"
        ],
        correct: 1,
        explanation: "If contracts become onerous after initial recognition, the CSM is reduced to zero, and any further loss is recognized in profit or loss.",
        difficulty: "standard"
      },
      {
        question: "Which of the following changes can make a previously profitable contract group onerous?",
        options: [
          "Increase in administrative expenses",
          "Drop in discount rates",
          "Revised premium allocation method",
          "Change in accounting policy"
        ],
        correct: 0,
        explanation: "Increases in expected expenses can raise fulfilment cash flows, potentially making the group onerous.",
        difficulty: "standard"
      },
      {
        question: "How does the loss component affect future insurance revenue?",
        options: [
          "No effect",
          "Increases revenue",
          "It reduces future revenue",
          "It replaces CSM in revenue recognition"
        ],
        correct: 3,
        explanation: "For onerous groups, the loss component replaces the CSM and is released as insurance revenue as coverage is provided.",
        difficulty: "standard"
      },
      {
        question: "What causes a change in the loss component?",
        options: [
          "Increase in discount rate",
          "Change in reinsurance treaty",
          "Adverse claims development",
          "Policyholder death"
        ],
        correct: 2,
        explanation: "Any adverse change in fulfilment cash flows increases the loss component.",
        difficulty: "standard"
      },
      {
        question: "Under IFRS 17, which model requires immediate recognition of an onerous contract?",
        options: [
          "GMM only",
          "PAA only",
          "Both GMM and PAA",
          "VFA only"
        ],
        correct: 2,
        explanation: "Both models require immediate recognition of losses when a group is onerous.",
        difficulty: "standard"
      },
      {
        question: "How does a change in lapse assumptions affect the loss component?",
        options: [
          "No effect",
          "Can increase or decrease the loss component",
          "Only affects CSM",
          "Ignored until contract ends"
        ],
        correct: 1,
        explanation: "Changes in expected lapses affect future cash flows, which can alter the loss component.",
        difficulty: "expert"
      },
      {
        question: "How is reinsurance recoverable treated when a contract group is onerous?",
        options: [
          "Reduces the loss component",
          "It is ignored in loss calculation",
          "Increases CSM",
          "Adjusts risk adjustment only"
        ],
        correct: 0,
        explanation: "Recoverable amounts from reinsurance reduce the net loss component recognized in profit or loss.",
        difficulty: "expert"
      },
      {
        question: "Which scenario could cause a previously non-onerous contract to become onerous without a change in claims experience?",
        options: [
          "Early termination of policy",
          "Increase in premiums",
          "Change in policyholder behavior assumptions",
          "Change in discount rate"
        ],
        correct: 3,
        explanation: "Adjustments to discount rates affect present value of fulfilment cash flows, potentially making the contract onerous.",
        difficulty: "expert"
      },
      {
        question: "In a group containing both profitable and onerous contracts, how is the CSM affected?",
        options: [
          "Only the profitable contracts contribute to CSM",
          "All contracts are treated as onerous",
          "CSM is reduced for all contracts",
          "CSM is unaffected"
        ],
        correct: 0,
        explanation: "IFRS 17 separates onerous contracts; CSM is only recognized for profitable contracts.",
        difficulty: "standard"
      },
    ]
  },
  {
    title: "Premium Allocation Approach",
    icon: "📋",
    color: "from-teal-500 to-teal-600",
    questions: [
      {
        question: "When is an entity allowed to apply the Premium Allocation Approach (PAA)?",
        options: [
          "Only for life insurance contracts",
          "For all investment contracts",
          "If the contract duration is ?12 months or if results are similar to GMM",
          "For contracts with no risk adjustment"
        ],
        correct: 2,
        explanation: "PAA can be used if the coverage period is 12 months or less, or if using PAA would yield results that are not materially different from the General Measurement Model (GMM).",
        difficulty: "standard"
      },
      {
        question: "What does the liability for remaining coverage (LRC) under PAA represent?",
        options: [
          "Future claims paid",
          "Present value of premiums",
          "The unearned portion of premiums minus acquisition costs",
          "Incurred claims"
        ],
        correct: 2,
        explanation: "LRC under PAA reflects the simplified unearned premium approach, adjusted for amortized acquisition costs.",
        difficulty: "standard"
      },
      {
        question: "Which of the following requires risk adjustment under PAA?",
        options: [
          "Liability for incurred claims",
          "Acquisition cost asset",
          "Liability for remaining coverage",
          "Premium receivable"
        ],
        correct: 0,
        explanation: "Under PAA, the risk adjustment applies to the liability for incurred claims to account for uncertainty in non-financial risk.",
        difficulty: "standard"
      },
      {
        question: "What happens if the liability for remaining coverage is lower than fulfilment cash flows?",
        options: [
          "Create a contractual service margin",
          "Defer acquisition costs",
          "Recognize a loss",
          "Discount more"
        ],
        correct: 2,
        explanation: "If fulfilment cash flows exceed the liability for remaining coverage, the contract is deemed onerous and the excess is recognized as a loss.",
        difficulty: "standard"
      },
      {
        question: "What are fulfilment cash flows made up of?",
        options: [
          "Future premiums only",
          "Future claims and profits",
          "Expected future inflows and outflows, discounted, plus risk adjustment",
          "Written premium minus expenses"
        ],
        correct: 2,
        explanation: "Fulfilment cash flows reflect the present value of expected future inflows and outflows plus the risk adjustment for non-financial risk.",
        difficulty: "standard"
      },
      {
        question: "How is insurance revenue recognized under PAA?",
        options: [
          "All at inception",
          "When claims are paid",
          "Evenly over the coverage period",
          "At contract expiry"
        ],
        correct: 2,
        explanation: "Under PAA, revenue is typically recognized on a straight-line basis over the coverage period, reflecting insurance services provided.",
        difficulty: "standard"
      },
      {
        question: "Can insurers offset profitable and onerous contracts within a portfolio under PAA?",
        options: [
          "No, grouping rules prevent offsetting",
          "Only with auditor approval",
          "Yes",
          "Only for reinsurance"
        ],
        correct: 0,
        explanation: "IFRS 17 requires separate grouping of onerous and profitable contracts; losses cannot be offset by profitable ones.",
        difficulty: "standard"
      },
      {
        question: "What is a key disclosure requirement under IFRS 17 even when using PAA?",
        options: [
          "No disclosure required",
          "Confidence level of liabilities",
          "Market value of assets",
          "Tax provision for each contract"
        ],
        correct: 1,
        explanation: "Disclosure of the confidence level used to determine the risk adjustment is required, even under the PAA approach.",
        difficulty: "beginner"
      },
      {
        question: "Can PAA be used for reinsurance contracts held?",
        options: [
          "Yes, if eligibility criteria are met",
          "No, PAA is only for direct contracts",
          "Yes, but only in life insurance",
          "Only if premiums exceed claims"
        ],
        correct: 0,
        explanation: "PAA can be applied to reinsurance contracts held if the contract meets the same criteria used for direct contracts.",
        difficulty: "standard"
      },
      {
        question: "What happens when acquisition costs are deferred for an onerous group?",
        options: [
          "The loss reduces",
          "It offsets the fulfilment cash flows",
          "It increases the recognized loss",
          "It increases future profits"
        ],
        correct: 2,
        explanation: "Deferring acquisition costs for an onerous group effectively lowers the LRC and can increase the shortfall, leading to a higher loss.",
        difficulty: "standard"
      },
      {
        question: "Under IFRS 17, what is the primary objective of premium allocation approach?",
        options: [
          "Reduce volatility",
          "Reflect time value and uncertainty of cash flows",
          "Maximise profit",
          "Align with tax rules"
        ],
        correct: 1,
        explanation: "IFRS 17 focuses on current, market-consistent measurement of insurance obligations.",
        difficulty: "beginner"
      },
      {
        question: "Which assumption requires the highest level of judgement under Premium Allocation Approach?",
        options: [
          "Contract boundary",
          "Discount rate determination",
          "Policy count",
          "Premium frequency"
        ],
        correct: 1,
        explanation: "Discount rates require judgement to reflect characteristics of the insurance cash flows.",
        difficulty: "expert"
      },
      {
        question: "How does a change in estimates affect the CSM under Premium Allocation Approach?",
        options: [
          "Always recognised in profit or loss",
          "Always ignored",
          "Adjusted against CSM if it relates to future service",
          "Recognised as OCI only"
        ],
        correct: 2,
        explanation: "Changes related to future service adjust the CSM under IFRS 17.",
        difficulty: "standard"
      },
      {
        question: "When would Premium Allocation Approach result in immediate profit or loss recognition?",
        options: [
          "At initial recognition of profitable contracts",
          "When contracts become onerous",
          "When premiums are received",
          "Never"
        ],
        correct: 1,
        explanation: "Onerous contracts result in immediate loss recognition.",
        difficulty: "standard"
      },
      {
        question: "What is the key disclosure requirement related to Premium Allocation Approach?",
        options: [
          "Only total revenue",
          "Judgements and methods applied",
          "Tax reconciliation",
          "Dividend policy"
        ],
        correct: 1,
        explanation: "IFRS 17 requires disclosure of key judgements and assumptions.",
        difficulty: "expert"
      },
      {
        question: "What is the purpose of IFRS 17?",
        options: [
          "Increase profits",
          "Standardise insurance accounting",
          "Reduce taxes",
          "Eliminate judgement"
        ],
        correct: 1,
        explanation: "IFRS 17 provides a consistent framework for accounting for insurance contracts.",
        difficulty: "beginner"
      },
      {
        question: "Which contracts are within the scope of IFRS 17?",
        options: [
          "Investment contracts only",
          "Insurance contracts",
          "Service contracts",
          "Lease contracts"
        ],
        correct: 1,
        explanation: "IFRS 17 applies to insurance contracts issued.",
        difficulty: "beginner"
      },
      {
        question: "What does CSM represent?",
        options: [
          "Past losses",
          "Unearned profit",
          "Investment income",
          "Risk margin"
        ],
        correct: 1,
        explanation: "CSM represents unearned profit recognised over service period.",
        difficulty: "beginner"
      },
      {
        question: "What is an onerous contract?",
        options: [
          "Profitable contract",
          "Contract with expected losses",
          "Expired contract",
          "Reinsured contract"
        ],
        correct: 1,
        explanation: "Onerous contracts have fulfilment cash flows exceeding premiums.",
        difficulty: "beginner"
      },
      {
        question: "What is the contract boundary?",
        options: [
          "Policy term only",
          "Point where insurer can reprice risk",
          "Reinsurance limit",
          "Coverage period"
        ],
        correct: 1,
        explanation: "Contract boundary defines which cash flows are included.",
        difficulty: "beginner"
      },
      {
        question: "How should changes in estimates relating to future service be treated?",
        options: [
          "Profit or loss",
          "OCI",
          "Adjust CSM",
          "Ignore"
        ],
        correct: 2,
        explanation: "Changes relating to future service adjust the CSM.",
        difficulty: "expert"
      },
      {
        question: "When is a loss component established?",
        options: [
          "Initial recognition",
          "When contract becomes onerous",
          "At maturity",
          "Never"
        ],
        correct: 1,
        explanation: "Loss component is recognised for onerous groups.",
        difficulty: "expert"
      },
      {
        question: "Which discount rate approach reflects asset yields adjusted for credit risk?",
        options: [
          "Bottom-up",
          "Top-down",
          "Historical",
          "Locked-in"
        ],
        correct: 1,
        explanation: "Top-down approach starts with asset yields and adjusts.",
        difficulty: "expert"
      },
      {
        question: "How are reinsurance recoveries recognised for onerous contracts?",
        options: [
          "Deferred",
          "Ignored",
          "Immediately recognised",
          "OCI"
        ],
        correct: 2,
        explanation: "IFRS 17 allows immediate recognition of reinsurance recoveries.",
        difficulty: "expert"
      },
      {
        question: "What disclosure is required for significant judgements?",
        options: [
          "Optional",
          "Not required",
          "Mandatory",
          "Only quantitative"
        ],
        correct: 2,
        explanation: "IFRS 17 requires disclosure of significant judgements.",
        difficulty: "expert"
      },
    ]
  },
  {
    title: "Reinsurance Contracts Held",
    icon: "🔀",
    color: "from-cyan-500 to-cyan-600",
    questions: [
      {
        question: "What is a reinsurance contract held under IFRS 17?",
        options: [
          "A contract under which an entity receives compensation for claims from a reinsurer",
          "A contract issued to share profits with partners",
          "Contract issued to insure customers",
          "A contract for investment-linked business"
        ],
        correct: 0,
        explanation: "A reinsurance contract held is one where the insurer (cedant) transfers insurance risk and receives compensation from the reinsurer for claims.",
        difficulty: "beginner"
      },
      {
        question: "When should a reinsurance contract held be initially recognized?",
        options: [
          "When the reinsurer pays a claim",
          "At the start of the underlying insurance contract",
          "At the earlier of coverage start or when underlying contracts are onerous",
          "At the end of the reporting period"
        ],
        correct: 2,
        explanation: "Recognition occurs at the earlier of when reinsurance coverage begins or when the reinsurance covers a recognized loss from onerous contracts.",
        difficulty: "standard"
      },
      {
        question: "Can a gain on purchase of reinsurance be recognized immediately?",
        options: [
          "Yes, it boosts profit",
          "No, it is included in the CSM",
          "Only if the reinsurer agrees",
          "Yes, under PAA"
        ],
        correct: 1,
        explanation: "Gains on the purchase of reinsurance are deferred within the Contractual Service Margin (CSM) and recognized over the coverage period.",
        difficulty: "standard"
      },
      {
        question: "Which of the following is NOT included in fulfilment cash flows for reinsurance contracts held?",
        options: [
          "Future claims recoveries",
          "Discounting",
          "Reinsurer’s risk appetite",
          "Risk adjustment"
        ],
        correct: 2,
        explanation: "Fulfilment cash flows include expected recoveries, discounting, and risk adjustment—not subjective elements like reinsurer's risk appetite.",
        difficulty: "standard"
      },
      {
        question: "What is the impact of reinsurance on the insurer’s risk exposure?",
        options: [
          "Increases risk",
          "No impact",
          "Transfers and reduces risk",
          "Creates an additional liability"
        ],
        correct: 2,
        explanation: "Reinsurance helps the insurer reduce and manage their insurance risk by transferring a portion of it to the reinsurer.",
        difficulty: "beginner"
      },
      {
        question: "How are changes in fulfilment cash flows for reinsurance contracts treated?",
        options: [
          "Adjust the CSM or go through P&L",
          "Ignore until contract maturity",
          "Expensed as acquisition costs",
          "Deferred indefinitely"
        ],
        correct: 0,
        explanation: "Changes in fulfilment cash flows adjust the CSM if they relate to future services, or are recognized in profit or loss otherwise.",
        difficulty: "standard"
      },
      {
        question: "Under the General Model, what happens to the CSM for reinsurance contracts held over time?",
        options: [
          "It grows with claims paid",
          "It’s released based on services received",
          "It remains constant",
          "It is immediately expensed"
        ],
        correct: 1,
        explanation: "The CSM for reinsurance contracts held is released over time based on the receipt of reinsurance services.",
        difficulty: "standard"
      },
      {
        question: "How are reinsurance recoveries presented in the income statement?",
        options: [
          "Included in insurance revenue",
          "Included in investment income",
          "Separately from insurance revenue",
          "Net of insurance service expenses"
        ],
        correct: 2,
        explanation: "IFRS 17 requires that reinsurance income and expenses be presented separately from insurance revenue and service expenses.",
        difficulty: "standard"
      },
      {
        question: "How are recoveries for past claims treated under reinsurance contracts held?",
        options: [
          "Deferred in CSM",
          "Expensed as incurred",
          "Recognized in profit or loss immediately",
          "Deducted from LRC"
        ],
        correct: 2,
        explanation: "Recoveries for past claims are immediately recognized in profit or loss as they relate to events that have already occurred.",
        difficulty: "standard"
      },
      {
        question: "What is the impact of a reinsurance CSM being negative?",
        options: [
          "It represents a loss",
          "It is a liability",
          "It is not allowed",
          "It’s treated as an asset, not a liability"
        ],
        correct: 3,
        explanation: "A negative CSM on a reinsurance contract held represents a net cost to the insurer and is treated as an asset.",
        difficulty: "beginner"
      },
      {
        question: "reinsurance contracts held?",
        options: [
          "Reduce volatility",
          "Reflect time value and uncertainty of cash flows",
          "Maximise profit",
          "Align with tax rules"
        ],
        correct: 1,
        explanation: "IFRS 17 focuses on current, market-consistent measurement of insurance obligations.",
        difficulty: "beginner"
      },
      {
        question: "Which assumption requires the highest level of judgement under Reinsurance Contracts Held?",
        options: [
          "Contract boundary",
          "Discount rate determination",
          "Policy count",
          "Premium frequency"
        ],
        correct: 1,
        explanation: "Discount rates require judgement to reflect characteristics of the insurance cash flows.",
        difficulty: "expert"
      },
      {
        question: "How does a change in estimates affect the CSM under Reinsurance Contracts Held?",
        options: [
          "Always recognised in profit or loss",
          "Always ignored",
          "Adjusted against CSM if it relates to future service",
          "Recognised as OCI only"
        ],
        correct: 2,
        explanation: "Changes related to future service adjust the CSM under IFRS 17.",
        difficulty: "standard"
      },
      {
        question: "When would Reinsurance Contracts Held result in immediate profit or loss recognition?",
        options: [
          "At initial recognition of profitable contracts",
          "When contracts become onerous",
          "When premiums are received",
          "Never"
        ],
        correct: 1,
        explanation: "Onerous contracts result in immediate loss recognition.",
        difficulty: "standard"
      },
      {
        question: "What is the key disclosure requirement related to Reinsurance Contracts Held?",
        options: [
          "Only total revenue",
          "Judgements and methods applied",
          "Tax reconciliation",
          "Dividend policy"
        ],
        correct: 1,
        explanation: "IFRS 17 requires disclosure of key judgements and assumptions.",
        difficulty: "expert"
      },
      {
        question: "What is the purpose of IFRS 17?",
        options: [
          "Increase profits",
          "Standardise insurance accounting",
          "Reduce taxes",
          "Eliminate judgement"
        ],
        correct: 1,
        explanation: "IFRS 17 provides a consistent framework for accounting for insurance contracts.",
        difficulty: "beginner"
      },
      {
        question: "Which contracts are within the scope of IFRS 17?",
        options: [
          "Investment contracts only",
          "Insurance contracts",
          "Service contracts",
          "Lease contracts"
        ],
        correct: 1,
        explanation: "IFRS 17 applies to insurance contracts issued.",
        difficulty: "beginner"
      },
      {
        question: "What does CSM represent?",
        options: [
          "Past losses",
          "Unearned profit",
          "Investment income",
          "Risk margin"
        ],
        correct: 1,
        explanation: "CSM represents unearned profit recognised over service period.",
        difficulty: "beginner"
      },
      {
        question: "What is an onerous contract?",
        options: [
          "Profitable contract",
          "Contract with expected losses",
          "Expired contract",
          "Reinsured contract"
        ],
        correct: 1,
        explanation: "Onerous contracts have fulfilment cash flows exceeding premiums.",
        difficulty: "beginner"
      },
      {
        question: "What is the contract boundary?",
        options: [
          "Policy term only",
          "Point where insurer can reprice risk",
          "Reinsurance limit",
          "Coverage period"
        ],
        correct: 1,
        explanation: "Contract boundary defines which cash flows are included.",
        difficulty: "beginner"
      },
      {
        question: "How should changes in estimates relating to future service be treated?",
        options: [
          "Profit or loss",
          "OCI",
          "Adjust CSM",
          "Ignore"
        ],
        correct: 2,
        explanation: "Changes relating to future service adjust the CSM.",
        difficulty: "expert"
      },
      {
        question: "When is a loss component established?",
        options: [
          "Initial recognition",
          "When contract becomes onerous",
          "At maturity",
          "Never"
        ],
        correct: 1,
        explanation: "Loss component is recognised for onerous groups.",
        difficulty: "expert"
      },
      {
        question: "Which discount rate approach reflects asset yields adjusted for credit risk?",
        options: [
          "Bottom-up",
          "Top-down",
          "Historical",
          "Locked-in"
        ],
        correct: 1,
        explanation: "Top-down approach starts with asset yields and adjusts.",
        difficulty: "expert"
      },
      {
        question: "How are reinsurance recoveries recognised for onerous contracts?",
        options: [
          "Deferred",
          "Ignored",
          "Immediately recognised",
          "OCI"
        ],
        correct: 2,
        explanation: "IFRS 17 allows immediate recognition of reinsurance recoveries.",
        difficulty: "expert"
      },
      {
        question: "What disclosure is required for significant judgements?",
        options: [
          "Optional",
          "Not required",
          "Mandatory",
          "Only quantitative"
        ],
        correct: 2,
        explanation: "IFRS 17 requires disclosure of significant judgements.",
        difficulty: "expert"
      },
    ]
  },
  {
    title: "Investment Contracts with Discretionary Participation Features",
    icon: "💰",
    color: "from-emerald-500 to-emerald-600",
    questions: [
      {
        question: "Which of the following statements best describes a key difference between insurance contracts with direct participation features and investment contracts with discretionary participation features under IFRS 17?",
        options: [
          "Insurance contracts with direct participation features are accounted for under IFRS 9, while investment contracts with discretionary participation features are accounted for under IFRS 17.",
          "Both contract types are accounted for using the Premium Allocation Approach (PAA) under IFRS 17.",
          "Insurance contracts with direct participation features use the Variable Fee Approach (VFA), while investment contracts with discretionary participation features are accounted for under IFRS 17 with minor modifications.",
          "Investment contracts with discretionary participation features involve no discretionary element and must follow IFRS 15."
        ],
        correct: 2,
        explanation: "IFRS 17 distinguishes DPCs using the VFA from investment contracts with DPFs, which remain within IFRS 17 but with modifications.",
        difficulty: "standard"
      },
      {
        question: "Which of the following contracts would be classified as an investment contract with discretionary participation features under IFRS 17?",
        options: [
          "A savings contract where the insurer retains discretion over bonus payments and the contract does not transfer significant insurance risk.",
          "A unit-linked investment product with guaranteed returns and no discretionary elements.",
          "A life insurance contract that entitles the policyholder to a share of asset returns and includes significant insurance risk.",
          "A pure term life policy with no investment component or discretionary features."
        ],
        correct: 0,
        explanation: "Such contracts lack significant insurance risk but include discretionary returns, qualifying as investment contracts with DPFs.",
        difficulty: "standard"
      },
      {
        question: "Under IFRS 17, what does the coverage period of a Direct Participation Contract (DPC) include?",
        options: [
          "Only the period during which insurance risk is present.",
          "Only the period over which investment returns are credited to the policyholder.",
          "Both the investment and insurance service periods under the contract.",
          "Only the period where fair value of underlying items increases."
        ],
        correct: 2,
        explanation: "DPC coverage includes both insurance and investment services provided to the policyholder.",
        difficulty: "standard"
      },
      {
        question: "Which of the following best defines an underlying item under IFRS 17?",
        options: [
          "Any asset owned by the insurer",
          "Any amount guaranteed to the policyholder",
          "Any item that determines amounts payable to the policyholder",
          "A group of insurance contracts with discretionary returns"
        ],
        correct: 2,
        explanation: "Underlying items form the basis for determining benefits payable to the policyholder.",
        difficulty: "beginner"
      },
      {
        question: "According to IFRS 17, what makes a policyholder’s participation in a pool of underlying items valid for DPC classification?",
        options: [
          "The insurer’s intention to share profits",
          "A strong historical pattern of bonus declarations",
          "A legally enforceable right to a share of underlying items",
          "Regulatory expectation that profits be distributed fairly"
        ],
        correct: 2,
        explanation: "DPC classification requires enforceable contractual rights, not expectations or intentions.",
        difficulty: "standard"
      },
      {
        question: "Which of the following contracts is most likely NOT to qualify as having a clearly identified pool of underlying items under IFRS 17?",
        options: [
          "A unit-linked contract where fund allocation is defined",
          "A with-profits contract tied to a disclosed internal asset pool",
          "A policy linked to an external market index explicitly mentioned in the policy",
          "A universal life contract where the crediting rate is set by the insurer ex post"
        ],
        correct: 3,
        explanation: "The lack of a clearly defined pool prevents DPC qualification.",
        difficulty: "standard"
      },
      {
        question: "When is the assessment of whether an insurance contract qualifies as a Direct Participation Contract (DPC) performed under IFRS 17?",
        options: [
          "At initial recognition and not subsequently repeated",
          "At the date of contract modification",
          "At the end of each reporting period",
          "Annually, based on updated assumptions"
        ],
        correct: 0,
        explanation: "The DPC assessment is performed once unless modification leads to derecognition.",
        difficulty: "expert"
      },
      {
        question: "Which of the following statements is TRUE about discounting in the measurement of Direct Participation Contracts under IFRS 17?",
        options: [
          "DPCs use locked-in discount rates for all adjustments",
          "Adjustments to cash flows not based on underlying items are discounted using current rates",
          "DPCs follow a special discounting method unique to these contracts",
          "Discounting is not applicable to DPCs"
        ],
        correct: 1,
        explanation: "IFRS 17 applies current discount rates for non-underlying item cash flow adjustments.",
        difficulty: "standard"
      },
      {
        question: "How does the adjustment of the Contractual Service Margin (CSM) for financial risks differ between contracts with and without direct participation features under IFRS 17?",
        options: [
          "Contracts with direct participation features adjust the CSM for changes in financial risk using the current interest curve, even if unrelated to future service.",
          "Only contracts without direct participation features adjust the CSM for financial risks using the current discount rate.",
          "For both types of contracts, the CSM is adjusted using the locked-in interest rate.",
          "Neither type of contract adjusts the CSM for financial risks unrelated to underlying items."
        ],
        correct: 0,
        explanation: "DPCs reflect current financial assumptions in CSM adjustments unlike other contracts.",
        difficulty: "standard"
      },
      {
        question: "What is the appropriate IFRS 17 treatment when a Direct Participation Contract (DPC) is modified such that it no longer meets the definition of a DPC?",
        options: [
          "The contract continues to be treated as a DPC until expiry.",
          "The contract is reclassified prospectively without derecognition.",
          "The original contract is derecognised, and a new contract is recognised based on the modified terms.",
          "Only the CSM is adjusted to reflect the modification."
        ],
        correct: 2,
        explanation: "Loss of DPC status requires derecognition and recognition of a new contract.",
        difficulty: "beginner"
      },
      {
        question: "Which of the following best describes an investment contract with discretionary participation features under IFRS 17?",
        options: [
          "A financial instrument that guarantees fixed returns and is always classified under IFRS 9.",
          "A contract that gives the investor a right to additional amounts determined solely by market interest rates.",
          "A unit-linked insurance contract with no discretionary elements.",
          "A financial instrument providing the investor with a right to receive significant additional benefits that are contractually discretionary and based on returns or performance."
        ],
        correct: 3,
        explanation: "Investment contracts with DPFs provide discretionary performance-based benefits and fall under IFRS 17.",
        difficulty: "standard"
      },
      {
        question: "Under IFRS 17, what is the primary objective of investment contracts with discretionary participation features?",
        options: [
          "Reduce volatility",
          "Reflect time value and uncertainty of cash flows",
          "Maximise profit",
          "Align with tax rules"
        ],
        correct: 1,
        explanation: "IFRS 17 focuses on current, market-consistent measurement of insurance obligations.",
        difficulty: "beginner"
      },
      {
        question: "Which assumption requires the highest level of judgement under Investment Contracts with Discretionary Participation Features?",
        options: [
          "Contract boundary",
          "Discount rate determination",
          "Policy count",
          "Premium frequency"
        ],
        correct: 1,
        explanation: "Discount rates require judgement to reflect characteristics of the insurance cash flows.",
        difficulty: "expert"
      },
      {
        question: "How does a change in estimates affect the CSM under Investment Contracts with Discretionary Participation Features?",
        options: [
          "Always recognised in profit or loss",
          "Always ignored",
          "Adjusted against CSM if it relates to future service",
          "Recognised as OCI only"
        ],
        correct: 2,
        explanation: "Changes related to future service adjust the CSM under IFRS 17.",
        difficulty: "standard"
      },
      {
        question: "When would Investment Contracts with Discretionary Participation Features result in immediate profit or loss recognition?",
        options: [
          "At initial recognition of profitable contracts",
          "When contracts become onerous",
          "When premiums are received",
          "Never"
        ],
        correct: 1,
        explanation: "Onerous contracts result in immediate loss recognition.",
        difficulty: "standard"
      },
      {
        question: "What is the key disclosure requirement related to Investment Contracts with Discretionary Participation Features?",
        options: [
          "Only total revenue",
          "Judgements and methods applied",
          "Tax reconciliation",
          "Dividend policy"
        ],
        correct: 1,
        explanation: "IFRS 17 requires disclosure of key judgements and assumptions.",
        difficulty: "expert"
      },
      {
        question: "What is the purpose of IFRS 17?",
        options: [
          "Increase profits",
          "Standardise insurance accounting",
          "Reduce taxes",
          "Eliminate judgement"
        ],
        correct: 1,
        explanation: "IFRS 17 provides a consistent framework for accounting for insurance contracts.",
        difficulty: "beginner"
      },
      {
        question: "Which contracts are within the scope of IFRS 17?",
        options: [
          "Investment contracts only",
          "Insurance contracts",
          "Service contracts",
          "Lease contracts"
        ],
        correct: 1,
        explanation: "IFRS 17 applies to insurance contracts issued.",
        difficulty: "beginner"
      },
      {
        question: "What does CSM represent?",
        options: [
          "Past losses",
          "Unearned profit",
          "Investment income",
          "Risk margin"
        ],
        correct: 1,
        explanation: "CSM represents unearned profit recognised over service period.",
        difficulty: "beginner"
      },
      {
        question: "What is an onerous contract?",
        options: [
          "Profitable contract",
          "Contract with expected losses",
          "Expired contract",
          "Reinsured contract"
        ],
        correct: 1,
        explanation: "Onerous contracts have fulfilment cash flows exceeding premiums.",
        difficulty: "beginner"
      },
      {
        question: "What is the contract boundary?",
        options: [
          "Policy term only",
          "Point where insurer can reprice risk",
          "Reinsurance limit",
          "Coverage period"
        ],
        correct: 1,
        explanation: "Contract boundary defines which cash flows are included.",
        difficulty: "beginner"
      },
      {
        question: "How should changes in estimates relating to future service be treated?",
        options: [
          "Profit or loss",
          "OCI",
          "Adjust CSM",
          "Ignore"
        ],
        correct: 2,
        explanation: "Changes relating to future service adjust the CSM.",
        difficulty: "expert"
      },
      {
        question: "When is a loss component established?",
        options: [
          "Initial recognition",
          "When contract becomes onerous",
          "At maturity",
          "Never"
        ],
        correct: 1,
        explanation: "Loss component is recognised for onerous groups.",
        difficulty: "expert"
      },
      {
        question: "Which discount rate approach reflects asset yields adjusted for credit risk?",
        options: [
          "Bottom-up",
          "Top-down",
          "Historical",
          "Locked-in"
        ],
        correct: 1,
        explanation: "Top-down approach starts with asset yields and adjusts.",
        difficulty: "expert"
      },
      {
        question: "How are reinsurance recoveries recognised for onerous contracts?",
        options: [
          "Deferred",
          "Ignored",
          "Immediately recognised",
          "OCI"
        ],
        correct: 2,
        explanation: "IFRS 17 allows immediate recognition of reinsurance recoveries.",
        difficulty: "expert"
      },
      {
        question: "What disclosure is required for significant judgements?",
        options: [
          "Optional",
          "Not required",
          "Mandatory",
          "Only quantitative"
        ],
        correct: 2,
        explanation: "IFRS 17 requires disclosure of significant judgements.",
        difficulty: "expert"
      },
    ]
  },
  {
    title: "Modification and Derecognition of Insurance Contracts",
    icon: "✂️",
    color: "from-rose-500 to-rose-600",
    questions: [
      {
        question: "When is a contract considered modified under IFRS 17?",
        options: [
          "When it is extended",
          "When contractual cash flows change",
          "When insurer and policyholder agree on new terms",
          "When premiums change"
        ],
        correct: 1,
        explanation: "A contract is modified when the terms change in a way that affects fulfilment cash flows, not just administrative details.",
        difficulty: "standard"
      },
      {
        question: "What is the first step when assessing a contract modification under IFRS 17?",
        options: [
          "Recognize as new contract",
          "Adjust the CSM",
          "Assess whether modification is substantial",
          "Update the risk adjustment"
        ],
        correct: 2,
        explanation: "The insurer must first assess whether the modification significantly changes the contract terms.",
        difficulty: "standard"
      },
      {
        question: "If a contract modification results in substantially different terms, what is the accounting treatment?",
        options: [
          "Adjust liability only",
          "Derecognize old and recognize new contract",
          "Adjust insurance revenue",
          "Disclose in notes only"
        ],
        correct: 1,
        explanation: "Substantial modifications require derecognition of the old contract and recognition of a new one.",
        difficulty: "standard"
      },
      {
        question: "What is the impact on CSM if a modification is not substantial?",
        options: [
          "It is reversed",
          "It is remeasured",
          "It is released to profit",
          "It is written off"
        ],
        correct: 1,
        explanation: "For non-substantial modifications, the CSM is adjusted without derecognition.",
        difficulty: "standard"
      },
      {
        question: "Under IFRS 17, what causes derecognition of an insurance contract?",
        options: [
          "Claims payment",
          "Expiry of coverage",
          "Settlement or cancellation",
          "Change in accounting policy"
        ],
        correct: 2,
        explanation: "Derecognition occurs when the insurer’s obligation ends, such as settlement or cancellation.",
        difficulty: "beginner"
      },
      {
        question: "Which of the following changes is considered substantial?",
        options: [
          "Adding a new coverage type",
          "Change in billing address",
          "Change in payment date",
          "Update to claims contact"
        ],
        correct: 0,
        explanation: "Adding new coverage significantly alters the risk profile of the contract.",
        difficulty: "standard"
      },
      {
        question: "How is the carrying amount of the derecognized contract treated?",
        options: [
          "It is capitalized",
          "It is transferred to reserves",
          "It is removed from the balance sheet",
          "It is restated"
        ],
        correct: 2,
        explanation: "Derecognition removes the contract liability from the statement of financial position.",
        difficulty: "beginner"
      },
      {
        question: "How is a new contract initially recognized?",
        options: [
          "Based on old values",
          "Using fair value",
          "Using fulfilment cash flows at date of modification",
          "Not recognized separately"
        ],
        correct: 2,
        explanation: "The new contract is measured using fulfilment cash flows at the modification date.",
        difficulty: "standard"
      },
      {
        question: "How are derecognised contracts due to full settlement treated?",
        options: [
          "CSM is amortized",
          "Recognize gain/loss",
          "Asset revaluation",
          "Insurance revenue restated"
        ],
        correct: 1,
        explanation: "A gain or loss is recognized upon full settlement of the contract.",
        difficulty: "standard"
      },
      {
        question: "What is the primary difference between substantial and non-substantial modifications?",
        options: [
          "Impact on reinsurance",
          "Change in timing of premium",
          "Need for derecognition",
          "Claims experience"
        ],
        correct: 2,
        explanation: "Only substantial modifications require derecognition under IFRS 17.",
        difficulty: "beginner"
      },
      {
        question: "Which of the following is NOT a reason for derecognition?",
        options: [
          "Contract lapses",
          "Contract is modified substantially",
          "Policy is cancelled",
          "Policyholder pays premium early"
        ],
        correct: 3,
        explanation: "Early premium payment does not extinguish the insurer’s obligation.",
        difficulty: "standard"
      },
      {
        question: "What is the derecognition criteria under IFRS 17 for insurance contract liabilities?",
        options: [
          "Legal cancellation",
          "Transfer to another insurer",
          "Extinguishment of obligation",
          "Policyholder request"
        ],
        correct: 2,
        explanation: "Derecognition occurs when the insurer’s obligation is fully extinguished.",
        difficulty: "beginner"
      },
      {
        question: "What must be disclosed upon derecognition of a contract?",
        options: [
          "Nothing",
          "Reason for derecognition and financial impact",
          "Transition adjustments",
          "Future premiums"
        ],
        correct: 1,
        explanation: "IFRS 17 requires disclosure of both the reason and financial effect of derecognition.",
        difficulty: "standard"
      },
      {
        question: "Which modification would not be considered substantial?",
        options: [
          "Adding a new benefit",
          "Removing a major risk cover",
          "Changing claim limits significantly",
          "Changing policyholder address"
        ],
        correct: 3,
        explanation: "Administrative changes do not materially affect contract terms.",
        difficulty: "beginner"
      },
      {
        question: "If a contract modification changes expected cash flows only for part of a portfolio, how should IFRS 17 treat the modification?",
        options: [
          "Apply modification to all contracts in the portfolio",
          "Assess materiality and adjust only affected contracts",
          "Derecognize the whole portfolio",
          "Ignore minor changes"
        ],
        correct: 1,
        explanation: "Modifications affecting only a subset of contracts require assessing materiality. Only the affected contracts’ CSM and fulfilment cash flows are adjusted; the rest remain unchanged.",
        difficulty: "expert"
      },
      {
        question: "How should an insurer treat a modification that alters the timing but not the amount of premiums or benefits?",
        options: [
          "Always derecognize and recognize a new contract",
          "Ignore the modification",
          "Adjust CSM for time value changes only",
          "Recognize gain/loss immediately"
        ],
        correct: 2,
        explanation: "IFRS 17 requires adjusting fulfilment cash flows and CSM for changes in timing (time value of money), but no derecognition occurs if cash flow amounts are unchanged.",
        difficulty: "expert"
      },
      {
        question: "How is the day-1 gain/loss treated if a substantial modification results in immediate recognition of a new contract with favorable cash flows?",
        options: [
          "Recognized immediately in profit or loss",
          "Deferred over the original contract term",
          "Added to the old CSM",
          "Recorded in OCI"
        ],
        correct: 0,
        explanation: "Substantial modifications derecognize the old contract and create a new contract. Any favorable day-1 gain from the new contract is recognized immediately in profit or loss, as it represents current expected profit.",
        difficulty: "expert"
      },
    ]
  },
  {
    title: "Presentation in the Statement of Financial Position",
    icon: "🧾",
    color: "from-violet-500 to-violet-600",
    questions: [
      {
        question: "How are changes in the risk adjustment presented if not disaggregated?",
        options: [
          "In other comprehensive income",
          "Fully within the insurance service result",
          "As a deferred liability",
          "As finance income"
        ],
        correct: 1,
        explanation: "If an entity does not choose to disaggregate changes in the risk adjustment, the full change is presented within the insurance service result as per IFRS 17 guidance.",
        difficulty: "expert"
      },
      {
        question: "How should an entity present a group of contracts with a net obligation (i.e., expected outflows exceed inflows) in the statement of financial position?",
        options: [
          "As an asset",
          "As a liability",
          "Under equity",
          "Offset against premiums receivable"
        ],
        correct: 1,
        explanation: "Under IFRS 17, if fulfilment cash flows of a group of insurance contracts result in a net obligation, it is presented as a liability in the statement of financial position.",
        difficulty: "standard"
      },
      {
        question: "How should an entity present insurance contracts issued in the statement of financial position?",
        options: [
          "Only when the contracts are profitable",
          "Combined with acquisition cash flows only",
          "As either assets or liabilities, depending on the net fulfilment cash flows",
          "Net of reinsurance recoverables"
        ],
        correct: 2,
        explanation: "Insurance contracts are presented based on whether fulfilment cash flows result in a net asset or liability, providing clarity on the insurer’s financial position.",
        difficulty: "beginner"
      },
      {
        question: "What drives the distinction between insurance revenue and insurance finance income/expenses?",
        options: [
          "Time value of money and discount rates",
          "Policy type",
          "Underwriting year",
          "Geographical spread"
        ],
        correct: 0,
        explanation: "Revenue reflects service delivery, while insurance finance income/expenses reflect economic effects from interest rates and the time value of money.",
        difficulty: "standard"
      },
      {
        question: "What is the appropriate presentation of acquisition costs related to a group of reinsurance contracts held?",
        options: [
          "Expensed immediately",
          "Included in insurance service expenses",
          "Reported under administrative expenses",
          "Included in the carrying amount of reinsurance contracts held"
        ],
        correct: 3,
        explanation: "IFRS 17 requires acquisition cash flows related to reinsurance contracts held to be included in the carrying amount of the group, ensuring proper expense matching.",
        difficulty: "expert"
      },
      {
        question: "Which of the following would most likely be presented as an insurance liability?",
        options: [
          "Deferred acquisition costs",
          "Accrued interest income",
          "Outstanding claims reserves",
          "Expected future premium inflows"
        ],
        correct: 2,
        explanation: "Outstanding claims reserves represent obligations still owed by the insurer and are therefore presented as insurance liabilities.",
        difficulty: "beginner"
      },
      {
        question: "Under IFRS 17, how are insurance contract assets and liabilities presented in the Statement of Financial Position?",
        options: [
          "Offset against each other",
          "Presented separately for each group of contracts",
          "Presented net at the entity level",
          "Combined and shown as a single line item"
        ],
        correct: 1,
        explanation: "IFRS 17 requires insurance contract assets and liabilities to be presented separately for each group and prohibits offsetting at the entity level.",
        difficulty: "standard"
      },
      {
        question: "What is the treatment of a group of onerous contracts in the SFP?",
        options: [
          "Recognized as a liability",
          "Included under reinsurance",
          "Recognized as an asset",
          "Deferred to future periods"
        ],
        correct: 0,
        explanation: "Onerous contracts result in expected losses and must be recognized as liabilities in the statement of financial position under IFRS 17.",
        difficulty: "standard"
      },
      {
        question: "Which IFRS 17 paragraph outlines the presentation requirements for the SFP?",
        options: [
          "IFRS 17.32",
          "IFRS 17.109",
          "IFRS 17.42",
          "IFRS 17.78"
        ],
        correct: 3,
        explanation: "IFRS 17.78 outlines the requirement for separate presentation of insurance contract assets and liabilities in the statement of financial position.",
        difficulty: "beginner"
      },
      {
        question: "Which of the following is not shown separately in IFRS 17 SFP presentation?",
        options: [
          "Insurance contract liabilities",
          "Insurance contract assets",
          "Deferred acquisition costs",
          "Reinsurance contract assets"
        ],
        correct: 2,
        explanation: "Under IFRS 17, deferred acquisition costs are not presented separately but are included within the measurement (fulfilment cash flows) of insurance contracts.",
        difficulty: "standard"
      },
      {
        question: "What determines whether an insurance contract is presented as an asset or a liability under IFRS 17?",
        options: [
          "Policyholder type",
          "Contract duration",
          "Net fulfilment cash flows",
          "Premium payment frequency"
        ],
        correct: 2,
        explanation: "Insurance contracts are presented as assets or liabilities based on whether fulfilment cash flows result in net inflows or outflows.",
        difficulty: "beginner"
      },
      {
        question: "Where are reinsurance contracts held presented in the statement of financial position?",
        options: [
          "Netted against insurance contract liabilities",
          "Under equity",
          "Separately as reinsurance contract assets or liabilities",
          "Included in insurance revenue"
        ],
        correct: 2,
        explanation: "IFRS 17 requires reinsurance contracts held to be presented separately from insurance contracts issued.",
        difficulty: "beginner"
      },
      {
        question: "Which component is included in the measurement of insurance contract liabilities rather than shown separately?",
        options: [
          "Outstanding claims",
          "Deferred acquisition costs",
          "Risk adjustment",
          "Fulfilment cash flows"
        ],
        correct: 1,
        explanation: "Acquisition cash flows are included within fulfilment cash flows and not shown as a separate line item.",
        difficulty: "beginner"
      },
      {
        question: "What is the primary purpose of separate presentation of insurance contract assets and liabilities?",
        options: [
          "To simplify reporting",
          "To align with tax reporting",
          "To enhance transparency of financial position",
          "To reduce volatility"
        ],
        correct: 2,
        explanation: "Separate presentation improves clarity of an insurer’s financial position.",
        difficulty: "beginner"
      },
      {
        question: "Are insurance contract assets allowed to be offset against insurance contract liabilities?",
        options: [
          "Always allowed",
          "Allowed only for the same product",
          "Not allowed",
          "Allowed at entity level"
        ],
        correct: 2,
        explanation: "IFRS 17 prohibits offsetting to ensure transparency.",
        difficulty: "beginner"
      },
      {
        question: "How should insurance contract assets and liabilities be aggregated for presentation purposes under IFRS 17?",
        options: [
          "By underwriting year",
          "By portfolio only",
          "By group of insurance contracts",
          "At entity level"
        ],
        correct: 2,
        explanation: "Presentation follows the IFRS 17 unit of account, which is the group of insurance contracts.",
        difficulty: "expert"
      },
      {
        question: "How is the loss component of onerous contracts reflected in the statement of financial position?",
        options: [
          "Included within insurance revenue",
          "Recognized within insurance contract liabilities",
          "Presented as a separate equity reserve",
          "Deferred until claims are incurred"
        ],
        correct: 1,
        explanation: "The loss component forms part of the insurance contract liability.",
        difficulty: "expert"
      },
      {
        question: "What presentation impact results from choosing to disaggregate insurance finance income or expenses?",
        options: [
          "Changes insurance revenue",
          "Affects equity only",
          "Determines presentation between profit or loss and OCI",
          "Changes fulfilment cash flows"
        ],
        correct: 2,
        explanation: "The policy choice affects whether insurance finance income or expenses are split between P&L and OCI.",
        difficulty: "expert"
      },
      {
        question: "How are changes in estimates relating to future service reflected in the SFP?",
        options: [
          "Recognized immediately in equity",
          "Adjust the CSM or liability",
          "Presented as insurance finance income",
          "Deferred indefinitely"
        ],
        correct: 1,
        explanation: "Changes related to future service adjust the CSM or liability.",
        difficulty: "expert"
      },
      {
        question: "When measuring reinsurance contracts held, how are expected recoveries from onerous insurance contracts presented?",
        options: [
          "As insurance revenue",
          "As a separate asset in reinsurance contracts held",
          "Offset against insurance liabilities",
          "Included in OCI"
        ],
        correct: 1,
        explanation: "IFRS 17 requires recognition of a gain on reinsurance contracts held, presented separately.",
        difficulty: "expert"
      },
    ]
  },
  {
    title: "Insurance Service Result",
    icon: "📈",
    color: "from-amber-500 to-amber-600",
    questions: [
      {
        question: "What are the two main components an entity must disaggregate in the statement of financial performance?",
        options: [
          "Revenue and Expenses",
          "Insurance Profit and Investment Return",
          "Earned Premium and Unearned Premium",
          "Insurance Service Result and Insurance Finance Income or Expenses"
        ],
        correct: 3,
        explanation: "IFRS 17 requires disaggregation into Insurance Service Result and Insurance Finance Income or Expenses in the statement of financial performance.",
        difficulty: "standard"
      },
      {
        question: "Which of the following is included in the insurance service result?",
        options: [
          "Change in risk adjustment for non-financial risk",
          "Insurance revenue and insurance service expenses",
          "Investment income",
          "Premium refunds"
        ],
        correct: 1,
        explanation: "The insurance service result comprises insurance revenue and insurance service expenses (Paragraph 83).",
        difficulty: "standard"
      },
      {
        question: "How should an entity present income or expenses from reinsurance contracts held?",
        options: [
          "Separately from insurance contracts issued",
          "Together with insurance contracts issued",
          "Only in other comprehensive income",
          "As a deferred liability"
        ],
        correct: 0,
        explanation: "Reinsurance contract results must be presented separately from insurance contracts issued (Paragraph 85).",
        difficulty: "standard"
      },
      {
        question: "What should insurance revenue reflect?",
        options: [
          "Premiums received",
          "Claims paid",
          "The consideration expected in exchange for coverage and services",
          "Cash flow timing"
        ],
        correct: 2,
        explanation: "Insurance revenue should depict the consideration to which the entity expects to be entitled for providing insurance coverage and services (Paragraph 83).",
        difficulty: "standard"
      },
      {
        question: "Which of the following is NOT included in insurance service expenses?",
        options: [
          "Incurred claims",
          "Investment components",
          "Other incurred insurance service expenses",
          "Amounts in paragraph 103(b)"
        ],
        correct: 1,
        explanation: "Insurance service expenses exclude investment components (Paragraph 84).",
        difficulty: "standard"
      },
      {
        question: "When disaggregating the change in the risk adjustment for non-financial risk, what is required?",
        options: [
          "Mandatory allocation between finance and service result",
          "No allocation is permitted",
          "Optional disaggregation; otherwise, include fully in the insurance service result",
          "Include entirely in finance income"
        ],
        correct: 2,
        explanation: "If not disaggregated, the entire change is included in the insurance service result (Paragraph 82).",
        difficulty: "expert"
      },
      {
        question: "Which component may NOT be presented in profit or loss?",
        options: [
          "Premium information inconsistent with Paragraph 83",
          "Insurance service expenses",
          "Reinsurance income",
          "Risk adjustment"
        ],
        correct: 0,
        explanation: "Premium information should not be presented if inconsistent with how revenue is defined under Paragraph 83.",
        difficulty: "standard"
      },
      {
        question: "What options does an entity have for presenting reinsurance contracts held?",
        options: [
          "Only as a single net amount",
          "Only as individual line items",
          "Either as a net amount or split into recovered amounts and premium allocations",
          "As part of investment income"
        ],
        correct: 2,
        explanation: "An entity may present a net amount or separate amounts (recoveries and premium allocations) as long as they total the same net amount.",
        difficulty: "standard"
      },
      {
        question: "Under the Premium Allocation Approach (PAA), what is insurance revenue generally similar to?",
        options: [
          "Earned premium",
          "Written premium",
          "Total premiums received",
          "Premium receivable"
        ],
        correct: 0,
        explanation: "Under PAA, insurance revenue is generally similar to earned premium over the coverage period.",
        difficulty: "standard"
      },
      {
        question: "Under the General Measurement Model (GMM), which of the following is NOT part of insurance service revenue?",
        options: [
          "Release of the Contractual Service Margin (CSM)",
          "Investment returns",
          "Risk adjustment for non-financial risk",
          "Recovery of acquisition cash flows"
        ],
        correct: 1,
        explanation: "Investment returns are excluded; insurance service revenue includes items such as CSM release, risk adjustment, and acquisition cash flow recovery.",
        difficulty: "expert"
      },
      {
        question: "What are “losses on onerous contracts” classified as under IFRS 17?",
        options: [
          "Investment finance expenses",
          "Deferred income",
          "Premium liability",
          "Insurance service expenses"
        ],
        correct: 3,
        explanation: "Losses on onerous contracts are part of insurance service expenses as they relate to future service obligations.",
        difficulty: "standard"
      },
      {
        question: "What does IFRS 17 aim to achieve by separating service result and finance result?",
        options: [
          "Enhanced transparency and comparability",
          "Compliance with local GAAP",
          "Tax optimization",
          "Maximizing investment returns"
        ],
        correct: 0,
        explanation: "IFRS 17 aims to enhance transparency and comparability by clearly separating insurance services from financial effects.",
        difficulty: "standard"
      },
      {
        question: "What is the treatment of reinsurance-related cash flows contingent on claims?",
        options: [
          "Deferred revenue",
          "Presented as part of claims recoverable",
          "Included in insurance finance income",
          "Excluded from the financial statements"
        ],
        correct: 1,
        explanation: "Such cash flows are presented as part of expected claims to be reimbursed under the reinsurance contract (Paragraph 86(a)).",
        difficulty: "standard"
      },
      {
        question: "What is the effect of the reversal of losses on onerous contracts?",
        options: [
          "Increase in insurance finance income",
          "Reduction in insurance service revenue",
          "Decrease in liabilities and increase in insurance service result",
          "Increase in insurance acquisition costs"
        ],
        correct: 2,
        explanation: "A reversal of losses on onerous contracts reduces liabilities and increases the insurance service result (Paragraph 84(c)).",
        difficulty: "expert"
      },
    ]
  },
  {
    title: "Insurance Finance Income or Expenses",
    icon: "💹",
    color: "from-sky-500 to-sky-600",
    questions: [
      {
        question: "Insurance service result primarily reflects:",
        options: [
          "Financial market performance",
          "Underwriting performance",
          "Asset allocation decisions",
          "Liquidity management"
        ],
        correct: 1,
        explanation: "Insurance Service result isolates the performance of insurance services.",
        difficulty: "standard"
      },
      {
        question: "What are Insurance Finance Income or Expenses (IFIE)?",
        options: [
          "Premiums and claims",
          "Acquisition costs and investment income",
          "Changes in non-financial assumptions",
          "Time value of money and financial risk impacts"
        ],
        correct: 3,
        explanation: "IFIE represent changes in the carrying amount of insurance contracts due to the effect of the time value of money and financial risk, such as interest accretion and changes in discount rates.",
        difficulty: "standard"
      },
      {
        question: "How can IFIE be presented in the statement of financial performance?",
        options: [
          "Either fully in P&L or disaggregated between P&L and OCI",
          "Only in Profit or Loss (P&L)",
          "Only in Other Comprehensive Income (OCI)",
          "Only in the notes to the financial statements"
        ],
        correct: 0,
        explanation: "IFRS 17 allows a policy choice: present all IFIE in P&L or disaggregate them between P&L and OCI, depending on the approach selected.",
        difficulty: "standard"
      },
      {
        question: "Are there any exceptions to the general treatment of IFIE?",
        options: [
          "No exceptions",
          "Yes, for reinsurance contracts",
          "Yes, for insurance contracts with direct participation features and certain assumptions that would adjust CSM but don’t",
          "Yes, if the policyholder is a related party"
        ],
        correct: 2,
        explanation: "IFRS 17 excludes from IFIE those changes in financial assumptions that would adjust the contractual service margin (CSM) but do not do so due to application of specific paragraphs (45(b)(ii), etc.).",
        difficulty: "standard"
      },
      {
        question: "If the entity chooses to disaggregate IFIE between P&L and OCI, how should the disaggregation be made?",
        options: [
          "Based on actual market returns",
          "Using a locked-in discount rate to allocate a portion to P&L",
          "Arbitrarily",
          "Based on revenue recognition patterns"
        ],
        correct: 1,
        explanation: "A systematic allocation using a locked-in discount rate at initial recognition is applied. The portion not recognized in P&L is reported in OCI.",
        difficulty: "expert"
      },
      {
        question: "How should IFIE recorded in OCI be treated when a group of insurance contracts is transferred or derecognized (per paragraph 91)?",
        options: [
          "They are reversed in the next period",
          "They are transferred to equity",
          "They are reclassified to P&L if Option 2 under paragraph 88 was applied",
          "They remain in OCI permanently"
        ],
        correct: 2,
        explanation: "If the disaggregation under paragraph 88(b) was used, the remaining OCI balance is reclassified to P&L as a reclassification adjustment.",
        difficulty: "expert"
      },
      {
        question: "How should exchange differences on changes in the carrying amount of groups of insurance contracts be treated?",
        options: [
          "Always in OCI",
          "Always in equity",
          "Not recognized",
          "In P&L unless they relate to OCI-recorded IFIE, in which case they go to OCI"
        ],
        correct: 3,
        explanation: "Under IAS 21, insurance contracts are monetary items. Exchange differences are included in P&L, except when they relate to amounts in OCI (then they stay in OCI).",
        difficulty: "expert"
      },
      {
        question: "Which component is typically included in the effect of the time value of money under IFIE?",
        options: [
          "Expected claims",
          "Acquisition costs",
          "Interest accretion on insurance liabilities",
          "Reinsurance asset recoveries"
        ],
        correct: 2,
        explanation: "Interest accretion reflects the unwinding of the discount on insurance liabilities, part of the time value of money in IFIE.",
        difficulty: "standard"
      },
      {
        question: "Which of the following best describes the treatment of IFIE for contracts with direct participation features?",
        options: [
          "Must always be presented in OCI",
          "May be presented to eliminate mismatches with underlying items",
          "Not applicable to participating contracts",
          "Must always be presented in P&L"
        ],
        correct: 1,
        explanation: "Entities can choose to disaggregate IFIE in a way that eliminates accounting mismatches with underlying items.",
        difficulty: "expert"
      },
      {
        question: "If a group of contracts is derecognized and IFIE has been disaggregated under paragraph 89(b), what happens to amounts in OCI?",
        options: [
          "Remain in OCI",
          "Transferred to P&L",
          "Reversed",
          "Transferred to retained earnings"
        ],
        correct: 0,
        explanation: "Under paragraph 91(b), OCI amounts from paragraph 89(b) are not reclassified to P&L.",
        difficulty: "expert"
      },
      {
        question: "What type of financial risk would be reflected in IFIE?",
        options: [
          "Lapse risk",
          "Currency risk",
          "Inflation risk",
          "Equity or interest rate risk impacting discount rates"
        ],
        correct: 3,
        explanation: "IFIE includes effects of financial risk, such as interest rate or equity risk, which influence the present value of insurance liabilities.",
        difficulty: "standard"
      },
      {
        question: "Why might an entity choose to disaggregate IFIE between P&L and OCI?",
        options: [
          "To smooth earnings volatility",
          "To avoid recognizing claims",
          "To increase policyholder bonuses",
          "To reduce insurance liabilities"
        ],
        correct: 0,
        explanation: "Disaggregation helps reduce volatility in P&L from market-driven movements in discount rates and financial assumptions.",
        difficulty: "standard"
      },
      {
        question: "Which paragraph of IFRS 17 allows IFIE disaggregation for non-participating contracts?",
        options: [
          "Paragraph 30",
          "Paragraph 88",
          "Paragraph 45",
          "Paragraph 135"
        ],
        correct: 1,
        explanation: "Paragraph 88 provides the accounting policy choice for disaggregating IFIE for non-participating contracts.",
        difficulty: "expert"
      },
      {
        question: "When an entity opts to recognize all IFIE in P&L, the impact on OCI is",
        options: [
          "Neutral (no impact)",
          "Positive",
          "Negative",
          "Deferred to future periods"
        ],
        correct: 0,
        explanation: "If all IFIE are recognized in P&L, there is no effect on OCI.",
        difficulty: "standard"
      },
      {
        question: "Which type of insurance contract is most likely to involve disaggregation based on underlying item performance?",
        options: [
          "Group term life insurance",
          "Non-participating whole life",
          "Universal life insurance with direct participation features",
          "Reinsurance contracts held"
        ],
        correct: 2,
        explanation: "Contracts with direct participation features (e.g., universal life tied to asset performance) often use disaggregation aligned with underlying items.",
        difficulty: "expert"
      },
      {
        question: "IFIE disaggregation for DPF contracts mainly aims to:",
        options: [
          "Maximize equity",
          "Eliminate accounting mismatches",
          "Reduce capital requirements",
          "Increase revenue"
        ],
        correct: 1,
        explanation: "By choosing to disaggregate, the insurer can ensure that the finance income/expenses recognized in the P&L match the income/expenses produced by the assets backing those contracts.",
        difficulty: "expert"
      },
    ]
  },
];
