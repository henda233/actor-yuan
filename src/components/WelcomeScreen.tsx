interface WelcomeScreenProps {
  onStartConfig: () => void;
}

export default function WelcomeScreen({ onStartConfig }: WelcomeScreenProps) {
  return (
    <div className="welcome-screen">
      <div className="welcome-card">
        <h1 className="welcome-title">ActorYuan</h1>
        <p className="welcome-subtitle">AI 跑团主持人</p>
        <p className="welcome-desc">
          基于大语言模型的桌面角色扮演游戏（TRPG）交互主持人。
          在开始冒险之前，请先配置 AI 服务。
        </p>
        <button type="button" className="btn btn-confirm welcome-btn" onClick={onStartConfig}>
          开始配置
        </button>
      </div>
    </div>
  );
}
