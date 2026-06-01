"use client";

import { useState } from "react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

// ─── Math helpers ────────────────────────────────────────────────────────────
function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  if (mod === 1n) return 0n;
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % mod;
    exp = exp / 2n;
    base = (base * base) % mod;
  }
  return result;
}

function gcd(a: bigint, b: bigint): bigint {
  while (b !== 0n) { [a, b] = [b, a % b]; }
  return a;
}

function lcm(a: bigint, b: bigint): bigint {
  return (a / gcd(a, b)) * b;
}

function modInverse(a: bigint, m: bigint): bigint | null {
  // Extended Euclidean
  let [old_r, r] = [a, m];
  let [old_s, s] = [1n, 0n];
  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  if (old_r !== 1n) return null; // no inverse
  return ((old_s % m) + m) % m;
}

function L(u: bigint, n: bigint): bigint {
  return (u - 1n) / n;
}

function isPrime(n: bigint): boolean {
  if (n < 2n) return false;
  if (n === 2n) return true;
  if (n % 2n === 0n) return false;
  for (let i = 3n; i * i <= n; i += 2n) {
    if (n % i === 0n) return false;
  }
  return true;
}

// ─── Shared UI components ─────────────────────────────────────────────────────
const colorMap: Record<string, { bg: string; text: string; border: string; glow: string; headerBg: string; ring: string }> = {
  blue:   { bg: "bg-blue-500",   text: "text-blue-400",   border: "border-blue-500/40",   glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]",  headerBg: "from-blue-600/20 to-blue-500/5",   ring: "ring-blue-500"   },
  green:  { bg: "bg-green-500",  text: "text-green-400",  border: "border-green-500/40",  glow: "shadow-[0_0_20px_rgba(34,197,94,0.15)]",   headerBg: "from-green-600/20 to-green-500/5",  ring: "ring-green-500"  },
  orange: { bg: "bg-orange-500", text: "text-orange-400", border: "border-orange-500/40", glow: "shadow-[0_0_20px_rgba(249,115,22,0.15)]",  headerBg: "from-orange-600/20 to-orange-500/5",ring: "ring-orange-500" },
};

