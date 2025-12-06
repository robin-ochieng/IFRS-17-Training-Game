# Risk Adjustment for Non-Financial Risk in IFRS 17

## Definition

The Risk Adjustment for Non-Financial Risk is a component of the measurement of insurance contract liabilities under IFRS 17. It represents the compensation an entity requires for bearing the uncertainty about the amount and timing of cash flows that arises from non-financial risk as the entity fulfills insurance contracts.

## Purpose

The risk adjustment serves several important purposes:

1. **Compensates for Uncertainty**: Reflects the premium required for bearing non-financial risk
2. **Provides Information**: Gives users insight into the entity's pricing for uncertainty
3. **Reflects Market Price**: Approximates the amount a rational entity would require to transfer risk
4. **Separates from Other Estimates**: Makes risk compensation explicit rather than implicit

## Types of Non-Financial Risk Covered

### Insurance Risk
- Mortality and longevity risk
- Morbidity risk
- Lapse and persistency risk
- Expense risk
- Catastrophe risk

### Other Non-Financial Risks
- Operational risk (to the extent it affects cash flows)
- Expense assumption risk
- Policyholder behavior risk

## Characteristics of Risk Adjustment

According to IFRS 17, the risk adjustment should:

1. **Increase with greater uncertainty** - Larger range of outcomes = higher risk adjustment
2. **Increase with higher frequency of adverse outcomes** - More likely bad scenarios = higher adjustment
3. **Increase with longer duration** - Longer resolution period = higher adjustment
4. **Increase with wider probability distribution** - More dispersed outcomes = higher adjustment
5. **Decrease as risk resolves** - As experience emerges, uncertainty reduces
6. **Reflect degree of diversification** - Consider portfolio effects

## Measurement Techniques

IFRS 17 does not prescribe a specific technique for measuring the risk adjustment. Common approaches include:

### 1. Confidence Level Techniques

Measures the risk adjustment as the difference between:
- Expected (probability-weighted) cash flows
- Cash flows at a specified confidence level (e.g., 75th percentile)

**Example:**
- Expected claims: $1,000,000
- 75th percentile claims: $1,150,000
- Risk adjustment: $150,000

### 2. Cost of Capital Method

Calculates risk adjustment as the cost of holding capital to support the insurance liabilities:

```
Risk Adjustment = Σ (Capital Required × Cost of Capital Rate) / (1 + discount rate)^t
```

**Key inputs:**
- Required capital (regulatory or economic)
- Cost of capital rate (typically 6-10%)
- Duration of liability runoff

### 3. Conditional Tail Expectation (CTE)

Also known as Tail Value at Risk (TVaR):
- Measures the average of outcomes beyond a confidence level
- More sensitive to tail risk than confidence level approaches

**Formula:**
```
CTE(α) = E[X | X > VaR(α)]
```

## Disclosure Requirements

### Confidence Level Equivalent

Entities must disclose the **confidence level** to which their risk adjustment corresponds. This provides:
- Comparability between entities using different techniques
- Insight into management's risk appetite
- Information about the relative size of risk adjustment

### Reconciliation

Entities must reconcile movements in risk adjustment, showing:
- Opening balance
- Changes due to new business
- Changes due to experience variance
- Release to profit or loss
- Closing balance

## Risk Adjustment vs Risk Margin (IFRS 4)

| Aspect | IFRS 17 Risk Adjustment | IFRS 4 Risk Margin |
|--------|------------------------|-------------------|
| Methodology | Not prescribed | Often regulatory-based |
| Disclosure | Confidence level required | Limited requirements |
| Scope | Non-financial risk only | Could include all risks |
| Updates | Updated each period | Often static |

## Risk Adjustment in Different Models

### General Measurement Model
- Explicit risk adjustment required
- Changes in risk adjustment go to profit or loss
- Distinguishes between current and future service

### Variable Fee Approach
- Same treatment as GMM
- Changes adjust CSM only for future service

### Premium Allocation Approach
- Risk adjustment is part of liability for incurred claims
- May be simplified for short-duration contracts

## Release Pattern

The risk adjustment is released as:
- Risk expires over time
- Claims are settled
- Experience emerges and uncertainty resolves

The release should reflect the **pattern of service** and **risk reduction** over time.

## Practical Considerations

### Data Requirements
- Historical claims data
- Correlation analysis between risks
- Management's risk preferences

### Governance
- Regular review of methodology
- Consistency in application
- Board/actuarial oversight

### Sensitivity Analysis
- Impact of methodology choice
- Confidence level sensitivities
- Portfolio diversification effects
