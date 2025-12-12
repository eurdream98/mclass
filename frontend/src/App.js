import { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:8081/api/members"; // 필요 시 환경 변수로 분리

function App() {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMembers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`목록 조회 실패 (${res.status})`);
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      setError(err.message || "목록 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("이름과 이메일을 모두 입력하세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) throw new Error(`등록 실패 (${res.status})`);
      await fetchMembers();
      setName("");
      setEmail("");
    } catch (err) {
      setError(err.message || "등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header>
        <h1>회원 관리</h1>
      </header>

      <section className="card">
        <h2>회원 등록</h2>
        <form onSubmit={handleSubmit} className="form">
          <label>
            이름
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름 입력"
            />
          </label>
          <label>
            이메일
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email 입력"
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "처리 중..." : "등록"}
          </button>
        </form>
      </section>

      <section className="card">
        <div className="card-header">
          <h2>회원 목록</h2>
          <button onClick={fetchMembers} disabled={loading}>
            새로고침
          </button>
        </div>
        {error && <div className="error">{error}</div>}
        {loading && <div>불러오는 중...</div>}
        {!loading && members.length === 0 && <div>회원이 없습니다.</div>}
        {!loading && members.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>이름</th>
                <th>이메일</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.name}</td>
                  <td>{m.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default App;
