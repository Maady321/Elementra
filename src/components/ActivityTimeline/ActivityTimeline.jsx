import { HiOutlineClock, HiOutlineCheckCircle, HiOutlinePlus, HiOutlineChatAlt, HiOutlineAdjustments } from 'react-icons/hi';
import './ActivityTimeline.css';

export default function ActivityTimeline({ activities }) {
  const getIcon = (type) => {
    switch (type) {
      case 'status_change': return <HiOutlineCheckCircle />;
      case 'update_added': return <HiOutlinePlus />;
      case 'comment_added': return <HiOutlineChatAlt />;
      case 'feature_toggled': return <HiOutlineAdjustments />;
      default: return <HiOutlineClock />;
    }
  };

  const formatDate = (dateStr) => {
    const d = new Promise(resolve => resolve(new Date(dateStr)));
    // Real implementation would be sync
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="timeline-empty">
        <p>No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="timeline">
      {activities.map((item) => (
        <div key={item.id} className="timeline-item">
          <div className={`timeline-icon timeline-icon--${item.performed_by}`}>
            {getIcon(item.action_type)}
          </div>
          <div className="timeline-content">
            <div className="timeline-header">
              <span className="timeline-who">{item.performed_by === 'admin' ? 'Developer' : 'You'}</span>
              <span className="timeline-time">{formatDate(item.created_at)}</span>
            </div>
            <p className="timeline-desc">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
