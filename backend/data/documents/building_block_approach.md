# Building Block Approach (BBA) in IFRS 17

## Overview

The Building Block Approach (BBA), also known as the General Measurement Model (GMM), is the default measurement approach under IFRS 17 for insurance contracts. It consists of four key building blocks that together determine the value of an insurance contract liability.

## The Four Building Blocks

### 1. Estimates of Future Cash Flows

The first building block consists of **probability-weighted estimates of future cash flows** that arise as the entity fulfills the insurance contracts. These include:

#### Cash Inflows:
- Premiums (including additional premiums)
- Investment component returns
- Any other amounts due from policyholders

#### Cash Outflows:
- Claims and benefits payments
- Policyholder expenses
- Acquisition costs (directly attributable)
- Claims handling costs
- Policy administration and maintenance costs
- Investment component payments

#### Characteristics of Cash Flow Estimates:
- Must incorporate all reasonable and supportable information available without undue cost or effort
- Should reflect the entity's current expectations
- Must be explicit (not implicit in discount rates)
- Should be consistent with observable market prices

### 2. Time Value of Money (Discount Rate)

The second building block is the **present value adjustment** applied to future cash flows. The discount rate must:

- Reflect the time value of money
- Reflect the financial risks associated with cash flows (to the extent not included in cash flow estimates)
- Be consistent with observable current market prices
- Exclude factors not relevant to the cash flows (e.g., credit risk)

#### Approaches to Determine Discount Rate:

**Bottom-up approach:** Start with a liquid risk-free yield curve and add an illiquidity premium reflecting the characteristics of the insurance contracts.

**Top-down approach:** Start with a yield curve based on a reference portfolio of assets and adjust for differences in characteristics.

### 3. Risk Adjustment for Non-Financial Risk

The third building block is the **risk adjustment**, which represents the compensation the entity requires for bearing uncertainty about the amount and timing of cash flows arising from non-financial risk.

#### Key Features:
- Should reflect the entity's degree of risk aversion
- Is measured separately from other building blocks
- Decreases as risks are resolved over time
- Provides useful information about pricing and profitability

#### Measurement Techniques:
- Confidence level techniques
- Cost of capital approaches
- Conditional tail expectation (CTE)

There is no prescribed technique; entities must disclose the confidence level equivalent of their risk adjustment.

### 4. Contractual Service Margin (CSM)

The fourth building block is the **Contractual Service Margin**, which represents the unearned profit from insurance contracts.

#### Characteristics:
- Cannot be negative at initial recognition (if negative, a loss is recognized immediately)
- Is unlocked for changes in fulfilment cash flows relating to future service
- Is accreted with interest over the coverage period
- Is released to profit or loss based on coverage units

## Initial Recognition

At initial recognition, the CSM is calculated as:

```
CSM = - (Fulfilment Cash Flows + Acquisition Cash Flows)
```

If the result is negative, no CSM is recognized, and the loss is immediately recognized in profit or loss (creating an onerous contract).

## Subsequent Measurement

The liability for remaining coverage at subsequent reporting dates consists of:
- Fulfilment cash flows (updated estimates)
- CSM (adjusted and amortized)

### CSM Adjustments:
1. **Interest accretion** at the locked-in rate
2. **Changes in fulfilment cash flows** relating to future service (experience adjustments and assumption changes)
3. **Currency exchange differences** (if applicable)
4. **Release to profit or loss** based on coverage units

## Coverage Units

Coverage units represent the quantity of service provided under the contract. The CSM is released based on:
- The number of coverage units provided in the period
- Divided by the total expected coverage units remaining

Coverage units should reflect:
- The quantity of benefits provided
- The expected coverage period
- Both insurance and investment components where applicable
