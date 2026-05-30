"use client";

import { useState } from "react";
import { encrypt } from "@/utils/paillier";

export default function SimulatePage() {
  const [step, setStep] = useState(0);
  const [keys, setKeys] = useState<{n: string, g: string, lambda: string, mu: string} | null>(null);
  
  const [voteA, setVoteA] = useState(1n); // YES
  const [voteB, setVoteB] = useState(0n); // NO
  
  // Variables for step 2 details
  const [rA, setRA] = useState(0n);
  const [rB, setRB] = useState(0n);
  const [cA, setCA] = useState("");
  const [cB, setCB] = useState("");
  
  // Variables for step 3 details
  const [cSum, setCSum] = useState("");
  
  const [finalResult, setFinalResult] = useState("");

  const runStep = (nextStep: number) => {
    if (nextStep === 1) {
      // Step 1: Sinh key cục bộ với số nhỏ để demo
      // Chúng ta sử dụng p=7, q=11, n=77, n^2=5929
      const p = 7n;
      const q = 11n;
      const n = p * q; // 77
      const g = n + 1n; // 78
      const lambda = ((p - 1n) * (q - 1n)); // 60
      
      setKeys({
        n: "77", 
        g: "78",
        lambda: "30",
        mu: "18"
      });
    } else if (nextStep === 2) {
      if (!keys) return;
      const n = BigInt(keys.n);
      const nSq = n * n;
      const g = BigInt(keys.g);
      
      // Random r (must be < n and coprime to n)
      const r_A = 4n;
      const r_B = 5n;
      
      setRA(r_A);
      setRB(r_B);
      
      const modPow = (base: bigint, exp: bigint, mod: bigint) => {
        let res = 1n;
        base = base % mod;
        while (exp > 0n) {
          if (exp % 2n === 1n) res = (res * base) % mod;
          exp = exp / 2n;
          base = (base * base) % mod;
        }
        return res;
      };
      
      const c_A = (modPow(g, voteA, nSq) * modPow(r_A, n, nSq)) % nSq;
      const c_B = (modPow(g, voteB, nSq) * modPow(r_B, n, nSq)) % nSq;
      
      setCA(c_A.toString());
      setCB(c_B.toString());

    } else if (nextStep === 3) {
      if (!keys) return;
      const nSq = BigInt(keys.n) ** 2n;
      const cA_big = BigInt(cA);
      const cB_big = BigInt(cB);
      
      // Homomorphic addition is multiplication of ciphertexts mod n^2
      const sum = (cA_big * cB_big) % nSq;
      setCSum(sum.toString());
      
    } else if (nextStep === 4) {
      if (!keys) return;
      // D(c) = L(c^lambda mod n^2) * mu mod n
      const sum_big = BigInt(cSum);
      
      const modPow = (base: bigint, exp: bigint, mod: bigint) => {
        let res = 1n;
        base = base % mod;
        while (exp > 0n) {
          if (exp % 2n === 1n) res = (res * base) % mod;
          exp = exp / 2n;
          base = (base * base) % mod;
        }
        return res;
      };
      
      const n = BigInt(keys.n);
      const nSq = n * n;
      const lambda = BigInt(keys.lambda);
      const mu = BigInt(keys.mu);
      
      const u = modPow(sum_big, lambda, nSq);
      const l = (u - 1n) / n;
      const result = (l * mu) % n;
      
      setFinalResult(result.toString());
    }
    setStep(nextStep);
  };

  const reset = () => {
    setStep(0); setKeys(null); setCA(""); setCB(""); setCSum(""); setFinalResult("");
  };

  const ArrowDown = () => (
    <div className="flex justify-center my-4 animate-bounce text-slate-400">
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
    </div>
  );

  return (
    <div className="w-full max-w-6xl glass-panel p-8">
      <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
        <h1 className="text-4xl font-bold gradient-text">Mô phỏng Thuật toán Paillier</h1>
        <button onClick={reset} className="btn-secondary text-sm px-4 py-2">Reset Lại</button>
      </div>

      <div className="mb-6 text-slate-300">
        Phần này tập trung minh họa cách toán học đằng sau mã hóa đồng cấu Paillier hoạt động. Các con số được làm nhỏ lại (p=7, q=11) để bạn có thể tự tính nhẩm dễ dàng.
      </div>

      <div className="flex gap-4 justify-center mb-10 overflow-x-auto pb-4">
        {[1, 2, 3, 4].map((s) => (
          <button 
            key={s} 
            onClick={() => s === step + 1 ? runStep(s) : null}
            disabled={s > step + 1}
            className={`px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap ${
              step >= s ? "bg-blue-600 text-white" : s === step + 1 ? "bg-primary text-white animate-pulse" : "bg-slate-800 text-slate-500"
            }`}
          >
            Bước {s}: {
              s === 1 ? "Sinh khóa" : 
              s === 2 ? "Mã hóa Phiếu" : 
              s === 3 ? "Cộng Đồng Cấu" : "Giải Mã Kết Quả"
            }
          </button>
        ))}
      </div>

      <div className="relative">
        
        {/* STEP 1: KEY GEN */}
        {step >= 1 && keys && (
          <div className="glass-panel p-6 bg-slate-800/50 border-l-4 border-l-blue-500 mb-4">
            <h2 className="text-xl font-bold text-blue-400 mb-4">1. Sinh khóa Paillier (Key Generation)</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-blue-500/30">
                <h3 className="font-bold text-slate-300 mb-2">Thông số ban đầu:</h3>
                <ul className="text-sm text-slate-400 space-y-1 font-mono">
                  <li>Chọn p = 7</li>
                  <li>Chọn q = 11</li>
                  <li>N = p * q = 7 * 11 = <span className="text-blue-400 font-bold">{keys.n}</span></li>
                  <li>N^2 = {keys.n}^2 = <span className="text-blue-400 font-bold">{BigInt(keys.n) * BigInt(keys.n)}</span></li>
                </ul>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-purple-500/30">
                <h3 className="font-bold text-slate-300 mb-2">Public Key & Private Key:</h3>
                <ul className="text-sm text-slate-400 space-y-1 font-mono">
                  <li>g = N + 1 = <span className="text-blue-400 font-bold">{keys.g}</span></li>
                  <li>λ (lambda) = lcm(p-1, q-1) = lcm(6, 10) = <span className="text-purple-400 font-bold">{keys.lambda}</span></li>
                  <li>μ (mu) = (L(g^λ mod N^2))^-1 mod N = <span className="text-purple-400 font-bold">{keys.mu}</span></li>
                  <li className="mt-2 text-white">Public Key: (N={keys.n}, g={keys.g})</li>
                  <li className="text-white">Private Key: (λ={keys.lambda}, μ={keys.mu})</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {step >= 1 && <ArrowDown />}

        {/* STEP 2: VOTING */}
        {step >= 2 && keys && (
          <div className="glass-panel p-6 bg-slate-800/50 border-l-4 border-l-green-500 mb-4">
            <h2 className="text-xl font-bold text-green-400 mb-4">2. Mã hóa từng phiếu (Encryption)</h2>
            <p className="text-sm text-slate-400 mb-4">
              Công thức: <code className="bg-slate-900 px-2 py-1 rounded text-green-300">C = (g^m * r^N) mod N^2</code><br/>
              Trong đó m là phiếu (1 hoặc 0), r là số ngẫu nhiên ngụy tạo.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-green-500/30">
                <h3 className="font-bold text-white mb-2">Phiếu A (m = {voteA})</h3>
                <div className="text-sm font-mono text-slate-400 space-y-2">
                  <div>Chọn số ngẫu nhiên r = {rA.toString()}</div>
                  <div className="text-green-300">
                    C_A = ({keys.g}^{voteA} * {rA.toString()}^{keys.n}) mod {BigInt(keys.n)**2n}
                  </div>
                  <div className="text-white font-bold text-lg bg-slate-950 p-2 rounded">
                    C_A = {cA}
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded-xl border border-green-500/30">
                <h3 className="font-bold text-white mb-2">Phiếu B (m = {voteB})</h3>
                <div className="text-sm font-mono text-slate-400 space-y-2">
                  <div>Chọn số ngẫu nhiên r = {rB.toString()}</div>
                  <div className="text-green-300">
                    C_B = ({keys.g}^{voteB} * {rB.toString()}^{keys.n}) mod {BigInt(keys.n)**2n}
                  </div>
                  <div className="text-white font-bold text-lg bg-slate-950 p-2 rounded">
                    C_B = {cB}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step >= 2 && <ArrowDown />}

        {/* STEP 3: HOMOMORPHIC ADDITION */}
        {step >= 3 && keys && (
          <div className="glass-panel p-6 bg-slate-800/50 border-l-4 border-l-purple-500 mb-4">
            <h2 className="text-xl font-bold text-purple-400 mb-4">3. Phép cộng Đồng cấu (Homomorphic Addition)</h2>
            <p className="text-sm text-slate-400 mb-4">
              Để cộng hai phiếu (m_A + m_B) khi chúng đang bị mã hóa, ta chỉ cần nhân hai bản mã với nhau theo module N^2.<br/>
              Công thức: <code className="bg-slate-900 px-2 py-1 rounded text-purple-300">C_Sum = (C_A * C_B) mod N^2</code>
            </p>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-purple-500/30 text-center font-mono">
              <div className="text-slate-400 mb-2">
                C_Sum = ({cA} * {cB}) mod {BigInt(keys.n)**2n}
              </div>
              <div className="text-2xl font-black text-purple-400 bg-slate-950 p-3 rounded">
                C_Sum = {cSum}
              </div>
            </div>
          </div>
        )}

        {step >= 3 && <ArrowDown />}

        {/* STEP 4: DECRYPTION */}
        {step >= 4 && keys && (
          <div className="glass-panel p-6 bg-slate-800/50 border-l-4 border-l-orange-500 mb-4">
            <h2 className="text-xl font-bold text-orange-400 mb-4">4. Giải mã kết quả (Decryption)</h2>
            <p className="text-sm text-slate-400 mb-4">
              Sử dụng Private Key (λ, μ) để giải mã C_Sum. Kết quả sẽ tự động bằng (m_A + m_B).<br/>
              Công thức: <code className="bg-slate-900 px-2 py-1 rounded text-orange-300">m = L(C_Sum^λ mod N^2) * μ mod N</code>
            </p>
            <div className="bg-slate-900/80 p-6 rounded-xl border border-orange-500/30 text-center font-mono">
              <div className="text-slate-400 mb-4">
                L(u) = (u - 1) / N<br/>
                m = L({cSum}^{keys.lambda} mod {BigInt(keys.n)**2n}) * {keys.mu} mod {keys.n}
              </div>
              <div className="text-4xl font-black text-green-400 bg-slate-950 p-4 rounded border border-green-500/50 inline-block shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                Kết quả tổng: {finalResult}
              </div>
              <div className="mt-4 text-white text-sm">
                (Thực tế: Phiếu A ({voteA}) + Phiếu B ({voteB}) = {voteA + voteB})
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
