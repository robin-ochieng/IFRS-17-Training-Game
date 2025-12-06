# insurance-ifrs17-Unpacking-LRC-LIC-Calculations

*Extracted from: insurance-ifrs17-Unpacking-LRC-LIC-Calculations.pdf*

---

MOODY’S ANALYTICS UNPACKING LRC AND LIC CALCULATIONS FOR P&C INSURERS
1
Moody’s Analytics markets and distributes all Moody’s Capital Markets Research, Inc. materials. Moody’s Capital Markets Research, Inc.
is a subsidiary of Moody’s Corporation. Moody’s Analytics does not provide investment advisory services or products. For further detail,
please see the last page.
Unpacking LRC and LIC Calculations for
P&C Insurers
This paper covers the following topics:
»
Overview of the measurement models under IFRS 17
»
Further analysis of the liabilities for incurred claims (LIC), including the roll-forward and
the granularity of calculation required
»
Liability for remaining coverage (LRC) calculations under the Premium Allocation
Approach (PAA), including subsequent measurement and the underlying issues
»
The challenge in the treatment of premium experience compared to expected (known as
the premium variance)
»
Acquisition expenses and the implications from the change in the amendment
The main requirements facing P&C insurers
The new IFRS 17 insurance contracts accounting standard has created the need for a revised
set of measurement, accounting, and reporting functionalities for insurers. These range from
data manipulation, preprocessing (for example, the grouping of insurance contracts), and IFRS
17-specific calculations around LIC and LRC, to the disclosures. In particular, for P&C insurers,
a few of the main challenges include:
»
Assessing eligibility to use the Premium Allocation Approach (PAA) for contracts with
coverage longer than one year
»
Making a policy choice to use the PAA and simplifications allowed under the approach
»
Producing estimates of future cash flows using outputs from current reserving processes
»
Having the ability to discount the future cash flows longer than 12 months and selecting
the appropriate discount rate
»
Improving the IFRS 17 Chart of Accounts and posting logic, and tackling more complex
issues such as the impact of actual cash flows on measurement of insurance contracts
»
Taking advantage of the full General Measurement Model (GMM)—often referred to as
the Building Block Approach (BBA)—if the PAA option is not available; a key component is
the contractual service margin (CSM) on initial recognition and subsequent measurement
»
Converting accident-year claims triangles to underwriting-year triangles
»
Separating reserve developments into past and current service
»
Defining IFRS 17 risk groups

IFRS 17 SERIES
DECEMBER, 2020
Authors
Srini Iyer
Senior Director -- Solutions Specialist

Barbara Jaworek
Director -- Product Management

Khalid Mahomed
Senior Director -- Product Management
Contact Us
Americas
+1.212.553.1658
clientservices@moodys.com
Europe
+44.20.7772.5454
clientservices.emea@moodys.com
Asia (Excluding Japan)
+852.2916.1121
clientservices.asia@moodys.com
Japan
+81.3.5408.4100
clientservices.japan@moodys.com

To learn more about Moody's Analytics
solutions for IFRS 17, please visit
moodysanalytics.com/ifrs17

---
**Page 2**

MOODY’S ANALYTICS UNPACKING LRC AND LIC CALCULATIONS FOR P&C INSURERS
2
Overview of the Measurement Model under IFRS 17
Figure 1
IFRS 17 Measurement Model

In the measurement model shown in Figure 1, the insurance contract liabilities must be split into two components: LIC and LRC.
The standard method of calculating the LRC is to use the GMM (or BBA) method which consists of a discounted best-estimate of
future cash flows (BEL), a risk adjustment (RA), and a contractual service margin (CSM) representing the unearned profit. A
simplified approach known as the PAA for contracts that fulfills certain criteria is optional and similar to the current Unearned
Premium Reserve (UPR) approach.
The PAA can be used for insurance contracts with a coverage period of 12 months or less, or where the PAA and BBA do not
materially produce different results. This may be the case for many general insurance contracts but is a question for multi-year
contracts and risk attaching reinsurance, and remains a challenge for business acquired through acquisition or portfolio transfer.
The second component, the LIC, related to past coverage is measured similarly under both approaches. It corresponds to
components such as Incurred But Not Reported (IBNR) and Incurred But Not Enough Reported (IBNER) reserves, and outstanding
reported case reserves for expired risk under the current reserving approach.
On a higher level, the requirements appear feasible and consistent with current practice. For example, LIC is already calculated for
many insurers, particularly P&C insurers, and it is an important item in managing profitability.
However, challenges arise when looking into the details of IFRS 17 requirements. The granularity of the calculations, including
discounting for the disclosure, is not the same as the current practice. Therefore, it becomes more difficult.
For the LRC under the PAA, some elements under IFRS 17 such as the unearned premium reserve, premium receivable, and
deferred acquisition costs asset will be estimated similar to current practice. However, combined into one element and in practice,
new calculations may require significant effort.

