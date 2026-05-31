export default function Home() {
  return (
    <div className="w-full max-w-4xl glass-panel p-10 flex flex-col items-center text-center animate-fade-in">
      <h1 className="text-5xl font-extrabold mb-6 gradient-text">Next-Gen Secure Voting</h1>
      <p className="text-xl text-slate-300 mb-10 max-w-2xl">
        Experience the future of democracy. A fully decentralized, cryptographically secure election system powered by Threshold Paillier Homomorphic Encryption.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <a href="/tally-server" className="md:col-span-2 glass-panel p-6 hover:bg-slate-800/50 transition-all cursor-pointer group border-blue-500/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors text-blue-400">🔥 Interactive Presentation Demo (Khuyên Dùng)</h2>
          <p className="text-slate-400 text-sm">Giao diện thuyết trình trực quan chia 2 nửa màn hình. Theo dõi trực tiếp quá trình phiếu được mã hóa và cách máy chủ thực hiện phép toán Đồng cấu mù.</p>
        </a>
        <a href="/setup" className="glass-panel p-6 hover:bg-slate-800/50 transition-all cursor-pointer group">
          <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">1. Setup Election</h2>
          <p className="text-slate-400 text-sm">Initialize a 2048-bit Paillier Key and split the private key among trustees (DKG Simulation).</p>
        </a>
        <a href="/vote" className="glass-panel p-6 hover:bg-slate-800/50 transition-all cursor-pointer group">
          <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">2. Cast Vote</h2>
          <p className="text-slate-400 text-sm">Encrypt your vote locally using the Public Key. The server never sees your plaintext choice.</p>
        </a>
        <a href="/admin" className="glass-panel p-6 hover:bg-slate-800/50 transition-all cursor-pointer group">
          <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">3. Tally & Decrypt</h2>
          <p className="text-slate-400 text-sm">Watch the encrypted tally grow. Combine trustee shares to reveal the final results without ever reconstructing the private key.</p>
        </a>
        <a href="/simulate" className="glass-panel p-6 hover:bg-slate-800/50 transition-all cursor-pointer group">
          <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">4. Mathematical Simulation</h2>
          <p className="text-slate-400 text-sm">Step-by-step interactive breakdown of the Homomorphic Encryption and Threshold math.</p>
        </a>
      </div>
    </div>
  );
}
