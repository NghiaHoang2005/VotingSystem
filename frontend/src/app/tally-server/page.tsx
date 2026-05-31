"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

export default function TallyServerPage() {
  const [publicKey, setPublicKey] = useState<{ n: string; g: string } | null>(null);
  const [serverCiphertexts, setServerCiphertexts] = useState<string[]>([]);
  const [isTallying, setIsTallying] = useState(false);
  const [encryptedTally, setEncryptedTally] = useState<string | null>(null);
  const [tallyLogs, setTallyLogs] = useState<{time: string, type: string, message: string | React.ReactNode}[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const endOfListRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/votes");
        if (res.data.ciphertexts) {
          setServerCiphertexts(res.data.ciphertexts);
        }
      } catch (e) {
        // silently ignore polling errors
      }
    };
    fetchVotes();
    const interval = setInterval(fetchVotes, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    axios.get("http://localhost:8080/api/keys/public")
      .then(res => setPublicKey(res.data))
      .catch(e => console.error("Chưa setup bầu cử"));
  }, []);

  useEffect(() => {
    if (endOfListRef.current) {
      endOfListRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [serverCiphertexts]);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [tallyLogs]);

  const addLog = (type: string, message: string | React.ReactNode) => {
    const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
    setTallyLogs(prev => [...prev, { time, type, message }]);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    });
  };

  const handleTally = async () => {
    if (serverCiphertexts.length === 0 || !publicKey) return;
    setIsTallying(true);
    setEncryptedTally(null);
    setTallyLogs([]);

    addLog('INFO', 'Khởi tạo quá trình tổng hợp lá phiếu đồng cấu...');
    await new Promise(r => setTimeout(r, 800));
    addLog('INFO', `Tìm thấy tổng cộng: ${serverCiphertexts.length} lá phiếu đã mã hóa trong Cơ sở dữ liệu.`);
    await new Promise(r => setTimeout(r, 800));

    addLog('INFO', <span>Khởi tạo Bản mã tổng ban đầu: <InlineMath math="\mathcal{E}(Total) = \mathcal{E}(Vote_1)" /></span>);

    let acc = serverCiphertexts[0];
    const nSq = BigInt(publicKey.n) * BigInt(publicKey.n);

    for (let i = 1; i < serverCiphertexts.length; i++) {
      await new Promise(r => setTimeout(r, 1200));
      const cNext = serverCiphertexts[i];
      const nextVal = (BigInt(acc) * BigInt(cNext)) % nSq;

      const shortAcc = acc.length > 20 ? acc.substring(0, 8) + '...' + acc.substring(acc.length - 8) : acc;
      const shortNext = cNext.length > 20 ? cNext.substring(0, 8) + '...' + cNext.substring(cNext.length - 8) : cNext;
      const newAccStr = nextVal.toString();
      const shortNew = newAccStr.length > 20 ? newAccStr.substring(0, 8) + '...' + newAccStr.substring(newAccStr.length - 8) : newAccStr;

      addLog('PROCESSING', (
        <div className="flex flex-col ml-4 border-l-2 border-slate-700 pl-4 mt-2 text-slate-300">
          <div>Tích hợp Phiếu #{i + 1}...</div>
          <div className="flex items-center gap-2 mt-2 mb-1 bg-slate-900/50 p-2 rounded-md inline-block border border-slate-700">
            <span className="text-slate-500 mr-2">Thực hiện:</span>
            <InlineMath math={`\\mathcal{E}(Total) = \\mathcal{E}(Total) \\times \\mathcal{E}(Vote_{${i+1}}) \\pmod{N^2}`} />
          </div>
          <div className="text-slate-400 mt-1">Giá trị hiện tại: <span className="font-mono text-purple-400">{shortAcc}</span> × <span className="font-mono text-blue-400">{shortNext}</span></div>
          <div className="text-green-400 mt-1">Bản mã tổng tạm thời: <span className="font-mono">{shortNew}</span></div>
        </div>
      ));

      acc = newAccStr;
    }

    await new Promise(r => setTimeout(r, 1000));
    addLog('SUCCESS', 'Quá trình tính toán đồng cấu hoàn tất!');

    try {
      const res = await axios.get("http://localhost:8080/api/tally/encrypted");
      const finalTallyList = res.data.tally;
      const finalTally = finalTallyList.length > 0 ? finalTallyList[0] : "";
      const shortFinal = finalTally.length > 20 ? finalTally.substring(0, 15) + '...' + finalTally.substring(finalTally.length - 15) : finalTally;

      await new Promise(r => setTimeout(r, 500));
      addLog('RESULT', `Bản mã tổng cuối cùng (Encrypted Sum): ${shortFinal}`);
      addLog('INFO', 'Đã lưu Bản mã Tổng vào Database. Chờ Authority Server tiếp nhận...');
      setEncryptedTally(finalTally);

    } catch (e: any) {
      console.error(e);
      addLog('ERROR', 'Lỗi khi gọi API Tally');
    }
    setIsTallying(false);
  };

  if (!publicKey) {
    return <div className="text-center p-8 mt-20 text-xl text-slate-400">Đang tải Public Key...</div>;
  }

  return (
    <div className="w-full max-w-4xl glass-panel p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Máy Chủ Đếm Phiếu (Voting Server)</h1>
        <p className="text-slate-400 text-sm">
          Chỉ xử lý cộng dồn Đồng cấu. <b className="text-white">KHÔNG</b> có Private Key để giải mã.{" "}
          <span className="text-green-400 animate-pulse inline-block">● Đang liên tục đồng bộ dữ liệu (Polling)...</span>
        </p>
      </div>

      {/* Database Table */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-700 mb-6 overflow-hidden">
        <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
          <span className="font-bold text-slate-300 font-mono">DATABASE: votes_table</span>
          <span className="bg-purple-900/50 text-purple-300 px-3 py-1 rounded-full text-xs border border-purple-500/30">
            {serverCiphertexts.length} records
          </span>
        </div>

        <div className="max-h-64 overflow-y-auto p-4 space-y-2 font-mono text-sm">
          {serverCiphertexts.length === 0 ? (
            <div className="text-slate-600 text-center py-10 text-base">Đang chờ cử tri gửi phiếu...</div>
          ) : (
            serverCiphertexts.map((ct, idx) => (
              <div key={idx} className="animate-fade-in flex items-center gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800/50 hover:border-slate-700 group">
                <span className="text-purple-400 font-bold shrink-0">[{idx + 1}]</span>
                <span className="text-slate-400 truncate flex-1" title={ct}>
                  {ct.substring(0, 40)}...{ct.substring(ct.length - 10)}
                </span>
                <button
                  onClick={() => handleCopy(ct, idx)}
                  title="Copy full ciphertext"
                  className={`shrink-0 px-3 py-1 rounded-md text-xs font-semibold transition-all border ${
                    copiedIdx === idx
                      ? "bg-green-900/50 border-green-500/50 text-green-400"
                      : "bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {copiedIdx === idx ? "✓ Copied" : "Copy"}
                </button>
              </div>
            ))
          )}
          <div ref={endOfListRef} />
        </div>
      </div>

      {/* Tally Button */}
      <button
        onClick={handleTally}
        disabled={isTallying || serverCiphertexts.length === 0}
        className="w-full btn-primary py-4 text-xl font-bold rounded-xl mb-6 shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50"
      >
        {isTallying ? "Đang xử lý đồng cấu..." : "▶ Bắt đầu Tally Đồng Cấu Từng Bước"}
      </button>

      {/* Terminal Log */}
      {(isTallying || encryptedTally || tallyLogs.length > 0) && (
        <div className="bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden animate-fade-in">
          <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-green-400 font-mono flex items-center gap-2">
              <span className="animate-pulse font-black">_</span> TALLY TERMINAL
            </h3>
            <button
              onClick={() => { setEncryptedTally(null); setTallyLogs([]); }}
              className="text-slate-400 hover:text-white px-3 py-1 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors border border-slate-600 text-sm"
            >
              Đóng
            </button>
          </div>

          <div className="p-4 max-h-80 overflow-y-auto space-y-3 font-mono text-sm">
            {tallyLogs.map((log, idx) => (
              <div key={idx} className="animate-fade-in flex items-start gap-3">
                <span className="text-slate-600 shrink-0">[{log.time}]</span>
                <span className={`shrink-0 font-bold ${
                  log.type === 'INFO' ? 'text-blue-400' :
                  log.type === 'PROCESSING' ? 'text-yellow-400' :
                  log.type === 'SUCCESS' ? 'text-green-400' :
                  log.type === 'RESULT' ? 'text-purple-400' : 'text-red-400'
                }`}>[{log.type}]</span>
                <div className="text-slate-300 flex-1 overflow-hidden">{log.message}</div>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}
