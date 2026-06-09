import { useDataStore } from '../services/dataStore';
import { getBillingEnabled } from '../services/configStorage';
import { formatTokens, formatCost } from '../services/billingService';

export default function BillingCorner() {
  const { data } = useDataStore();
  const { totalInputTokens, totalOutputTokens, totalCost } = data.billing;
  const enabled = getBillingEnabled();
  const hasData = totalInputTokens > 0 || totalOutputTokens > 0;

  if (!hasData) {
    return (
      <div className="billing-corner">
        <span className="billing-corner-text">会话用量: --</span>
      </div>
    );
  }

  const tokensText = `输入 ${formatTokens(totalInputTokens)} / 输出 ${formatTokens(totalOutputTokens)} tokens`;
  const display = enabled ? `${tokensText} · ${formatCost(totalCost)}` : tokensText;

  return (
    <div className="billing-corner">
      <span className="billing-corner-text">会话用量: {display}</span>
    </div>
  );
}
