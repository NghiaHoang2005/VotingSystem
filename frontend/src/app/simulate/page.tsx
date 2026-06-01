"use client";

import { useState } from "react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

// ─── Stepper ────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Sinh khóa", color: "blue" },
  { id: 2, label: "Mã hóa Phiếu", color: "green" },
  { id: 3, label: "Cộng Đồng Cấu", color: "purple" },
  { id: 4, label: "Giải Mã", color: "orange" },
];

const colorMap: Record<string, { ring: string; bg: string; text: string; border: string; glow: string; headerBg: string }> = {
  blue: { ring: "ring-blue-500", bg: "bg-blue-500", text: "text-blue-400", border: "border-blue-500/40", glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]", headerBg: "from-blue-600/20 to-blue-500/5" },
  green: { ring: "ring-green-500", bg: "bg-green-500", text: "text-green-400", border: "border-green-500/40", glow: "shadow-[0_0_20px_rgba(34,197,94,0.15)]", headerBg: "from-green-600/20 to-green-500/5" },
  purple: { ring: "ring-purple-500", bg: "bg-purple-500", text: "text-purple-400", border: "border-purple-500/40", glow: "shadow-[0_0_20px_rgba(139,92,246,0.15)]", headerBg: "from-purple-600/20 to-purple-500/5" },
  orange: { ring: "ring-orange-500", bg: "bg-orange-500", text: "text-orange-400", border: "border-orange-500/40", glow: "shadow-[0_0_20px_rgba(249,115,22,0.15)]", headerBg: "from-orange-600/20 to-orange-500/5" },
};

