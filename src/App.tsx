import React, { useState, useRef, useEffect } from "react";

const QUESTION = {
  text: "Em que cidade nasceu a lenda do futebol brasileiro Pelé?",
  options: ["Rio de Janeiro", "São Paulo", "Belo Horizonte", "Manaus"],
  correctIndex: 2, // 正确答案按顺序，0-based：Belo Horizonte
};

function App() {
  const [step, setStep] = useState<"quiz" | "wheel">("quiz");
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState(false);

  // 答题界面
  if (step === "quiz") {
    return (
      <div
        style={{
          minHeight: "100dvh",
          width: "100%",
          background: "linear-gradient(180deg, #f99b04 0%, #f7b708 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {/* 大标题 */}
        <div
          style={{
            marginTop: 42,
            fontSize: 44,
            fontWeight: 700,
            textAlign: "center",
            background: "linear-gradient(90deg,#ebaecd 5%,#78f05c 51%,#c8e043 85%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1.21,
            marginBottom: 32,
          }}
        >
          Responda às perguntas e<br />
          entre no processo de ganhar
          <br />
          dinheiro
        </div>

        {/* 问题卡片 */}
        <div
          style={{
            background: "#f8a133",
            borderRadius: 18,
            padding: "32px 28px 28px 28px",
            width: 540,
            maxWidth: "100vw",
            boxShadow: "0 8px 32px rgba(235,148,51,0.13)",
            marginBottom: 28,
            position: "relative",
            color: "white",
          }}
        >
          {/* 进度 */}
          <div
            style={{
              position: "absolute",
              right: 20,
              top: 18,
              fontSize: 20,
              color: "#fff8",
              fontWeight: 500,
            }}
          >
            1/1
          </div>
          {/* 问题 */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 500,
              marginBottom: 32,
              marginRight: 60,
              color: "#fff",
            }}
          >
            {QUESTION.text}
          </div>
          {/* 选项 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {QUESTION.options.map((opt, idx) => (
              <button
                key={opt}
                onClick={() => {
                  setSelected(idx);
                  setTimeout(() => {
                    if (idx === QUESTION.correctIndex) {
                      setStep("wheel");
                    } else {
                      setError(true);
                    }
                  }, 180);
                }}
                style={{
                  background: selected === idx ? "#b0b825" : "#ffeebc",
                  color: selected === idx ? "#fff" : "#e09c52",
                  border: "none",
                  fontSize: 24,
                  fontWeight: 600,
                  padding: "18px 0",
                  borderRadius: 12,
                  boxShadow: selected === idx ? "0 2px 16px 0 #b0b82588" : "0 1.5px 6px 0 #eee2",
                  cursor: "pointer",
                  transition: "all 0.22s",
                }}
              >
                {opt}
              </button>
            ))}
            {/* 错误提示 */}
            {error && <div style={{ color: "#ff4856", marginTop: 8, fontWeight: 500, fontSize: 18 }}>Resposta errada! Tente novamente.</div>}
          </div>
        </div>
        {/* 声明/底部提示 */}
        <div
          style={{
            marginTop: 24,
            width: 540,
            maxWidth: "96vw",
            color: "#fff8",
            background: "rgba(205, 145, 54, 0.12)",
            borderRadius: 10,
            fontSize: 16,
            textAlign: "center",
            padding: "13px 8px",
          }}
        >
          Esta página não faz parte ou está relacionada ao Kwai ou a Kuaishou Technology. Além disso, este site NÃO é endossado pelo Kwai de forma alguma.
        </div>
      </div>
    );
  }

  // 转盘页
  return <TurntablePage />;
}

function TurntablePage() {
  // --- 奖品配置，顺序对应转盘截图（6等分, 从顶部顺时针） ---
  const PRIZES = [
    {
      name: "礼物盒",
      img: "/2025/0cfe4402-b743-463d-b3c3-05af16140905.png",
    },
    {
      name: "表情",
      img: "/2025/1fc43174-ef12-484e-a95a-f02e3a0bfa4c.png",
    },
    {
      name: "NEW Original Galaxy S24+",
      img: "/2025/0100030e-df7e-4ce0-8b5b-1496a638a201.png",
    },
    {
      name: "Samsung Galaxy S24",
      img: "/2025/03be0bb9-e90f-45ca-a884-49716565d1a3.png",
    },
    {
      name: "按钮",
      img: "/2025/6fd1de19-ae35-4047-8101-32b15bd9d770.png",
    },
    {
      name: "5 V car monsters",
      img: "/2025/7f3e5289-7bb1-4cc6-9dd2-2896b3a04ca2.png",
    },
  ];

  const [showRules, setShowRules] = useState(false);
  const [chance, setChance] = useState(3);
  const [rotating, setRotating] = useState(false);
  const [idleRot, setIdleRot] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<null | number>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // sprite帧动画: 10帧，一帧130px。每90ms切一帧
  const [handFrame, setHandFrame] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setHandFrame((f) => (f + 1) % 10);
    }, 88);
    return () => clearInterval(timer);
  }, []);

  // 缓慢自转动画代码同前...
  useEffect(() => {
    if (rotating) return;
    let raf: number;
    const rotateIdle = () => {
      setIdleRot(r => r + 0.05);
      raf = requestAnimationFrame(rotateIdle);
    };
    raf = requestAnimationFrame(rotateIdle);
    return () => cancelAnimationFrame(raf);
  }, [rotating]);

  // 点击抽奖...
  const handleSpin = () => {
    if (rotating || chance === 0) return;
    setRotating(true);
    setResult(null);
    setChance(c => c - 1);
    const prizeIdx = Math.floor(Math.random() * PRIZES.length);
    const finalDeg = 360 * 4 + (360 - prizeIdx * 60) + (Math.random() * 6 - 3);
    setRotation(finalDeg);
    setTimeout(() => {
      setResult(prizeIdx);
      setModalOpen(true);
      setRotating(false);
      setIdleRot(finalDeg % 360);
    }, 3300);
  };

  // 指针图片，可自定义位置和样式
  const POINTER_IMG = "https://ext.same-assets.com/3391139806/1693865979.png";

  // 奖品图随轮盘整体旋转
  const currentWheelDeg = rotating ? rotation : idleRot;

  // 呼吸动画scale
  const [scale, setScale] = useState(1);
  useEffect(() => {
    let t = 0;
    let raf: number;
    const animate = () => {
      t += 0.02;
      // 0.9~1.1之间平滑变化
      setScale(1 + 0.1 * Math.sin(t));
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100vw",
        background: "linear-gradient(180deg, #d842e6 0%, #f8a133 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* 右上角规则入口 */}
      <button
        style={{
          position: "absolute",
          top: 25,
          right: 40,
          background: "#fff",
          color: "#d842e6",
          border: "none",
          borderRadius: 18,
          padding: "6px 22px",
          fontSize: 19,
          fontWeight: 700,
          letterSpacing: "1.1px",
          boxShadow: "0 2px 12px #0002",
          zIndex: 3,
          cursor: "pointer",
        }}
        onClick={() => setShowRules(true)}
        aria-label="Abrir regras"
      >
        Regras
      </button>

      {/* 背景装饰 */}
      <img
        src="https://ext.same-assets.com/3391139806/331132055.png"
        alt="bg"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100dvh",
          objectFit: "cover",
          zIndex: 0,
        }}
      />
      <div style={{ zIndex: 1, marginTop: 74, position: "relative" }}>
        {/* 指针/箭头固定顶部覆盖 */}
        {/* <img
          src={POINTER_IMG}
          alt="pointer"
          style={{
            position: 'absolute',
            left: '50%',
            top: '-38px',
            transform: 'translateX(-50%)',
            zIndex: 11,
            width: 81,
            height: 65,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        /> */}
        <div
          style={{
            background: "url(https://ext.same-assets.com/3391139806/4233627671.png) no-repeat center/90%",
            width: 450,
            height: 520,
            position: "relative",
            marginBottom: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "visible",
          }}
        >
          {/* 轮盘整体旋转层，奖品和主盘同转 */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "46%",
              width: 309,
              height: 309,
              transform: `translate(-50%, -50%) rotate(${currentWheelDeg}deg)`,
              transition: rotating ? "transform 3.1s cubic-bezier(.25,.83,.45,1.01)" : "none",
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            <img
              src="https://ext.same-assets.com/3391139806/2723961238.png"
              alt="wheel"
              width={309}
              height={309}
              style={{ position: "absolute", left: 0, top: 0, userSelect: "none" }}
            />
            {/* 奖品分布图随轮盘转动 */}
            {PRIZES.map((p, i) => {
              const deg = i * 60 - 90 + 30;
              return (
                <img
                  key={p.img}
                  src={p.img}
                  alt={p.name}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: 74,
                    height: 74,
                    transform: `translate(-50%,-50%) rotate(${deg}deg) translateY(-98px)`,
                    filter: result === i && modalOpen ? "drop-shadow(0 0 17px #fff7)" : "",
                    zIndex: 3,
                    transition: "filter .28s",
                    pointerEvents: "none",
                  }}
                />
              );
            })}
          </div>

          {/* 中心奖牌按钮可点击，有手引导（只留一只手，sprite动画） */}
          <button
            style={{
              position: "absolute",
              left: "50%",
              top: "46%",
              transform: `translate(-50%,-50%) scale(${scale})`,
              width: 114,
              height: 114,
              border: "none",
              borderRadius: "50%",
              background: 'url("/2025/6fd1de19-ae35-4047-8101-32b15bd9d770.png") no-repeat center/100%',
              boxShadow: "0 6px 22px #e19638a9",
              cursor: chance === 0 || rotating ? "not-allowed" : "pointer",
              zIndex: 10,
              outline: "none",
              filter: chance === 0 ? "grayscale(1) opacity(0.55)" : "",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "filter 0.17s, border 0.22s",
            }}
            onClick={handleSpin}
            disabled={chance === 0 || rotating}
            aria-label="Começar a girar"
          >
            {/* 剩余次数数字大号显示 */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "23%",
                transform: `translate(-50%, 0) scale(${scale})`,
                color: "#FFF0D5",
                borderRadius: "49%",
                fontSize: 60,
                width: 59,
                height: 59,
                lineHeight: "59px",
                fontWeight: 800,
                textAlign: "center",
                zIndex: 9,
                userSelect: "none",
              }}
            >
              {chance}
            </div>
            {/* <span style={{
              fontWeight: 700, fontSize: 23, color: '#fff', textShadow: '0 2px 8px #eeb546af',
              userSelect: 'none', letterSpacing: 1.3
            }}>
              Girar
            </span> */}
            {/* sprite动画手，10帧，帧宽约130px，高度为全部高度 */}
            <span
              style={{
                position: "absolute",
                left: "110%",
                top: "30%",
                width: 130,
                height: 130,
                transform: "translate(-50%,0)",
                display: "block",
                pointerEvents: "none",
                overflow: "hidden",
                zIndex: 13,
              }}
            >
              <span
                style={{
                  display: "block",
                  width: 1300 /* 10帧Sprite宽度, 图片总宽 */,
                  height: 130,
                  background: `url('/hand-sprite.png') 0 0 no-repeat`,
                  backgroundSize: `1300px 130px`,
                  transform: `translateX(-${handFrame * 130}px)`,
                }}
              />
            </span>
          </button>
        </div>
        {/* 底部声明栏 */}
        <div
          style={{
            marginTop: 18,
            width: 420,
            maxWidth: "92vw",
            color: "#fff8",
            background: "rgba(185, 64, 206, 0.15)",
            borderRadius: 10,
            fontSize: 16,
            textAlign: "center",
            padding: "13px 8px",
          }}
        >
          Esta página não faz parte ou está relacionada ao Kwai ou a Kuaishou Technology. Além disso, este site NÃO é endossado pelo Kwai de forma alguma.
        </div>
      </div>

      {/* 中奖结果弹窗 */}
      {modalOpen && result !== null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(35,15,46,0.42)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 16,
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "40px 32px 28px 32px",
              maxWidth: 320,
              boxShadow: "0 18px 80px #2223",
              textAlign: "center",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 23, fontWeight: 700, color: "#d842e6", marginBottom: 8 }}>Parabéns!</div>
            <div style={{ fontSize: 19, marginBottom: 26, color: "#e09c52" }}>Você ganhou:</div>
            <img
              src={PRIZES[result].img}
              alt="prize"
              style={{ width: 83, height: 83, marginBottom: 12 }}
            />
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 13, color: "#b0b825" }}>{PRIZES[result].name}</div>
            <button
              onClick={() => setModalOpen(false)}
              style={{
                marginTop: 18,
                background: "#d842e6",
                color: "#fff",
                fontWeight: 600,
                fontSize: 18,
                border: "none",
                borderRadius: 10,
                padding: "10px 0",
                width: "100%",
                cursor: "pointer",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* 活动规则弹窗 */}
      {showRules && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100dvh",
            background: "rgba(20,2,38,0.33)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 21,
          }}
          onClick={() => setShowRules(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 12px 54px #0002",
              padding: "32px 28px 20px 28px",
              minWidth: 300,
              maxWidth: "84vw",
              textAlign: "left",
              position: "relative",
              fontSize: 18,
              color: "#d842e6",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 700, fontSize: 22, color: "#e09c52", marginBottom: 12 }}>Regras da Atividade</div>
            <ol style={{ color: "#653b29", fontWeight: 500, paddingLeft: 15 }}>
              <li style={{ marginBottom: 9 }}>Cada participante tem 3 chances para girar o quiz diariamente.</li>
              <li style={{ marginBottom: 9 }}>Responda corretamente para acessar o sorteio do prêmio.</li>
              <li style={{ marginBottom: 9 }}>Os prêmios são distribuídos aleatoriamente e não podem ser trocados por dinheiro.</li>
              <li style={{ marginBottom: 9 }}>Cada conta/dispositivo só pode participar uma vez por campanha.</li>
              <li style={{ marginBottom: 9 }}>Caso haja suspeita de fraude, o prêmio será cancelado.</li>
            </ol>
            <button
              onClick={() => setShowRules(false)}
              style={{
                marginTop: 23,
                background: "#d842e6",
                color: "#fff",
                fontWeight: 600,
                fontSize: 17,
                border: "none",
                borderRadius: 9,
                padding: "8px 0",
                width: "100%",
                cursor: "pointer",
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
