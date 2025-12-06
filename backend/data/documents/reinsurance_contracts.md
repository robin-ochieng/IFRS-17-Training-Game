# Reinsurance Contracts in IFRS 17

## Overview

IFRS 17 provides specific guidance for reinsurance contracts, addressing both:
- **Reinsurance contracts issued** (where the entity is the reinsurer)
- **Reinsurance contracts held** (where the entity cedes risk to a reinsurer)

This document focuses primarily on reinsurance contracts held, as this is most relevant for primary insurers.

## Definition

A reinsurance contract is an insurance contract issued by one entity (the reinsurer) to compensate another entity (the cedant) for claims arising from one or more insurance contracts issued by that other entity (the underlying contracts).

## Key Principles for Reinsurance Held

### 1. Separate Measurement

Reinsurance contracts held are measured **separately** from underlying direct contracts:
- Not netted against direct insurance liabilities
- Separate recognition and measurement
- Presented as assets (or liabilities if in a net payable position)

### 2. Modified General Model

The measurement approach is similar to GMM but with modifications:
- Reflects the cedant's perspective
- Adjustments for credit risk
- Different treatment of CSM

### 3. Timing Differences

Reinsurance contracts may be recognized at different times than underlying contracts:
- Proportionate reinsurance: Usually at same time
- Non-proportionate: May be recognized before underlying events

## Measurement of Reinsurance Held

### Building Blocks

#### 1. Fulfilment Cash Flows

Present value of expected cash flows:

**Cash Outflows (to reinsurer):**
- Reinsurance premiums
- Ceding commissions (netted)
- Profit commissions (estimated)

**Cash Inflows (from reinsurer):**
- Expected recoveries
- Claims reimbursements
- Experience refunds

#### 2. Risk Adjustment

Represents the **reduction in risk** transferred to reinsurer:
- Typically a negative adjustment (reducing asset)
- Reflects risk benefit to cedant
- Consistent with direct contract methodology

#### 3. Contractual Service Margin (CSM)

**Key Difference from Direct Contracts:**
- CSM on reinsurance held can be **negative or positive** at initial recognition
- Represents expected net gain or loss from reinsurance
- Net cost of reinsurance is recognized over coverage period

### Initial Recognition

At initial recognition:

```
Reinsurance Contract Asset = Fulfilment Cash Flows + Risk Adjustment + CSM
```

**If Net Cost of Reinsurance:**
- CSM is negative (debit balance)
- Amortized as expense over coverage period

**If Net Gain Expected:**
- Gain is recognized immediately or over coverage period
- Depends on timing of underlying events

## Interaction with Underlying Contracts

### Onerous Underlying Contracts

**Important Rule:**
If underlying contracts are onerous at initial recognition:
- Cedant recognizes **immediate gain** from reinsurance
- To the extent reinsurance covers the onerous contracts
- Proportionate to coverage purchased

**Example:**
- Underlying contracts loss: $100,000
- Reinsurance covers 80%
- Immediate gain from reinsurance: $80,000

### CSM Linkage

Changes in estimates relating to future service:
- Adjust the reinsurance CSM
- Mirror treatment of underlying contracts
- Maintain economic relationship

## Proportionate vs Non-Proportionate Reinsurance

### Proportionate (Quota Share)

- Mirrors underlying contracts closely
- Same coverage period and pattern
- CSM release follows underlying

### Non-Proportionate (Excess of Loss)

- May have different boundary than underlying
- Covers specific layers or events
- CSM amortization based on stand-ready service

## Risk of Non-Performance by Reinsurer

### Credit Risk Adjustment

The cedant must consider the reinsurer's credit risk:
- Adjust fulfilment cash flows for expected losses
- Based on reinsurer's credit standing
- Updated at each reporting date

### Measurement

```
Credit Adjustment = Expected Recoveries × Probability of Default × Loss Given Default
```

### Presentation

Presented separately from:
- Expected credit losses on financial assets
- Insurance service expenses

## Premium Allocation Approach for Reinsurance

### Eligibility

PAA can be used for reinsurance held if:
- Coverage period is one year or less, OR
- Reasonable approximation to GMM

### Application

Similar to PAA for direct contracts:
- Simplified liability for remaining coverage
- Full measurement for incurred claims

## Recognition Timing

### When to Recognize

Reinsurance contract is recognized at the **earlier of**:
- Beginning of coverage period
- Date underlying onerous contracts are recognized
- Date entity becomes party to the contract (if before coverage)

### Retroactive Reinsurance

For coverage of past events:
- Net cost immediately in profit or loss
- Or allocated over remaining coverage period

## Disclosure Requirements

Entities must disclose:

### For Reinsurance Held:
- Carrying amounts by measurement model
- Effects of reinsurance on P&L
- Credit risk and exposures
- Relationship with underlying contracts

### Reconciliations:
- Liability for remaining coverage
- Liability for incurred claims
- CSM movements

## Practical Considerations

### Matching with Underlying

- Align grouping with underlying portfolios
- Consider practical expedients
- Document allocation methodologies

### Data Requirements

- Track recoveries by underlying cohort
- Monitor reinsurer creditworthiness
- Maintain claims recovery data

### Internal Controls

- Verify reinsurer calculations
- Reconcile expected vs actual recoveries
- Review credit exposure regularly

## Common Reinsurance Structures

| Type | Description | IFRS 17 Consideration |
|------|-------------|----------------------|
| Quota Share | Fixed percentage of all risks | Mirrors underlying closely |
| Surplus | Variable percentage by risk | More complex allocation |
| Excess of Loss | Coverage above retention | Stand-ready service |
| Stop Loss | Aggregate loss coverage | Event-based coverage |
| Catastrophe | Large event coverage | Short coverage period |
