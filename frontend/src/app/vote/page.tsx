"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { encrypt } from "@/utils/paillier";

export default function VotePage() {
  const [publicKey, setPublicKey] = useState<{ n: string; g: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [voteCasted, setVoteCasted] = useState(false);
  const [lastCiphertext, setLastCiphertext] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8080/api/keys/public")
      .then(res => setPublicKey(res.data))
      .catch(e => console.error("Chưa setup bầu cử"));
  }, []);

  const handleVote = async (choice: number) => {
    if (!publicKey) return;
    setLoading(true);

    // Encrypt the choice (1 for YES, 0 for NO) locally in browser
    const c = encrypt(BigInt(choice), publicKey.n);
    setLastCiphertext(c);

    try {
      // Gửi ciphertext lên Voting Server — máy chủ sẽ tự tích lũy (cộng đồng cấu)
      await axios.post("http://localhost:8080/api/votes", { ciphertexts: [c] });
      setVoteCasted(true);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (!publicKey) {
    return <div className="text-center p-8 text-xl text-slate-400">Cuộc bầu cử chưa bắt đầu hoặc chưa có Public Key.</div>;
  }

  return (
    <div className="w-full max-w-2xl glass-panel p-8 text-center">
      <h1 className="text-3xl font-bold mb-2 gradient-text">Phiếu Bầu Cử</h1>
      <p className="text-slate-400 mb-8">Bạn có đồng ý thông qua dự luật này không?</p>

      {!voteCasted ? (
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => handleVote(1)}
            disabled={loading}
            className="btn-primary py-4 px-8 text-2xl font-bold rounded-xl bg-green-600 hover:bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] disabled:opacity-50"
          >
            ĐỒNG Ý (YES)
          </button>
          <button
            onClick={() => handleVote(0)}
            disabled={loading}
            className="btn-secondary py-4 px-8 text-2xl font-bold rounded-xl bg-red-900/50 hover:bg-red-800 border-red-500/50 disabled:opacity-50"
          >
            TỪ CHỐI (NO)
          </button>
        </div>
      ) : (
        <div className="bg-slate-900/50 p-6 rounded-xl border border-green-500 text-left">
          <div className="text-center text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-green-400 text-center mb-4">Đã ghi nhận phiếu bầu!</h2>

          <div className="space-y-3 text-sm text-slate-400 mb-4">
            <p>
              Trình duyệt đã mã hóa lựa chọn của bạn thành một chuỗi số ngẫu nhiên (ciphertext) bằng <span className="text-blue-400">Paillier Public Key</span>.
            </p>
            <p>
              Ciphertext này được gửi đến <span className="text-purple-400">Voting Server</span>, nơi nó được <span className="text-purple-400">nhân vào bản mã tổng đang tích lũy</span> (phép cộng đồng cấu). Máy chủ hoàn toàn không biết bạn đã bầu YES hay NO.
            </p>
          </div>

          <div className="mb-1 text-xs text-slate-500">Ciphertext đã gửi:</div>
          <div className="bg-slate-950 p-4 rounded text-xs text-slate-500 font-mono break-all max-h-40 overflow-y-auto border border-slate-800">
            {lastCiphertext}
          </div>

          <div className="mt-4 text-center">
            <button onClick={() => setVoteCasted(false)} className="text-blue-400 hover:text-blue-300 underline text-sm">
              Bầu tiếp (Demo)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