---
**Page 3**

MOODY’S ANALYTICS UNPACKING LRC AND LIC CALCULATIONS FOR P&C INSURERS
3
Liabilities for incurred claims (LIC)
Figure 2
LIC calculation – data inputs

In the LIC calculation (Figure 2), the present value of future expected claims and expenses, and the risk adjustment are the two
components.
For the present value of cash flows (the best estimate liability (BEL)), we consider only the expected claim payments. If claims will
not be paid within 12 months from the incurred date, those cash flows need to be discounted, which is different from current
reserving processes.
The expected stream of future cash flows that insurers must include in the LIC calculation is a new requirement. Insurers may not
have this available as an output of current reserving processes. Moody’s Analytics has worked with clients to enable them to
produce the stream of cash flows using their current resulting output (that is, the total outstanding claims reserve). We use the
insurer’s claim payment patterns to generate the stream of cash flows by IFRS 17 group.
Although the process may seem straightforward, it gets complicated if insurers have different cash flows that may or may not be
related to each other, or if they have to allow for events not in the data. Also, maintaining the link between direct insurance and
reinsurance may be a challenge.
Roll-forward of LIC
Figure 3
LIC calculation – granularity of analysis

LIC roll-forward is driven by the IFRS 17 reporting and disclosure requirements. Insurers have to produce reconciliation of the
opening and closing balances by isolating specific items for reporting.

---
**Page 4**

MOODY’S ANALYTICS UNPACKING LRC AND LIC CALCULATIONS FOR P&C INSURERS
4
Figure 3 shows the requirements in terms of reporting in the bottom row. Looking at the actual roll-forward, we see the middle
row showing the steps in the calculation that insurers need to isolate. The top row is an example of the inputs required to produce
these results.
The standard requires insurers to split the insurance result from the finance result. This means that items related to discounting
(time value of money) and any changes must be isolated in this roll-forward. These are reported in separate parts of the insurer’s
P&L. The interest accretion, the unwinding of insurers’ discount rates, or any changes in financial assumptions are the elements
reported as the net finance expense from insurance contracts.
Another requirement under IFRS 17 is a split between current and past service. Past service relates to the changes in estimates of
claims that are incurred in previous reporting periods. An example would be a change in what is known as the Incurred But Not
Reported (IBNR) for previous years, together with any variation between what insurers were expecting to pay for previous years’
incurred claims and what was paid. Those variations will go into the P&L as past service.
Insurers need the capability to do some of these calculations. This is necessary to capture the impact from a change in the
previous and current assumptions, such as a change in the discount rate.
The granularity of the analysis required is complex and requires new data. The calculations are subject to audit because they
represent items in an insurer’s P&L. Insurers need a robust system that can manage the data and calculations, and store them in an
auditable system.
The granularity of calculation for LIC
Figure 4
LIC calculation – granularity of calculation

For the level of granularity at which calculations need to be performed (Figure 4), there are two aspects to consider. First is the
unit of account (UoA). The standard unit of account under IFRS 17 is the group contracts.
The second aspect relates to the level at which insurance contract assets and liabilities are reported. Before the amendments to
IFRS 17 were published in June 2020, insurers had to perform their LIC calculation at the group contract level to identify whether a
group of contracts was an asset or liability. With the amendments, the International Accounting Standards Board (the Board) has
changed the requirement; insurers can now report assets and liabilities at the portfolio level.
However, some requirements may still need calculations on the group contract level—for example, if insurers decide to
disaggregate insurance finance expense between the P&L and OCI. The expense is based on the rate locked in at inception, which
is determined at the IFRS 17 group level. Hence, insurers must do the calculations at that level.
These issues drive the need for a robust system to perform calculations and store the results at the group contract level to report
on these results.

