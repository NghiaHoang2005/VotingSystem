"use client";

import { useState } from "react";
import axios from "axios";

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [publicKey, setPublicKey] = useState<{ n: string; g: string } | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setStatus("Đang gọi Authority Server để sinh khóa...");
    try {
      // Setup using Voting Server's Proxy
      await axios.post("http://localhost:8080/api/admin/setup");
      setStatus("Authority Server đã sinh khóa an toàn.");

      // Fetch Public Key from Voting Server
      const res = await axios.get("http://localhost:8080/api/keys/public");
      setPublicKey(res.data);
      setStatus("Setup hoàn tất! Voting Server đã sẵn sàng nhận phiếu.");
    } catch (e) {
      setStatus("Lỗi: Không thể kết nối tới các máy chủ. Hãy đảm bảo VotingServer(8080) và AuthorityServer(8081) đang chạy.");
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl glass-panel p-8">
      <h1 className="text-3xl font-bold mb-6 gradient-text">Khởi tạo Cuộc Bầu Cử</h1>
      <p className="text-slate-300 mb-6">
        Hệ thống sử dụng Kiến trúc 2 Máy chủ: <br/>
        - <b>Key Authority Server (Port 8081):</b> Nơi nắm giữ Private Key an toàn tuyệt đối.<br/>
        - <b>Voting Server (Port 8080):</b> Chỉ nắm Public Key, nhận và đếm phiếu đồng cấu.
      </p>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full btn-primary py-4 text-xl font-bold rounded-xl mb-4"
      >
        {loading ? "Đang xử lý..." : "Khởi tạo Cuộc bầu cử (Sinh khóa)"}
      </button>

      {status && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-300 text-sm">
          {status}
        </div>
      )}

      {publicKey && (
        <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-blue-500">
          <h3 className="font-bold text-blue-400 mb-2">Public Key (từ Voting Server)</h3>
          <div className="text-xs text-slate-400 font-mono break-all max-h-32 overflow-y-auto">
            N: {publicKey.n}
          </div>
        </div>
      )}
    </div>
  );
}