function Stepper({ currentStep, onStep }: { currentStep: number; onStep: (s: number) => void }) {
  return (
    <div className="flex items-center w-full mb-10">
      {STEPS.map((s, idx) => {
        const done = currentStep >= s.id;
        const active = currentStep === s.id - 1;
        const locked = currentStep < s.id - 1;
        const c = colorMap[s.color];
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => active ? onStep(s.id) : undefined}
              disabled={locked}
              className="flex flex-col items-center gap-2 disabled:cursor-not-allowed transition-all"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base border-2 transition-all duration-300
                ${done ? `${c.bg} border-transparent text-white ${c.ring} ring-2 ring-offset-2 ring-offset-slate-900` : ""}
                ${active ? `bg-transparent ${c.border.replace("/40", "")} ${c.text} border-2 animate-pulse` : ""}
                ${locked ? "bg-slate-800 border-slate-700 text-slate-600" : ""}
              `}>
                {done && currentStep > s.id
                  ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  : s.id
                }
              </div>
              <span className={`text-sm font-semibold whitespace-nowrap transition-colors
                ${done ? c.text : ""}
                ${active ? c.text : ""}
                ${locked ? "text-slate-600" : ""}
              `}>{s.label}</span>
            </button>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-3 mb-6 transition-all duration-500 ${currentStep > s.id ? c.bg : "bg-slate-700"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Card wrapper ────────────────────────────────────────────────────────────
function StepCard({ color, title, stepNum, children }: {
  color: string; title: string; stepNum: number; children: React.ReactNode;
}) {
  const c = colorMap[color];
  return (
    <div className={`rounded-2xl border ${c.border} ${c.glow} overflow-hidden mb-4 animate-fade-in`}>
      <div className={`bg-gradient-to-r ${c.headerBg} px-6 py-4 border-b ${c.border} flex items-center gap-3`}>
        <div className={`w-8 h-8 rounded-full ${c.bg} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
          {stepNum}
        </div>
        <h2 className={`text-xl font-bold ${c.text}`}>{title}</h2>
      </div>
      <div className="bg-slate-900/40 p-6">{children}</div>
    </div>
  );
}

// ─── Value badge ─────────────────────────────────────────────────────────────
function Val({ label, value, color }: { label: string; value: string | number | bigint; color?: string }) {
  return (
    <div className="flex items-baseline gap-2 font-mono">
      <span className="text-slate-400 text-base shrink-0">{label} =</span>
      <span className={`text-base font-bold ${color ?? "text-white"} bg-slate-950/70 px-3 py-1 rounded-lg border border-slate-800`}>
        {value.toString()}
      </span>
    </div>
  );
}

// ─── Section label ───────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">{children}</p>;
}

// ─── Formula box ─────────────────────────────────────────────────────────────
function FormulaBox({ label, children, note }: { label: string; children: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div className="mb-5 p-5 rounded-xl bg-slate-950/50 border border-slate-800">
      <SectionLabel>{label}</SectionLabel>
      {children}
      {note && <div className="text-slate-500 text-sm mt-2">{note}</div>}
    </div>
  );
}

// ─── Connector arrow ─────────────────────────────────────────────────────────
function Connector() {
  return (
    <div className="flex justify-center my-2">
      <div className="flex flex-col items-center text-slate-600">
        <div className="w-px h-4 bg-slate-700" />
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 16l-6-6h12z" />
        </svg>
      </div>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────
export default function SimulatePage() {
  const [step, setStep] = useState(0);
  const [keys, setKeys] = useState<{ n: string; g: string; lambda: string; mu: string } | null>(null);
  const [rA, setRA] = useState(0n);
  const [rB, setRB] = useState(0n);
  const [cA, setCA] = useState("");
  const [cB, setCB] = useState("");
  const [cSum, setCSum] = useState("");
  const [finalResult, setFinalResult] = useState("");
  // step 4 intermediates
  const [uVal, setUVal] = useState("");
  const [lVal, setLVal] = useState("");

  const voteA = 1n;
  const voteB = 0n;

  const modPow = (base: bigint, exp: bigint, mod: bigint): bigint => {
    let res = 1n; base = base % mod;
    while (exp > 0n) {
      if (exp % 2n === 1n) res = (res * base) % mod;
      exp = exp / 2n; base = (base * base) % mod;
    }
    return res;
  };

  const runStep = (nextStep: number) => {
    if (nextStep === 1) {
      setKeys({ n: "77", g: "78", lambda: "30", mu: "18" });

    } else if (nextStep === 2 && keys) {
      const n = BigInt(keys.n), nSq = n * n, g = BigInt(keys.g);
      const r_A = 4n, r_B = 5n;
      setRA(r_A); setRB(r_B);
      setCA(((modPow(g, voteA, nSq) * modPow(r_A, n, nSq)) % nSq).toString());
      setCB(((modPow(g, voteB, nSq) * modPow(r_B, n, nSq)) % nSq).toString());

    } else if (nextStep === 3 && keys) {
      const nSq = BigInt(keys.n) ** 2n;
      setCSum(((BigInt(cA) * BigInt(cB)) % nSq).toString());

    } else if (nextStep === 4 && keys) {
      const n = BigInt(keys.n), nSq = n * n;
      const u = modPow(BigInt(cSum), BigInt(keys.lambda), nSq);
      const l = (u - 1n) / n;
      const result = (l * BigInt(keys.mu)) % n;
      setUVal(u.toString());
      setLVal(l.toString());
      setFinalResult(result.toString());
    }
    setStep(nextStep);
  };

  const reset = () => {
    setStep(0); setKeys(null);
    setCA(""); setCB(""); setCSum(""); setFinalResult(""); setUVal(""); setLVal("");
  };

  return (
    <div className="w-full max-w-5xl glass-panel p-8">

      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-700/60">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Mô phỏng Paillier</h1>
          <p className="text-slate-400 text-base max-w-xl">
            Minh họa từng bước toán học của mã hóa đồng cấu. Số nhỏ (p=7, q=11) để có thể tự tính kiểm tra.
          </p>
        </div>
        <button onClick={reset} className="btn-secondary text-sm px-4 py-2 shrink-0">Reset</button>
      </div>

      {/* Stepper */}
      <Stepper currentStep={step} onStep={runStep} />

      {/* ── Bước 1: Sinh khóa ── */}
      {step >= 1 && keys && (
        <>
          <StepCard color="blue" stepNum={1} title="Sinh khóa Paillier (Key Generation)">
            <div className="grid md:grid-cols-2 gap-6">

              {/* Cột trái: tính toán từng bước */}
              <div className="space-y-5">
                <div>
                  <SectionLabel>Chọn hai số nguyên tố</SectionLabel>
                  <div className="space-y-2">
                    <Val label="p" value="7" />
                    <Val label="q" value="11" />
                  </div>
                </div>

                <div>
                  <SectionLabel>Tính modulus N và g</SectionLabel>
                  <div className="space-y-3">
                    <div className="text-base text-slate-300 pl-1">
                      <InlineMath math={`N = p \\times q = 7 \\times 11 = ${keys.n}`} />
                    </div>
                    <div className="text-base text-slate-300 pl-1">
                      <InlineMath math={`g = N + 1 = ${keys.g}`} />
                    </div>
                  </div>
                </div>

                <div>
                  <SectionLabel>Tính Private Key</SectionLabel>
                  <div className="space-y-3">
                    <div>
                      <div className="text-base text-slate-300 pl-1">
                        <InlineMath math={`\\lambda = \\text{lcm}(p-1,\\; q-1) = \\text{lcm}(6,\\; 10) = ${keys.lambda}`} />
                      </div>
                    </div>
                    <div>
                      <div className="text-base text-slate-300 pl-1">
                        <InlineMath math={`\\mu = \\left(L(g^\\lambda \\bmod N^2)\\right)^{-1} \\bmod N = ${keys.mu}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột phải: kết quả khóa */}
              <div className="space-y-4">
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-5">
                  <SectionLabel>Public Key — chia sẻ công khai</SectionLabel>
                  <div className="space-y-2">
                    <Val label="N" value={keys.n} color="text-white" />
                    <Val label="g" value={keys.g} color="text-white" />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-600/50 bg-slate-800/30 p-5">
                  <SectionLabel>Private Key — giữ bí mật</SectionLabel>
                  <div className="space-y-2">
                    <Val label="λ" value={keys.lambda} color="text-slate-200" />
                    <Val label="μ" value={keys.mu} color="text-slate-200" />
                  </div>
                </div>
              </div>
            </div>
          </StepCard>
          <Connector />
        </>
      )}

      {/* ── Bước 2: Mã hóa ── */}
      {step >= 2 && keys && (
        <>
          <StepCard color="green" stepNum={2} title="Mã hóa từng phiếu (Encryption)">
            <FormulaBox
              label="Công thức"
              note={<>m = phiếu bầu (1 hoặc 0) &nbsp;·&nbsp; r = số ngẫu nhiên bảo vệ tính ẩn danh, r phải nguyên tố cùng nhau với N</>}
            >
              <BlockMath math="C = g^m \times r^N \pmod{N^2}" />
            </FormulaBox>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: "Phiếu A — YES", m: voteA, r: rA, c: cA, latexM: "m_A = 1" },
                { label: "Phiếu B — NO", m: voteB, r: rB, c: cB, latexM: "m_B = 0" },
              ].map(({ label, m, r, c, latexM }) => (
                <div key={label} className="rounded-xl border border-green-500/25 bg-slate-950/40 p-5 space-y-3">
                  <p className="font-semibold text-white">{label}</p>
                  <div className="space-y-2">
                    <Val label="m" value={m} />
                    <Val label="r" value={r} />
                  </div>
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="text-sm text-slate-500">
                      <InlineMath math={`C = ${keys.g}^{${m}} \\times ${r.toString()}^{${keys.n}} \\pmod{${(BigInt(keys.n) ** 2n).toString()}}`} />
                    </div>
                    <Val label="C" value={c} color="text-green-400" />
                  </div>
                </div>
              ))}
            </div>
          </StepCard>
          <Connector />
        </>
      )}

      {/* ── Bước 3: Cộng Đồng Cấu ── */}
      {step >= 3 && keys && (
        <>
          <StepCard color="purple" stepNum={3} title="Cộng Đồng Cấu (Homomorphic Addition)">
            <FormulaBox
              label="Tính chất cốt lõi"
              note="Cộng hai phiếu trong không gian mã hóa = nhân hai ciphertext. Không cần giải mã."
            >
              <BlockMath math="\mathcal{E}(m_A + m_B) = \mathcal{E}(m_A) \times \mathcal{E}(m_B) \pmod{N^2}" />
            </FormulaBox>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-base text-slate-300">
                  <InlineMath math={`C_A = ${cA}`} />
                </div>
                <div className="text-base text-slate-300">
                  <InlineMath math={`C_B = ${cB}`} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
                <div className="text-base text-slate-300">
                  <InlineMath math={`C_{\\text{Sum}} = C_A \\times C_B \\pmod{N^2} = ${cA} \\times ${cB} \\pmod{${(BigInt(keys.n) ** 2n).toString()}}`} />
                </div>
                <div className="text-base text-slate-200 font-semibold">
                  <InlineMath math={`C_{\\text{Sum}} = ${cSum}`} />
                </div>
              </div>
            </div>
          </StepCard>
          <Connector />
        </>
      )}

      {/* ── Bước 4: Giải mã ── */}
      {step >= 4 && keys && (
        <StepCard color="orange" stepNum={4} title="Giải mã kết quả (Decryption)">
          <FormulaBox
            label="Công thức giải mã"
            note={<>trong đó <InlineMath math="L(u) = \dfrac{u - 1}{N}" /></>}
          >
            <BlockMath math="m = L\!\left(C_{\text{Sum}}^{\,\lambda} \bmod N^2\right) \times \mu \pmod{N}" />
          </FormulaBox>

          {/* Từng bước tính */}
          <div className="space-y-4 mb-6">
            <div>
              <div className="text-sm text-slate-400 mb-2">
                <InlineMath math={`u = C_{\\text{Sum}}^{\\lambda} \\bmod N^2 = ${cSum}^{${keys.lambda}} \\bmod ${(BigInt(keys.n) ** 2n).toString()}`} />
              </div>
              <Val label="u" value={uVal} color="text-slate-200" />
            </div>

            <div>
              <div className="text-sm text-slate-400 mb-2">
                <InlineMath math={`L(u) = \\dfrac{u - 1}{N} = \\dfrac{${uVal} - 1}{${keys.n}}`} />
              </div>
              <Val label="L(u)" value={lVal} color="text-slate-200" />
            </div>

            <div>
              <div className="text-sm text-slate-400 mb-2">
                <InlineMath math={`m = L(u) \\times \\mu \\bmod N = ${lVal} \\times ${keys.mu} \\bmod ${keys.n} = 1`} />
              </div>
            </div>
          </div>

          {/* Kết quả */}
          <div className="rounded-2xl border border-orange-500/40 bg-orange-500/5 p-6 text-center shadow-[0_0_30px_rgba(249,115,22,0.1)]">
            <p className="text-sm uppercase tracking-widest text-orange-400/70 font-semibold mb-3">Kết quả tổng phiếu</p>
            <div className="text-7xl font-black text-orange-400 drop-shadow-[0_0_25px_rgba(249,115,22,0.5)] mb-5">
              {finalResult}
            </div>
            <div className="text-base text-slate-300">
              <InlineMath math={`\\mathcal{D}(C_{\\text{Sum}}) = m_A + m_B = ${voteA} + ${voteB} = ${voteA + voteB}`} />
            </div>
            <p className="text-slate-500 text-sm mt-3">
              Phép cộng đồng cấu cho kết quả chính xác mà không cần giải mã từng phiếu riêng lẻ.
            </p>
          </div>
        </StepCard>
      )}

      {/* Prompt ban đầu */}
      {step === 0 && (
        <div className="text-center py-16 text-slate-600">
          <p className="text-lg mb-1">Nhấn vào <span className="text-blue-400 font-semibold">Bước 1</span> để bắt đầu</p>
          <p className="text-base">Mỗi bước sẽ mở khóa sau khi hoàn thành bước trước.</p>
        </div>
      )}
    </div>
  );
}
