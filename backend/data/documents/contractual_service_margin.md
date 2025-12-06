# Contractual Service Margin (CSM) in IFRS 17

## Definition

The Contractual Service Margin (CSM) is a component of the carrying amount of an insurance contract liability that represents the unearned profit the entity will recognize as it provides services under the contract. It is a fundamental concept in IFRS 17 that ensures profits from insurance contracts are recognized over the coverage period.

## Key Principles

1. **No Day-One Profit**: IFRS 17 prohibits recognition of profit at initial recognition of a contract
2. **Profit Recognition Over Time**: Profits are recognized as services are provided
3. **Absorbs Future Service Changes**: Changes in estimates relating to future service adjust the CSM rather than immediately affecting profit or loss

## Initial Recognition of CSM

At initial recognition, the CSM is calculated as:

```
CSM = - (Present Value of Future Cash Flows + Risk Adjustment for Non-Financial Risk)
```

### Scenarios at Initial Recognition:

**Profitable Contract:**
- If the calculation results in a positive amount, this becomes the initial CSM
- No profit is recognized at initial recognition

**Onerous Contract:**
- If the calculation results in a negative amount, no CSM is recognized
- The loss is immediately recognized in profit or loss
- A loss component is established within the liability for remaining coverage

## Components Affecting CSM at Subsequent Measurement

### 1. Interest Accretion

The CSM accretes interest at the **locked-in discount rate** determined at initial recognition. This interest:
- Is not recognized in profit or loss
- Is added to the CSM balance
- Reflects the time value of money for deferred profit

### 2. Changes Relating to Future Service

Changes in estimates that relate to future coverage adjust the CSM:

**Adjustments that increase CSM:**
- Favorable experience variance relating to future service
- Favorable changes in assumptions for future cash flows
- Reduction in risk adjustment for future service

**Adjustments that decrease CSM:**
- Unfavorable experience variance relating to future service
- Unfavorable changes in assumptions for future cash flows
- Increase in risk adjustment for future service

### 3. Changes Relating to Current or Past Service

These changes **do NOT adjust the CSM** and are recognized immediately in profit or loss:
- Experience adjustments for the current period
- Changes in liabilities for incurred claims
- Changes in onerous contract estimates

### 4. Release of CSM

The CSM is released to profit or loss based on **coverage units**:

```
CSM Release = CSM Balance × (Coverage Units Provided / Total Expected Coverage Units)
```

## CSM in Different Measurement Models

### General Measurement Model (GMM/BBA)

- CSM is calculated using current estimates
- Discount rates for CSM interest accretion are locked in
- CSM adjustments follow standard rules above

### Variable Fee Approach (VFA)

For contracts with direct participation features:
- CSM is adjusted for the entity's share of changes in underlying items
- Financial risk changes adjust the CSM (not profit or loss)
- Interest accretion may use current rates

### Premium Allocation Approach (PAA)

- CSM is not explicitly calculated
- The liability for remaining coverage equals premiums received less acquisition costs amortized
- Profit recognition approximates that of the general model

## Onerous Contracts and Loss Component

### When Contracts Become Onerous

A group of contracts becomes onerous when:
```
Fulfilment Cash Flows > CSM Balance + Previous Loss Component
```

### Loss Component Treatment

- When onerous, a loss is recognized immediately
- A loss component is established within the liability
- Subsequent favorable changes first reduce the loss component before increasing CSM
- The loss component is allocated to subsequent period changes proportionally

## CSM by Group

### Grouping Requirements

CSM is calculated and tracked at the **group level**, not individual contract level. Groups must:
- Be within the same portfolio
- Have similar profitability at initial recognition
- Not include contracts issued more than one year apart

### Impact of Grouping

- Profitable and onerous contracts cannot offset each other
- Different cohorts (annual groups) are tracked separately
- This prevents cross-subsidization between different profitability groups

## Disclosure Requirements

Entities must disclose:
- Reconciliation of opening to closing CSM balance
- Breakdown of CSM movements (interest, experience, assumptions, release)
- Weighted average duration of CSM
- Information about loss-making groups