---
**Page 5**

MOODY’S ANALYTICS UNPACKING LRC AND LIC CALCULATIONS FOR P&C INSURERS
5
LRC calculations under PAA, and the underlying challenges
The calculation method for LRC will depend on the model that has been used; for P&C insurers, it will be either PAA or GMM. The
GMM is complex because it contains multiple building blocks with interaction between those elements. The movements of each
element must be analyzed in each reporting period and for each group of contracts. For short duration contracts, this extensive
analysis would not deliver much value as the movements would not be as significant. This is why the Board introduced the PAA
approach, which is simpler. Under this approach, there is no need to separate the components of the LRC.
Measurement of the LRC under the PAA is not very different from the current measurements model for short-term liabilities in
many jurisdictions.
Figure 5
LRC computation under PAA

The middle row of Figure 5 shows the roll-forward of the LRC under the PAA. Note, there is no separate calculation for earned
premium reserve and for premium receivable under PAA. All the calculations are based on the premiums received, less the
expected premiums to be received allocated to the period.
The PAA does not have an explicit deferred acquisition cost element. Insurers will report the acquisition costs that are already paid,
less the amortized portion of those expenses. This results in a significant challenge created by the timing of the premium received,
and whether it is based on an installment or if it is correlated.
Premium variance treatment
One other area of complexity under the PAA is the premium variance treatment, which involves the treatment of the premium
experience adjustment. Deciding whether premium experience adjustments relate to current, past, or future service may be
difficult and require judgment. A situation may occur in which insurers will have a mixture of adjustments to current or past and to
future years.
The IFRS 17 Transition Resource Group (TRG) offered some guidance in 2019 and concluded that the premium experience relating
to current or past service should be recognized immediately in the P&L as part of the insurance revenue. In addition, the TRG
provided some examples to illustrate it. However, the examples do not reflect all the scenarios, and some questions remain.
For the TRG examples, the insurer did not know at the start of the period about the future premium adjustment and did not
include it in the calculation of future revenue. However, in real life insurers might have a good prediction of what the future
premium adjustment will be. Hence, the problem arises when deciding if this additional premium paid later is indeed a new
premium adjustment, or known expected future cash flows that should be included in the calculation from inception.
There may also be a situation in which the insurer expects future premium adjustments not at the end of the period, but later. In
such a situation, the assumptions must be monitored and updated at the end of the reporting period. If there was a situation
where the future premium adjustment was not paid as expected, then the revenue already recognized in the previous period would

---
**Page 6**

