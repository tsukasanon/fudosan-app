import { useState, useMemo } from "react";

const CATS = [
  { id: "income", label: "賃料収入", color: "#2ECC71", isIncome: true },
  { id: "shuzen", label: "修繕積立金", color: "#E74C3C" },
  { id: "kanri", label: "管理費", color: "#E67E22" },
  { id: "itaku", label: "管理委託費", color: "#9B59B6" },
  { id: "risoку", label: "ローン利息分", color: "#3498DB" },
  { id: "kotei", label: "固定資産税", color: "#1ABC9C" },
  { id: "zappi", label: "雑費", color: "#95A5A6" },
];

const MONTHS = ["1","2","3","4","5","6","7","8","9","10","11","12"];
const YEARS = [2024, 2025, 2026];

function fmt(n) {
  if (!n) return "—";
  return "¥" + Number(n).toLocaleString("ja-JP");
}

function parse(v) {
  const n = parseInt((v || "").replace(/,/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

export default function App() {
  const [year, setYear] = useState(2025);
  const [prop, setProp] = useState("物件A");
  const [props, setProps] = useState(["物件A"]);
  const [data, setData] = useState({});
  const [tab, setTab] = useState("input");
  const [editing, setEditing] = useState(null);
  const [val, setVal] = useState("");
  const [newProp, setNewProp] = useState("");

  const key = (p, c, m) => `${year}|${p}|${c}|${m}`;
  const get = (p, c, m) => data[key(p, c, m)] || "";
  const set = (p, c, m, v) => setData(prev => ({ ...prev, [key(p, c, m)]: v }));

  const summary = useMemo(() => {
    const r = {};
    CATS.forEach(cat => {
      r[cat.id] = 0;
      MONTHS.forEach((_, i) => { r[cat.id] += parse(get(prop, cat.id, i)); });
    });
    return r;
  }, [data, prop, year]);

  const totalIncome = summary["income"] || 0;
  const totalExp = CATS.filter(c => !c.isIncome).reduce((s, c) => s + summary[c.id], 0);
  const net = totalIncome - totalExp;

  const addProp = () => {
    if (!newProp.trim() || props.includes(newProp.trim())) return;
    setProps(p => [...p, newProp.trim()]);
    setProp(newProp.trim());
    setNewProp("");
  };

  const commit = () => {
    if (!editing) return;
    set(editing.p, editing.c, editing.m, val);
    setEditing(null);
    setVal("");
  };

  const bg = "#0F0F1A";
  const card = "rgba(255,255,255,0.05)";
  const border = "1px solid rgba(255,255,255,0.1)";

  return (
    <div style={{ minHeight: "100vh", background: bg, color: "#E8E8F0", fontFamily: "sans-serif", fontSize: 14 }}>

      {/* Header */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: border, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>🏠 不動産経費管理</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ background: "#1a1a2e", border: border, color: "#E8E8F0", borderRadius: 6, padding: "6px 10px" }}>
            {YEARS.map(y => <option key={y} value={y}>{y}年</option>)}
          </select>
          <select value={prop} onChange={e => setProp(e.target.value)} style={{ background: "#1a1a2e", border: border, color: "#E8E8F0", borderRadius: 6, padding: "6px 10px" }}>
            {props.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input value={newProp} onChange={e => setNewProp(e.target.value)} onKeyDown={e => e.key === "Enter" && addProp()} placeholder="新規物件名" style={{ background: "#1a1a2e", border: border, color: "#E8E8F0", borderRadius: 6, padding: "6px 10px", width: 130 }} />
          <button onClick={addProp} style={{ background: "#764ba2", border: "none", color: "#fff", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>追加</button>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "rgba(255,255,255,0.05)", margin: "16px 24px", borderRadius: 10, overflow: "hidden" }}>
        {[["収入合計", totalIncome, "#2ECC71"], ["経費合計", totalExp, "#E74C3C"], ["差引損益", net, net >= 0 ? "#2ECC71" : "#E74C3C"]].map(([label, v, color]) => (
          <div key={label} style={{ padding: "16px 20px", background: bg }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color }}>{fmt(v)}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, padding: "0 24px" }}>
        {[["input", "📝 入力"], ["summary", "📊 申告サマリー"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: "8px 18px", borderRadius: "8px 8px 0 0", border: border, background: tab === id ? card : "transparent", color: tab === id ? "#a78bfa" : "#888", fontWeight: tab === id ? 700 : 400, cursor: "pointer" }}>{label}</button>
        ))}
      </div>

      <div style={{ margin: "0 24px 40px", background: card, border: border, borderRadius: "0 8px 8px 8px", overflow: "hidden" }}>

        {/* Input Tab */}
        {tab === "input" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                  <th style={{ padding: "10px 16px", textAlign: "left", color: "#666", position: "sticky", left: 0, background: "#111122", minWidth: 140, borderBottom: border }}>項目</th>
                  {MONTHS.map(m => <th key={m} style={{ padding: "10px 8px", textAlign: "right", color: "#666", minWidth: 80, borderBottom: border }}>{m}月</th>)}
                  <th style={{ padding: "10px 14px", textAlign: "right", color: "#a78bfa", minWidth: 100, borderBottom: border }}>年間合計</th>
                </tr>
              </thead>
              <tbody>
                {CATS.map((cat, ci) => (
                  <tr key={cat.id} style={{ borderBottom: ci === 0 ? "2px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "8px 16px", position: "sticky", left: 0, background: "#111122" }}>
                      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: cat.color, marginRight: 8 }}></span>
                      {cat.label}
                      {cat.isIncome && <span style={{ marginLeft: 6, fontSize: 9, background: "rgba(46,204,113,0.15)", color: "#2ECC71", borderRadius: 3, padding: "1px 5px" }}>収入</span>}
                    </td>
                    {MONTHS.map((_, mi) => {
                      const isEdit = editing && editing.p === prop && editing.c === cat.id && editing.m === mi;
                      const v = get(prop, cat.id, mi);
                      return (
                        <td key={mi} style={{ padding: "4px 6px", textAlign: "right" }}>
                          {isEdit ? (
                            <input autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={commit} onKeyDown={e => e.key === "Enter" && commit()} style={{ width: "100%", background: "rgba(102,126,234,0.15)", border: "1px solid #667eea", color: "#E8E8F0", borderRadius: 4, padding: "4px 6px", textAlign: "right" }} />
                          ) : (
                            <div onClick={() => { setEditing({ p: prop, c: cat.id, m: mi }); setVal(v); }} style={{ padding: "4px 6px", borderRadius: 4, cursor: "pointer", color: v ? (cat.isIncome ? "#2ECC71" : "#E8E8F0") : "#333" }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                              {v ? fmt(parse(v)) : "—"}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td style={{ padding: "8px 14px", textAlign: "right", fontWeight: 700, color: cat.isIncome ? "#2ECC71" : "#a78bfa" }}>{fmt(summary[cat.id])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "10px 16px", color: "#444", fontSize: 12 }}>💡 セルをクリックして金額を入力 → Enterで確定</div>
          </div>
        )}

        {/* Summary Tab */}
        {tab === "summary" && (
          <div style={{ padding: 28 }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>{year}年 不動産所得の内訳 — {prop}</div>

            <div style={{ border: "1px solid rgba(46,204,113,0.3)", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ padding: "10px 16px", background: "rgba(46,204,113,0.1)", fontWeight: 700, color: "#2ECC71" }}>■ 収入の部</div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <span>不動産収入（賃料）</span><span style={{ fontWeight: 700 }}>{fmt(totalIncome)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "rgba(46,204,113,0.05)", borderTop: "1px solid rgba(46,204,113,0.2)" }}>
                <span style={{ fontWeight: 700, color: "#2ECC71" }}>収入合計</span><span style={{ fontSize: 18, fontWeight: 800, color: "#2ECC71" }}>{fmt(totalIncome)}</span>
              </div>
            </div>

            <div style={{ border: "1px solid rgba(231,76,60,0.3)", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ padding: "10px 16px", background: "rgba(231,76,60,0.1)", fontWeight: 700, color: "#E74C3C" }}>■ 経費の部</div>
              {CATS.filter(c => !c.isIncome).map(cat => (
                <div key={cat.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color: "#B0B0C0" }}>{cat.label}</span><span>{fmt(summary[cat.id])}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "rgba(231,76,60,0.05)", borderTop: "1px solid rgba(231,76,60,0.2)" }}>
                <span style={{ fontWeight: 700, color: "#E74C3C" }}>経費合計</span><span style={{ fontSize: 18, fontWeight: 800, color: "#E74C3C" }}>{fmt(totalExp)}</span>
              </div>
            </div>

            <div style={{ padding: 20, borderRadius: 10, background: net >= 0 ? "rgba(46,204,113,0.08)" : "rgba(231,76,60,0.08)", border: `1px solid ${net >= 0 ? "rgba(46,204,113,0.3)" : "rgba(231,76,60,0.3)"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>収入合計 − 経費合計</div>
                  <div style={{ fontWeight: 700 }}>申告所得額</div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: net >= 0 ? "#2ECC71" : "#E74C3C" }}>{net < 0 && "▲"}{fmt(Math.abs(net))}</div>
              </div>
              {net < 0 && <div style={{ marginTop: 8, fontSize: 11, color: "#888" }}>※ 赤字の場合、給与所得等との損益通算が可能な場合があります（税理士にご確認ください）</div>}
            </div>

            <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: border, fontSize: 11, color: "#666", lineHeight: 1.8 }}>
              ⚠️ このデータはあくまで参考値です。確定申告の際は税理士または税務署にご確認ください。<br />
              ローン利息分のみが経費計上可能（元本返済分は不可）です。
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
