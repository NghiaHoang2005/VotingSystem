"use client";

import { useState } from "react";
import axios from "axios";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ encrypted_tally: string, final_yes_votes: string, total_ballots: number } | null>(null);
  const [error, setError] = useState("");

  const handleTally = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:8080/api/admin/tally");
      setResult(res.data);
    } catch (e: any) {
      setError(e.response?.data || "Chưa có phiếu bầu hoặc lỗi kết nối.");
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-4xl glass-panel p-8">
      <h1 className="text-3xl font-bold mb-6 gradient-text">Kiểm Phiếu (Admin Dashboard)</h1>
      
      <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 mb-8">
        <h2 className="text-xl font-bold text-white mb-2">Quy trình Đếm phiếu An toàn</h2>
        <ol className="list-decimal ml-6 text-slate-400 space-y-2 text-sm">
          <li>Voting Server cộng dồn tất cả các Ciphertext bằng phép Nhân đồng cấu.</li>
          <li>Voting Server gửi Ciphertext Tổng duy nhất sang Key Authority Server (Port 8081).</li>
          <li>Key Authority Server dùng Private Key giải mã ra kết quả và gửi lại.</li>
        </ol>
      </div>

      <button
        onClick={handleTally}
        disabled={loading}
        className="w-full btn-primary py-4 text-xl font-bold rounded-xl mb-6 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
      >
        {loading ? "Đang xử lý đồng cấu & giải mã..." : "Chốt Sổ & Kiểm Phiếu"}
      </button>

      {error && <div className="text-red-400 p-4 bg-red-900/20 rounded-xl mb-4 border border-red-500/30">{error}</div>}

      {result && (
        <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
          <div className="bg-purple-900/20 p-6 rounded-xl border border-purple-500/50">
            <h3 className="font-bold text-purple-400 mb-4">Dữ liệu tại Voting Server</h3>
            <div className="mb-2">
              <span className="text-slate-400 text-sm">Tổng số phiếu đã nhận: </span>
              <span className="text-white font-bold">{result.total_ballots} phiếu</span>
            </div>
            <div>
              <span className="text-slate-400 text-sm block mb-1">Encrypted Tally (Tổng đã mã hóa):</span>
              <div className="bg-slate-950 p-3 rounded text-xs text-purple-300/50 font-mono break-all max-h-32 overflow-y-auto border border-purple-900">
                {result.encrypted_tally}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-600 flex flex-col justify-center items-center text-center">
            <h3 className="font-bold text-white mb-6">Kết quả từ Authority Server</h3>
            <div className="flex w-full gap-4">
              <div className="flex-1 bg-green-900/20 border border-green-500/50 rounded-xl p-4 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                <div className="text-xs text-green-400/80 mb-2 uppercase font-bold tracking-wider">Phiếu YES</div>
                <div className="text-6xl font-black text-green-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.6)]">
                  {result.final_yes_votes}
                </div>
              </div>
              
              <div className="flex-1 bg-red-900/20 border border-red-500/50 rounded-xl p-4 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                <div className="text-xs text-red-400/80 mb-2 uppercase font-bold tracking-wider">Phiếu NO</div>
                <div className="text-6xl font-black text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]">
                  {result.total_ballots - parseInt(result.final_yes_votes)}
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-slate-400 text-sm">
              Tổng số người đã tham gia bỏ phiếu: <b className="text-white">{result.total_ballots}</b>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