MOODY’S ANALYTICS UNPACKING LRC AND LIC CALCULATIONS FOR P&C INSURERS
6
result in losses in subsequent periods. Here lies the complexity, with the increased need for continuous tracking of the
assumptions and the number of necessary adjustments.
In another scenario, there may be a delay of the premium payment at the end of the year, such as a premium that is due on
December 30 but is paid on January 2. The standard approach to recognize a premium adjustment at the end of the year would
result in writing off an expected revenue from a contract at the end of the period—even though the premium was delayed only by
a few days. This creates unnecessary volatility between periods and does not portray the real nature of the transaction.
Finally, there are also questions if the premium dissipates in a subsequent period after coverage ends. How would it be treated on
the balance sheet of that year? Do insurers still have LRC even though the coverage expired, and they are not providing any further
coverage, or is it some other sort of receivable?
Thus, there are several issues and varying interpretations to remember when designing a reporting solution so the system can offer
various options to address significant issues.
Acquisition expenses
Another amendment issued by the Board relates to acquisition expenses. Although it is helpful for many insurers, it also adds more
complexity.
Before the amendment, insurers were required to allocate all initial acquisition expenses to contracts already written. This could
result in recognizing significant losses on initial contracts. It would not be consistent with economic substance, under which some
of those acquisition costs borne upfront existed because insurers expect renewals of the contracts in the future periods.
The amendment brings the process closer to the current practice. It requires insurers to allocate the directly attributable
acquisition cash flows in a systematic and rational way between the current and future renewal groups. Expenses related to future
contracts will be kept as an asset until the contracts are written. This amendment should make profit recognition more stable.
However, insurers should be aware of the complexity created by this amendment. For example:
»
The Board did not prescribe what methods to use for systematic and rational allocation. Thus, insurers must develop their
own methods and exercise judgment when they analyze which cash flows relate to expected future renewals. These allocation
methods may need to be revised and updated at the end of each reporting period if the expectations about the number of the
renewals change.
»
Another element to look at is impairment. The test is not required at every period, but only when facts and circumstances
suggest there is a need for it. The test itself is complicated and consists of two different steps. Similar to systematic rational
allocations, insurers need to develop policies regarding impairment. More work might be required when performing those
steps at the end of every period.
»
The granularity of calculations will be different compared to the current practice. The calculations that relate to future cash
flows and to the impairment will be required on a group contract level. Identifying future groups of contracts may be a
complex task that depends on judgement.
»
New disclosures will be required because of this amendment. One of them will be a reconciliation from opening to closing
balances of the assets.
»
The asset for acquisition cash flows will be shown as part of the current amount for the related portfolio and not as a separate
asset. This is another difference to insurers’ current practices.
One of the ways to avoid the complexity under the acquisition costs amendment would be to expense acquisition costs
immediately. However, by doing so companies would lose all the benefits of this amendment. To take advantage, insurers must be
aware and address all of these complexities.
Conclusion
There are multiple scenarios under which changes required to current models, data, and reporting might be more than trivial. To
comply with the new requirements, insurers should assess their current calculation engines’ capacity, and plan ahead for the
necessary updates.

---
**Page 7**

MOODY’S ANALYTICS UNPACKING LRC AND LIC CALCULATIONS FOR P&C INSURERS
BX3806

