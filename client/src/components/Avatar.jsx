// components/Avatar.jsx
import { getInitials, getAvatarColor } from '../utils';

export default function Avatar({ name, index = 0, size = 32 }) {
  const { bg, color } = getAvatarColor(index);
  const fontSize = Math.round(size * 0.38);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        fontWeight: 600,
        flexShrink: 0,
        userSelect: 'none',
      }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
