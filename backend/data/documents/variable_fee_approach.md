# Variable Fee Approach (VFA) in IFRS 17

## Overview

The Variable Fee Approach (VFA) is a mandatory modification of the General Measurement Model (GMM) for insurance contracts with **direct participation features**. It reflects the unique nature of contracts where the policyholder has a right to share in the returns of underlying items.

## Contracts with Direct Participation Features

To qualify for VFA, a contract must have **direct participation features**, meaning at inception:

### Three Conditions (All Must Be Met):

1. **Contractual Terms Specify** that the policyholder participates in a share of a clearly identified pool of underlying items

2. **Substantial Share of Returns**: The entity expects to pay the policyholder an amount equal to a substantial share of the fair value returns on the underlying items

3. **Variability in Payments**: The entity expects a substantial proportion of any change in amounts payable to relate to changes in the fair value of underlying items

## Underlying Items

Underlying items are items that determine some of the amounts payable to policyholders:
- Investment portfolios (equity, bonds, property)
- Specified assets of the entity
- Other financial or non-financial items
- Any clearly identified pool of assets

## The Variable Fee Concept

### Entity's Share as a Variable Fee
Under VFA, the entity's share of the fair value of underlying items is viewed as a **fee for future service** (the variable fee).

### Variable Fee Components:
```
Variable Fee = Entity's Share of Underlying Items - Fulfilment Cash Flows (excluding underlying items)
```

This fee includes:
- Management charges
- Investment margins
- Mortality and other charges

## Key Differences from GMM

### 1. CSM Adjustment for Financial Risk

**GMM Treatment:**
- Changes in financial assumptions go to profit or loss (or OCI)
- CSM is not adjusted for financial changes

**VFA Treatment:**
- Changes in entity's share of underlying items adjust CSM
- Financial risk changes are deferred in CSM
- Recognizes the economic linkage between assets and liabilities

### 2. Discount Rate for CSM Interest

**GMM Treatment:**
- Locked-in rate at initial recognition

**VFA Treatment:**
- Current discount rate can be used
- Reflects dynamic relationship with underlying items

### 3. Time Value of Options and Guarantees

**GMM Treatment:**
- Changes go to profit or loss

**VFA Treatment:**
- May adjust CSM if they relate to future service

## Measurement Under VFA

### Initial Recognition

Same as GMM:
- Measure fulfilment cash flows
- Calculate CSM as plug

### Subsequent Measurement

Liability for remaining coverage includes:

1. **Fulfilment Cash Flows** (updated using current assumptions)

2. **CSM** adjusted for:
   - Interest accretion
   - Entity's share of changes in underlying items
   - Changes in fulfilment cash flows relating to future service
   - Effect of currency changes
   - Release based on coverage units

### CSM Adjustment Formula

```
CSM Movement = Interest Accretion 
             + Entity's Share of Δ Underlying Items 
             - Δ Fulfilment Cash Flows (future service)
             - Effect of Options and Guarantees Changes
             - CSM Release
```

## Risk Mitigation

### What is Risk Mitigation?

When an entity uses derivatives or other financial instruments to mitigate the effect of financial risk on the VFA variable fee.

### Accounting Mismatch Problem

Without special treatment:
- Derivative gains/losses go to profit or loss
- Changes in variable fee adjust CSM
- Creates artificial volatility

### Risk Mitigation Option

IFRS 17 allows entities to:
- Recognize changes in the effect of financial risk on the CSM in profit or loss (or OCI)
- Match the treatment of the hedging instrument
- Reduce accounting mismatches

### Conditions for Risk Mitigation

- Entity has a documented risk management objective
- There is an economic relationship between risk and hedge
- Hedge is consistent with objective each reporting period

## Profit Recognition Pattern

### Coverage Units for VFA

Coverage units should reflect:
- Both insurance coverage and investment-return service
- The quantity of benefits provided
- Expected period of service

### Dual Service Nature

VFA contracts typically provide:
1. **Insurance Service**: Death benefit, annuity payments
2. **Investment-Return Service**: Return on policyholder's investment

Both should be reflected in coverage units and CSM release.

## Comparison: GMM vs VFA

| Aspect | GMM | VFA |
|--------|-----|-----|
| Eligibility | Default model | Direct participation required |
| Financial Risk Changes | P&L or OCI | Adjust CSM |
| CSM Interest Rate | Locked-in | Can use current |
| Variable Fee Concept | No | Yes |
| Risk Mitigation Option | No | Yes |
| Investment Service | Often minimal | Significant |

## Common VFA Contracts

- Unit-linked life insurance
- With-profits contracts
- Universal life insurance
- Variable annuities
- Participating contracts with significant investment component

## Practical Considerations

### Determining Participation Share

- Review contract terms carefully
- Consider guarantees that cap participation
- Assess whether participation is "substantial"

### Underlying Items Identification

- Must be clearly identified
- Can be actual or notional portfolio
- Track fair value changes accurately

### Systems Requirements

- Track underlying items fair values
- Calculate entity's share accurately
- Implement CSM adjustments for financial changes
