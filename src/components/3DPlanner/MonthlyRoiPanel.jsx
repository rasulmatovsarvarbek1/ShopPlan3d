import React, { useMemo } from 'react';
import { useAppStore, UZS_RATE } from '../../store/useAppStore';
import { TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export const MonthlyRoiPanel = ({ grandTotal, formatPrice }) => {
  const {
    monthlyExpenses,
    expectedMonthlyRevenue,
    setMonthlyExpense,
    setExpectedMonthlyRevenue,
    currency,
  } = useAppStore();

  const totalMonthlyExpense =
    (monthlyExpenses.rent || 0) +
    (monthlyExpenses.utilities || 0) +
    (monthlyExpenses.staffSalary || 0) * (monthlyExpenses.staffCount || 1) +
    (monthlyExpenses.otherExpenses || 0);

  const monthlyNet = expectedMonthlyRevenue - totalMonthlyExpense;
  const isProfitable = monthlyNet > 0;
  const paybackMonths = isProfitable ? Math.ceil(grandTotal / monthlyNet) : null;

  const chartData = useMemo(() => {
    const data = [{ month: 0, label: '0', cumulative: -grandTotal }];
    let cumulative = -grandTotal;
    for (let i = 1; i <= 12; i++) {
      cumulative += monthlyNet;
      data.push({ month: i, label: `${i}`, cumulative: Math.round(cumulative) });
    }
    return data;
  }, [grandTotal, monthlyNet]);

  const handleNum = (field) => (e) => {
    const val = parseFloat(e.target.value);
    setMonthlyExpense(field, Number.isFinite(val) ? val : 0);
  };

  const inputStyle = {
    width: '100%',
    padding: '6px 10px',
    borderRadius: 'var(--radius-sm)',
    background: '#f8fafc',
    border: '1.5px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '0.82rem',
    outline: 'none',
  };

  const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: '3px',
    display: 'block',
  };

  return (
    <div className="smeta-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
        <TrendingUp size={16} color="var(--accent-violet)" />
        Oylik Xarajatlar & ROI
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div>
          <label style={labelStyle}>Ijara ($)</label>
          <input type="number" min="0" value={monthlyExpenses.rent || ''} onChange={handleNum('rent')} style={inputStyle} placeholder="0" />
        </div>
        <div>
          <label style={labelStyle}>Kommunal ($)</label>
          <input type="number" min="0" value={monthlyExpenses.utilities || ''} onChange={handleNum('utilities')} style={inputStyle} placeholder="0" />
        </div>
        <div>
          <label style={labelStyle}>Xodim maoshi ($)</label>
          <input type="number" min="0" value={monthlyExpenses.staffSalary || ''} onChange={handleNum('staffSalary')} style={inputStyle} placeholder="0" />
        </div>
        <div>
          <label style={labelStyle}>Xodimlar soni</label>
          <input
            type="number"
            min="1"
            value={monthlyExpenses.staffCount ?? 1}
            onChange={(e) => setMonthlyExpense('staffCount', Math.max(1, parseInt(e.target.value, 10) || 1))}
            style={inputStyle}
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Boshqa xarajatlar ($)</label>
          <input type="number" min="0" value={monthlyExpenses.otherExpenses || ''} onChange={handleNum('otherExpenses')} style={inputStyle} placeholder="0" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Kutilayotgan oylik daromad ($)</label>
          <input type="number" min="0" value={expectedMonthlyRevenue || ''} onChange={(e) => {
            const val = parseFloat(e.target.value);
            setExpectedMonthlyRevenue(Number.isFinite(val) ? val : 0);
          }} style={inputStyle} placeholder="0" />
        </div>
      </div>

      <div style={{
        background: 'var(--accent-violet-light)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.65rem 0.75rem',
        fontSize: '0.8rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Jami oylik xarajat:</span>
          <strong>{formatPrice(totalMonthlyExpense)}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Oylik foyda (daromad − xarajat):</span>
          <strong style={{ color: isProfitable ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
            {formatPrice(monthlyNet)}
          </strong>
        </div>
      </div>

      {/* ROI natija */}
      <div style={{
        background: isProfitable ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
        border: `1px solid ${isProfitable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: '0.85rem',
        textAlign: 'center',
      }}>
        {!expectedMonthlyRevenue ? (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <DollarSign size={18} style={{ margin: '0 auto 4px', opacity: 0.5 }} />
            Kutilayotgan oylik daromadni kiriting — ROI hisoblanadi
          </div>
        ) : !isProfitable ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--accent-rose)' }}>
            <AlertTriangle size={15} />
            Kutilayotgan daromad oylik xarajatlarni qoplamayapti
          </div>
        ) : (
          <>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
              Boshlang'ich sarmoya o'zini oqlash muddati
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
              ~{paybackMonths} oy
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {formatPrice(grandTotal)} sarmoya ÷ {formatPrice(monthlyNet)}/oy foyda
            </div>
          </>
        )}
      </div>

      {/* 12 oylik grafik */}
      {expectedMonthlyRevenue > 0 && (
        <div style={{ height: 160, marginTop: '0.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
            12 oylik kumulyativ foyda/zarar ({currency})
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: currency === 'UZS' ? 12 : 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} label={{ value: 'Oy', position: 'insideBottom', offset: -2, fontSize: 10 }} />
              <YAxis
                tick={{ fontSize: 9 }}
                tickFormatter={(v) => currency === 'UZS' ? `${Math.round(v * UZS_RATE / 1000)}k` : `$${Math.round(v / 1000)}k`}
              />
              <Tooltip
                formatter={(v) => [formatPrice(v), 'Kumulyativ']}
                labelFormatter={(l) => `${l}-oy`}
              />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke={isProfitable ? '#10b981' : '#f43f5e'}
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