© 2020 Moody’s Corporation, Moody’s Investors Service, Inc., Moody’s Analytics, Inc. and/or their licensors and affiliates (collectively, “MOODY’S”). All rights reserved.
CREDIT RATINGS ISSUED BY MOODY'S INVESTORS SERVICE, INC. AND/OR ITS CREDIT RATINGS AFFILIATES ARE MOODY’S CURRENT OPINIONS OF THE RELATIVE
FUTURE CREDIT RISK OF ENTITIES, CREDIT COMMITMENTS, OR DEBT OR DEBT-LIKE SECURITIES, AND MATERIALS, PRODUCTS, SERVICES AND INFORMATION
PUBLISHED BY MOODY’S (COLLECTIVELY, “PUBLICATIONS”) MAY INCLUDE SUCH CURRENT OPINIONS. MOODY’S INVESTORS SERVICE DEFINES CREDIT RISK AS
THE RISK THAT AN ENTITY MAY NOT MEET ITS CONTRACTUAL FINANCIAL OBLIGATIONS AS THEY COME DUE AND ANY ESTIMATED FINANCIAL LOSS IN THE
EVENT OF DEFAULT OR IMPAIRMENT. SEE MOODY’S RATING SYMBOLS AND DEFINITIONS PUBLICATION FOR INFORMATION ON THE TYPES OF CONTRACTUAL
FINANCIAL OBLIGATIONS ADDRESSED BY MOODY’S INVESTORS SERVICE CREDIT RATINGS. CREDIT RATINGS DO NOT ADDRESS ANY OTHER RISK, INCLUDING
BUT NOT LIMITED TO: LIQUIDITY RISK, MARKET VALUE RISK, OR PRICE VOLATILITY. CREDIT RATINGS, NON-CREDIT ASSESSMENTS (“ASSESSMENTS”), AND OTHER
OPINIONS INCLUDED IN MOODY’S PUBLICATIONS ARE NOT STATEMENTS OF CURRENT OR HISTORICAL FACT. MOODY’S PUBLICATIONS MAY ALSO INCLUDE
QUANTITATIVE MODEL-BASED ESTIMATES OF CREDIT RISK AND RELATED OPINIONS OR COMMENTARY PUBLISHED BY MOODY’S ANALYTICS, INC. AND/OR ITS
AFFILIATES. MOODY’S CREDIT RATINGS, ASSESSMENTS, OTHER OPINIONS AND PUBLICATIONS DO NOT CONSTITUTE OR PROVIDE INVESTMENT OR FINANCIAL
ADVICE, AND MOODY’S CREDIT RATINGS, ASSESSMENTS, OTHER OPINIONS AND PUBLICATIONS ARE NOT AND DO NOT PROVIDE RECOMMENDATIONS TO
PURCHASE, SELL, OR HOLD PARTICULAR SECURITIES. MOODY’S CREDIT RATINGS, ASSESSMENTS, OTHER OPINIONS AND PUBLICATIONS DO NOT COMMENT ON
THE SUITABILITY OF AN INVESTMENT FOR ANY PARTICULAR INVESTOR. MOODY’S ISSUES ITS CREDIT RATINGS, ASSESSMENTS AND OTHER OPINIONS AND
PUBLISHES ITS PUBLICATIONS WITH THE EXPECTATION AND UNDERSTANDING THAT EACH INVESTOR WILL, WITH DUE CARE, MAKE ITS OWN STUDY AND
EVALUATION OF EACH SECURITY THAT IS UNDER CONSIDERATION FOR PURCHASE, HOLDING, OR SALE.
MOODY’S CREDIT RATINGS, ASSESSMENTS, OTHER OPINIONS, AND PUBLICATIONS ARE NOT INTENDED FOR USE BY RETAIL INVESTORS AND IT WOULD BE RECKLESS
AND INAPPROPRIATE FOR RETAIL INVESTORS TO USE MOODY’S CREDIT RATINGS, ASSESSMENTS, OTHER OPINIONS OR PUBLICATIONS WHEN MAKING AN
INVESTMENT DECISION. IF IN DOUBT YOU SHOULD CONTACT YOUR FINANCIAL OR OTHER PROFESSIONAL ADVISER.
ALL INFORMATION CONTAINED HEREIN IS PROTECTED BY LAW, INCLUDING BUT NOT LIMITED TO, COPYRIGHT LAW, AND NONE OF SUCH INFORMATION MAY BE
COPIED OR OTHERWISE REPRODUCED, REPACKAGED, FURTHER TRANSMITTED, TRANSFERRED, DISSEMINATED, REDISTRIBUTED OR RESOLD, OR STORED FOR
SUBSEQUENT USE FOR ANY SUCH PURPOSE, IN WHOLE OR IN PART, IN ANY FORM OR MANNER OR BY ANY MEANS WHATSOEVER, BY ANY PERSON WITHOUT
MOODY’S PRIOR WRITTEN CONSENT.
MOODY’S CREDIT RATINGS, ASSESSMENTS, OTHER OPINIONS AND PUBLICATIONS ARE NOT INTENDED FOR USE BY ANY PERSON AS A BENCHMARK AS THAT TERM IS
DEFINED FOR REGULATORY PURPOSES AND MUST NOT BE USED IN ANY WAY THAT COULD RESULT IN THEM BEING CONSIDERED A BENCHMARK.
All information contained herein is obtained by MOODY’S from sources believed by it to be accurate and reliable. Because of the possibility of human or mechanical error as
well as other factors, however, all information contained herein is provided “AS IS” without warranty of any kind. MOODY'S adopts all necessary measures so that the
information it uses in assigning a credit rating is of sufficient quality and from sources MOODY'S considers to be reliable including, when appropriate, independent third-party
sources. However, MOODY’S is not an auditor and cannot in every instance independently verify or validate information received in the rating process or in preparing its
Publications.
To the extent permitted by law, MOODY’S and its directors, officers, employees, agents, representatives, licensors and suppliers disclaim liability to any person or entity for
any indirect, special, consequential, or incidental losses or damages whatsoever arising from or in connection with the information contained herein or the use of or inability to
use any such information, even if MOODY’S or any of its directors, officers, employees, agents, representatives, licensors or suppliers is advised in advance of the possibility of
such losses or damages, including but not limited to: (a) any loss of present or prospective profits or (b) any loss or damage arising where the relevant financial instrument is
not the subject of a particular credit rating assigned by MOODY’S.
To the extent permitted by law, MOODY’S and its directors, officers, employees, agents, representatives, licensors and suppliers disclaim liability for any direct or
compensatory losses or damages caused to any person or entity, including but not limited to by any negligence (but excluding fraud, willful misconduct or any other type of
liability that, for the avoidance of doubt, by law cannot be excluded) on the part of, or any contingency within or beyond the control of, MOODY’S or any of its directors,
officers, employees, agents, representatives, licensors or suppliers, arising from or in connection with the information contained herein or the use of or inability to use any such
information.
NO WARRANTY, EXPRESS OR IMPLIED, AS TO THE ACCURACY, TIMELINESS, COMPLETENESS, MERCHANTABILITY OR FITNESS FOR ANY PARTICULAR PURPOSE OF ANY
CREDIT RATING, ASSESSMENT, OTHER OPINION OR INFORMATION IS GIVEN OR MADE BY MOODY’S IN ANY FORM OR MANNER WHATSOEVER.
Moody’s Investors Service, Inc., a wholly-owned credit rating agency subsidiary of Moody’s Corporation (“MCO”), hereby discloses that most issuers of debt securities
(including corporate and municipal bonds, debentures, notes and commercial paper) and preferred stock rated by Moody’s Investors Service, Inc. have, prior to assignment of
any credit rating, agreed to pay to Moody’s Investors Service, Inc. for credit ratings opinions and services rendered by it fees ranging from $1,000 to approximately $2,700,000.
MCO and Moody’s investors Service also maintain policies and procedures to address the independence of Moody’s Investors Service credit ratings and credit rating processes.
Information regarding certain affiliations that may exist between directors of MCO and rated entities, and between entities who hold credit ratings from Moody’s Investors
Service and have also publicly reported to the SEC an ownership interest in MCO of more than 5%, is posted annually at www.moodys.com under the heading “Investor
Relations — Corporate Governance — Director and Shareholder Affiliation Policy.”
Additional terms for Australia only: Any publication into Australia of this document is pursuant to the Australian Financial Services License of MOODY’S affiliate, Moody’s
Investors Service Pty Limited ABN 61 003 399 657AFSL 336969 and/or Moody’s Analytics Australia Pty Ltd ABN 94 105 136 972 AFSL 383569 (as applicable). This document
is intended to be provided only to “wholesale clients” within the meaning of section 761G of the Corporations Act 2001. By continuing to access this document from within
Australia, you represent to MOODY’S that you are, or are accessing the document as a representative of, a “wholesale client” and that neither you nor the entity you represent
will directly or indirectly disseminate this document or its contents to “retail clients” within the meaning of section 761G of the Corporations Act 2001. MOODY’S credit rating
is an opinion as to the creditworthiness of a debt obligation of the issuer, not on the equity securities of the issuer or any form of security that is available to retail investors.
Additional terms for Japan only: Moody's Japan K.K. (“MJKK”) is a wholly-owned credit rating agency subsidiary of Moody's Group Japan G.K., which is wholly-owned by
Moody’s Overseas Holdings Inc., a wholly-owned subsidiary of MCO. Moody’s SF Japan K.K. (“MSFJ”) is a wholly-owned credit rating agency subsidiary of MJKK. MSFJ is not a
Nationally Recognized Statistical Rating Organization (“NRSRO”). Therefore, credit ratings assigned by MSFJ are Non-NRSRO Credit Ratings. Non-NRSRO Credit Ratings are
assigned by an entity that is not a NRSRO and, consequently, the rated obligation will not qualify for certain types of treatment under U.S. laws. MJKK and MSFJ are credit
rating agencies registered with the Japan Financial Services Agency and their registration numbers are FSA Commissioner (Ratings) No. 2 and 3 respectively.
MJKK or MSFJ (as applicable) hereby disclose that most issuers of debt securities (including corporate and municipal bonds, debentures, notes and commercial paper) and
preferred stock rated by MJKK or MSFJ (as applicable) have, prior to assignment of any credit rating, agreed to pay to MJKK or MSFJ (as applicable) for credit ratings opinions
and services rendered by it fees ranging from JPY125,000 to approximately JPY250,000,000.
MJKK and MSFJ also maintain policies and procedures to address Japanese regulatory requirements.