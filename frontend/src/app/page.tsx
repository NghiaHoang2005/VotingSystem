export default function Home() {
  return (
    <div className="w-full max-w-4xl glass-panel p-10 flex flex-col items-center text-center animate-fade-in">
      <h1 className="text-5xl font-extrabold mb-6 gradient-text">Hệ Thống Bỏ Phiếu Bảo Mật</h1>
      <p className="text-xl text-slate-300 mb-10 max-w-2xl">
        Hệ thống bầu cử phi tập trung, bảo mật bằng mật mã học, sử dụng mã hóa đồng cấu Paillier để đếm phiếu mà không cần giải mã từng lá phiếu.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Featured: Tally Server */}


        {/* Step 1 */}
        <a href="/setup" className="glass-panel p-6 hover:bg-slate-800/50 transition-all cursor-pointer group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/60"></div>
          <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">1. Khởi Tạo Cuộc Bầu Cử</h2>
          <p className="text-slate-400 text-sm">Sinh cặp khóa Paillier 2048-bit. Authority Server nắm Private Key, Voting Server chỉ nhận Public Key.</p>
        </a>

        {/* Step 2 */}
        <a href="/vote" className="glass-panel p-6 hover:bg-slate-800/50 transition-all cursor-pointer group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500/60"></div>
          <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">2. Bỏ Phiếu</h2>
          <p className="text-slate-400 text-sm">Trình duyệt mã hóa lựa chọn bằng Public Key rồi gửi ciphertext lên máy chủ. Máy chủ không biết bạn chọn gì.</p>
        </a>

        {/* Step 3 */}
        <a href="/tally-server" className="glass-panel p-6 hover:bg-slate-800/50 transition-all cursor-pointer group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-purple-500/60"></div>
          <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">3. Tally Server</h2>
          <p className="text-slate-400 text-sm">Voting Server tích lũy các ciphertext bằng phép nhân đồng cấu, tạo ra một bản mã tổng duy nhất mà không giải mã.</p>
        </a>

        {/* Step 4 */}
        <a href="/admin" className="glass-panel p-6 hover:bg-slate-800/50 transition-all cursor-pointer group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-orange-500/60"></div>
          <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">4. Kết Quả Bầu Cử</h2>
          <p className="text-slate-400 text-sm">Authority Server giải mã bản mã tổng để công bố kết quả cuối cùng — mà không cần biết từng phiếu riêng lẻ.</p>
        </a>
      </div>
    </div>
  );
}