function SectionCard({ color, num, title, children }: {
  color: string; num: number; title: string; children: React.ReactNode;
}) {
  const c = colorMap[color];
  return (
    <div className={`rounded-2xl border ${c.border} ${c.glow} overflow-hidden mb-4 animate-fade-in`}>
      <div className={`bg-gradient-to-r ${c.headerBg} px-6 py-4 border-b ${c.border} flex items-center gap-3`}>
        <div className={`w-8 h-8 rounded-full ${c.bg} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
          {num}
        </div>
        <h2 className={`text-xl font-bold ${c.text}`}>{title}</h2>
      </div>
      <div className="bg-slate-900/40 p-6">{children}</div>
    </div>
  );
}

function FormulaBox({ label, children, note }: { label: string; children: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div className="mb-5 p-5 rounded-xl bg-slate-950/50 border border-slate-800">
      <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">{label}</p>
      {children}
      {note && <div className="text-slate-500 text-sm mt-2">{note}</div>}
    </div>
  );
}

function ResultRow({ label, value, color = "text-white" }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-slate-400 text-base shrink-0">{label} =</span>
      <span className={`text-base font-bold ${color} bg-slate-950/70 px-3 py-1 rounded-lg border border-slate-800 font-mono break-all`}>
        {value}
      </span>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, hint }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-300 mb-1">{label}</label>
      {hint && <p className="text-xs text-slate-500 mb-2">{hint}</p>}
      <input
        className="input-field"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-2">{msg}</p>;
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PlaygroundPage() {
  // ── Inputs
  const [pInput, setPInput] = useState("");
  const [qInput, setQInput] = useState("");
  const [mInput, setMInput] = useState("");
  const [rInput, setRInput] = useState("");
  const [cInput, setCInput] = useState("");

  // ── Computed keys
  const [keys, setKeys] = useState<{
    n: bigint; nSq: bigint; g: bigint; lambda: bigint; mu: bigint;
  } | null>(null);
  const [keyError, setKeyError] = useState("");

  // ── Encryption result
  const [encResult, setEncResult] = useState<{
    gm: bigint; rn: bigint; C: bigint;
  } | null>(null);
  const [encError, setEncError] = useState("");

  // ── Decryption result
  const [decResult, setDecResult] = useState<{
    u: bigint; lVal: bigint; m: bigint;
  } | null>(null);
  const [decError, setDecError] = useState("");

  // ── Sinh khóa ───────────────────────────────────────────────────────────────
  const handleGenKey = () => {
    setKeyError(""); setKeys(null); setEncResult(null); setDecResult(null);
    try {
      const p = BigInt(pInput.trim());
      const q = BigInt(qInput.trim());
      if (!isPrime(p)) { setKeyError(`p = ${p} không phải số nguyên tố.`); return; }
      if (!isPrime(q)) { setKeyError(`q = ${q} không phải số nguyên tố.`); return; }
      if (p === q)     { setKeyError("p và q phải khác nhau."); return; }

      const n      = p * q;
      const nSq    = n * n;
      const g      = n + 1n;
      const lambda = lcm(p - 1n, q - 1n);

      // μ = (L(g^λ mod N²))⁻¹ mod N
      const u  = modPow(g, lambda, nSq);
      const lu = L(u, n);
      const mu = modInverse(lu, n);
      if (mu === null) { setKeyError("Không thể tính μ — thử lại với p, q khác."); return; }

      setKeys({ n, nSq, g, lambda, mu });
    } catch {
      setKeyError("p và q phải là số nguyên dương.");
    }
  };

  // ── Mã hóa ──────────────────────────────────────────────────────────────────
  const handleEncrypt = () => {
    setEncError(""); setEncResult(null); setDecResult(null);
    if (!keys) return;
    try {
      const m = BigInt(mInput.trim());
      const r = BigInt(rInput.trim());
      if (m < 0n || m >= keys.n) { setEncError(`m phải trong khoảng [0, N-1] = [0, ${keys.n - 1n}].`); return; }
      if (r <= 1n || r >= keys.n) { setEncError(`r phải trong khoảng (1, N-1).`); return; }
      if (gcd(r, keys.n) !== 1n) { setEncError(`r và N không nguyên tố cùng nhau. Hãy chọn r khác.`); return; }

      const gm = modPow(keys.g, m, keys.nSq);
      const rn = modPow(r, keys.n, keys.nSq);
      const C  = (gm * rn) % keys.nSq;

      setEncResult({ gm, rn, C });
      setCInput(C.toString());
    } catch {
      setEncError("m và r phải là số nguyên dương.");
    }
  };

  // ── Giải mã ─────────────────────────────────────────────────────────────────
  const handleDecrypt = () => {
    setDecError(""); setDecResult(null);
    if (!keys) return;
    try {
      const C = BigInt(cInput.trim());
      if (C < 0n || C >= keys.nSq) { setDecError(`C phải trong khoảng [0, N²-1].`); return; }

      const u    = modPow(C, keys.lambda, keys.nSq);
      const lVal = L(u, keys.n);
      const m    = (lVal * keys.mu) % keys.n;

      setDecResult({ u, lVal, m });
    } catch {
      setDecError("C phải là một số nguyên hợp lệ.");
    }
  };

  const reset = () => {
    setPInput(""); setQInput(""); setMInput(""); setRInput(""); setCInput("");
    setKeys(null); setEncResult(null); setDecResult(null);
    setKeyError(""); setEncError(""); setDecError("");
  };

  return (
    <div className="w-full max-w-4xl glass-panel p-8">

      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-700/60">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Paillier Playground</h1>
          <p className="text-slate-400 text-base max-w-xl">
            Nhập tham số tùy ý để tự tay thực hiện mã hóa và giải mã Paillier từng bước.
          </p>
        </div>
        <button onClick={reset} className="btn-secondary text-sm px-4 py-2 shrink-0">Reset</button>
      </div>

      {/* ── 1. Sinh khóa ── */}
      <SectionCard color="blue" num={1} title="Sinh khóa (Key Generation)">
        <FormulaBox label="Công thức">
          <BlockMath math="N = p \times q \quad g = N+1 \quad \lambda = \text{lcm}(p-1,\,q-1) \quad \mu = \left(L(g^\lambda \bmod N^2)\right)^{-1} \bmod N" />
        </FormulaBox>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <InputField
            label="p — số nguyên tố thứ nhất"
            value={pInput}
            onChange={setPInput}
            placeholder="VD: 17"
            hint="Phải là số nguyên tố"
          />
          <InputField
            label="q — số nguyên tố thứ hai"
            value={qInput}
            onChange={setQInput}
            placeholder="VD: 19"
            hint="Phải là số nguyên tố, khác p"
          />
        </div>

        {keyError && <div className="mb-4"><ErrorMsg msg={keyError} /></div>}

        <button
          onClick={handleGenKey}
          disabled={!pInput || !qInput}
          className="btn-primary px-6 py-3 rounded-xl disabled:opacity-40"
        >
          Sinh khóa
        </button>

        {keys && (
          <div className="mt-5 grid md:grid-cols-2 gap-4 animate-fade-in">
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-5 space-y-3">
              <p className="text-xs uppercase tracking-widest text-blue-400 font-bold">Public Key</p>
              <div className="space-y-2">
                <div className="text-base text-slate-300">
                  <InlineMath math={`N = ${pInput} \\times ${qInput} = ${keys.n.toString()}`} />
                </div>
                <div className="text-base text-slate-300">
                  <InlineMath math={`N^2 = ${keys.nSq.toString()}`} />
                </div>
                <div className="text-base text-slate-300">
                  <InlineMath math={`g = N + 1 = ${keys.g.toString()}`} />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-600/50 bg-slate-800/30 p-5 space-y-3">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Private Key</p>
              <div className="space-y-2">
                <div className="text-base text-slate-300">
                  <InlineMath math={`\\lambda = \\text{lcm}(${(BigInt(pInput)-1n).toString()},\\,${(BigInt(qInput)-1n).toString()}) = ${keys.lambda.toString()}`} />
                </div>
                <div className="text-base text-slate-300">
                  <InlineMath math={`\\mu = ${keys.mu.toString()}`} />
                </div>
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── 2. Mã hóa ── */}
      {keys && (
        <SectionCard color="green" num={2} title="Mã hóa (Encryption)">
          <FormulaBox
            label="Công thức"
            note={<>r phải nguyên tố cùng nhau với N &nbsp;·&nbsp; m phải trong khoảng <InlineMath math={`[0,\\, ${keys.n - 1n}]`} /></>}
          >
            <BlockMath math="C = g^m \times r^N \pmod{N^2}" />
          </FormulaBox>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <InputField
              label="m — plaintext (giá trị cần mã hóa)"
              value={mInput}
              onChange={setMInput}
              placeholder={`0 đến ${keys.n - 1n}`}
            />
            <InputField
              label="r — số ngẫu nhiên"
              value={rInput}
              onChange={setRInput}
              placeholder={`2 đến ${keys.n - 1n}`}
              hint="gcd(r, N) = 1"
            />
          </div>

          {encError && <div className="mb-4"><ErrorMsg msg={encError} /></div>}

          <button
            onClick={handleEncrypt}
            disabled={!mInput || !rInput}
            className="btn-primary px-6 py-3 rounded-xl disabled:opacity-40"
          >
            Mã hóa
          </button>

          {encResult && (
            <div className="mt-5 p-5 rounded-xl bg-slate-950/50 border border-green-500/30 space-y-3 animate-fade-in">
              <div className="text-base text-slate-300">
                <InlineMath math={`g^m = ${keys.g}^{${mInput}} \\bmod N^2 = ${encResult.gm.toString()}`} />
              </div>
              <div className="text-base text-slate-300">
                <InlineMath math={`r^N = ${rInput}^{${keys.n}} \\bmod N^2 = ${encResult.rn.toString()}`} />
              </div>
              <div className="pt-3 border-t border-slate-800">
                <div className="text-lg font-semibold text-green-400">
                  <InlineMath math={`C = g^m \\times r^N \\bmod N^2 = ${encResult.C.toString()}`} />
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {/* ── 3. Giải mã ── */}
      {keys && (
        <SectionCard color="orange" num={3} title="Giải mã (Decryption)">
          <FormulaBox
            label="Công thức"
            note={<>trong đó <InlineMath math="L(u) = \dfrac{u-1}{N}" /></>}
          >
            <BlockMath math="m = L\!\left(C^{\,\lambda} \bmod N^2\right) \times \mu \pmod{N}" />
          </FormulaBox>

          <div className="mb-4">
            <InputField
              label="C — ciphertext cần giải mã"
              value={cInput}
              onChange={setCInput}
              placeholder="Nhập ciphertext hoặc dùng kết quả mã hóa ở trên"
            />
          </div>

          {decError && <div className="mb-4"><ErrorMsg msg={decError} /></div>}

          <button
            onClick={handleDecrypt}
            disabled={!cInput}
            className="btn-primary px-6 py-3 rounded-xl disabled:opacity-40"
          >
            Giải mã
          </button>

          {decResult && (
            <div className="mt-5 space-y-4 animate-fade-in">
              <div className="p-5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
                <div className="text-base text-slate-300">
                  <InlineMath math={`u = C^{\\lambda} \\bmod N^2 = ${decResult.u.toString()}`} />
                </div>
                <div className="text-base text-slate-300">
                  <InlineMath math={`L(u) = \\dfrac{u - 1}{N} = ${decResult.lVal.toString()}`} />
                </div>
                <div className="text-base text-slate-300">
                  <InlineMath math={`m = L(u) \\times \\mu \\bmod N = ${decResult.lVal} \\times ${keys.mu} \\bmod ${keys.n}`} />
                </div>
              </div>

              <div className="rounded-2xl border border-orange-500/40 bg-orange-500/5 p-6 text-center shadow-[0_0_30px_rgba(249,115,22,0.1)]">
                <p className="text-sm uppercase tracking-widest text-orange-400/70 font-semibold mb-3">Kết quả giải mã</p>
                <div className="text-7xl font-black text-orange-400 drop-shadow-[0_0_25px_rgba(249,115,22,0.5)] mb-3">
                  {decResult.m.toString()}
                </div>
                {encResult && (
                  <p className="text-slate-400 text-sm">
                    Plaintext ban đầu: <span className="text-white font-bold">{mInput}</span>
                    {decResult.m.toString() === mInput
                      ? <span className="ml-2 text-green-400">— Khớp chính xác</span>
                      : <span className="ml-2 text-red-400">— Không khớp</span>
                    }
                  </p>
                )}
              </div>
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
